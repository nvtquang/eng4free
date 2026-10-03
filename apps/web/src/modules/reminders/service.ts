import { and, eq, isNotNull } from "drizzle-orm";
import type { Database } from "@/db/client";
import { learnerLinks, reminderPreferences, users } from "@/db/schema";
import { captureError, captureEvent } from "@/lib/observability";
import { siteUrl } from "@/lib/metadata";
import { sendEmail } from "@/modules/email/send";
import { projectProgress } from "@/modules/progress/progress";
import { listProgressEvents } from "@/modules/progress/repository";
import { buildTodayPlan } from "@/modules/today/recommendations";
import { reminderMessage } from "./message";
import { decideReminder } from "./schedule";
import { oneClickUnsubscribeUrl, unsubscribeUrl } from "./unsubscribe";

export type ReminderRun = { checked: number; sent: number; failed: number };

/** The learner's saved choice, or the default (off, 19:00) when they have not chosen yet. */
export async function getReminderPreference(db: Database, userId: string) {
  const [row] = await db.select().from(reminderPreferences).where(eq(reminderPreferences.userId, userId));
  return row ? { enabled: row.enabled, hour: row.hour, saved: true } : { enabled: false, hour: 19, saved: false };
}

export async function saveReminderPreference(db: Database, userId: string, input: { enabled: boolean; hour: number }) {
  const now = new Date();
  await db.insert(reminderPreferences).values({ userId, enabled: input.enabled, hour: input.hour, updatedAt: now })
    .onConflictDoUpdate({ target: reminderPreferences.userId, set: { enabled: input.enabled, hour: input.hour, updatedAt: now } });
}

export async function disableReminders(db: Database, userId: string) {
  await db.update(reminderPreferences).set({ enabled: false, updatedAt: new Date() }).where(eq(reminderPreferences.userId, userId));
}

/**
 * Sends the reminders that are due at `now` (run it every hour). Each account that turned
 * reminders on gets at most one email a day, at its chosen hour, following decideReminder.
 */
export async function sendDueReminders(db: Database, now = new Date()): Promise<ReminderRun> {
  const accounts = await db.select({ userId: users.id, email: users.email, hour: reminderPreferences.hour, lastSentAt: reminderPreferences.lastSentAt, enabledAt: reminderPreferences.updatedAt })
    .from(reminderPreferences).innerJoin(users, eq(reminderPreferences.userId, users.id))
    .where(and(eq(reminderPreferences.enabled, true), isNotNull(users.email)));
  const run: ReminderRun = { checked: accounts.length, sent: 0, failed: 0 };
  const base = siteUrl();

  for (const account of accounts) {
    try {
      const [link] = await db.select({ learnerId: learnerLinks.learnerId }).from(learnerLinks).where(and(eq(learnerLinks.kind, "USER"), eq(learnerLinks.externalId, account.userId))).limit(1);
      const events = link ? await listProgressEvents({ learnerId: link.learnerId }) : [];
      const lastActivity = events.reduce<Date | null>((latest, event) => !latest || event.occurredAt > latest ? event.occurredAt : latest, null);
      const kind = decideReminder({ now, hour: account.hour, lastSentAt: account.lastSentAt, lastActivity, enabledAt: account.enabledAt });
      if (!kind) continue;

      const plan = link ? await buildTodayPlan({ learnerId: link.learnerId }, now) : null;
      const message = reminderMessage({
        kind,
        streakDays: projectProgress(events, now).streakDays,
        minutesGoal: plan?.minutesGoal ?? null,
        wordsDue: plan?.vocabularyDue ?? 0,
        mistakesDue: plan?.mistakesDue ?? 0,
        nextLesson: plan?.nextLesson?.title ?? null,
        todayUrl: new URL("/today", base).toString(),
        unsubscribeUrl: unsubscribeUrl(base, account.userId)
      });
      const oneClick = oneClickUnsubscribeUrl(base, account.userId);
      await sendEmail({
        to: account.email!, ...message, kind: "reminder",
        headers: { "List-Unsubscribe": `<${oneClick}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        outboxData: { reminderKind: kind, unsubscribeUrl: unsubscribeUrl(base, account.userId), oneClickUrl: oneClick }
      });
      await db.update(reminderPreferences).set({ lastSentAt: now }).where(eq(reminderPreferences.userId, account.userId));
      await captureEvent({ name: "reminder_sent", properties: { kind } });
      run.sent += 1;
    } catch (error) {
      run.failed += 1;
      await captureError(error, { source: "reminders" });
    }
  }
  return run;
}
