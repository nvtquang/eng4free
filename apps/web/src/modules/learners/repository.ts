import { randomUUID } from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import { createDatabase, type Database } from "@/db/client";
import { learnerLinks, learners } from "@/db/schema";
import { mergeLearners } from "./merge";

export type LinkKind = "USER" | "GUEST";

export async function findLinkedLearner(db: Database, kind: LinkKind, externalId: string): Promise<string | null> {
  const [row] = await db.select({ learnerId: learnerLinks.learnerId }).from(learnerLinks).where(and(eq(learnerLinks.kind, kind), eq(learnerLinks.externalId, externalId))).limit(1);
  return row?.learnerId ?? null;
}

/** Creates a learner with one link, or returns the learner that another request linked first. */
export async function createLinkedLearner(db: Database, kind: LinkKind, externalId: string): Promise<string> {
  const learnerId = randomUUID();
  await db.insert(learners).values({ id: learnerId });
  const inserted = await db.insert(learnerLinks).values({ kind, externalId, learnerId }).onConflictDoNothing().returning({ learnerId: learnerLinks.learnerId });
  if (inserted.length) return learnerId;
  await db.delete(learners).where(eq(learners.id, learnerId));
  return (await findLinkedLearner(db, kind, externalId))!;
}

/** Records that the learner is active, at most once an hour; retention removes guests who stop coming back. */
export async function touchLearner(db: Database, learnerId: string): Promise<void> {
  await db.update(learners).set({ lastSeenAt: new Date() }).where(and(eq(learners.id, learnerId), lt(learners.lastSeenAt, sql`now() - interval '1 hour'`)));
}

export async function addLink(db: Database, kind: LinkKind, externalId: string, learnerId: string): Promise<void> {
  await db.insert(learnerLinks).values({ kind, externalId, learnerId }).onConflictDoUpdate({ target: [learnerLinks.kind, learnerLinks.externalId], set: { learnerId } });
}

/**
 * Called on sign-in. If the account has no learner yet, the browser's guest learner simply
 * becomes the account's learner (a new link, no data moves). If both already exist, the
 * guest learner's data is merged into the account's learner.
 */
export async function linkAccountOnSignIn(userId: string, guestId: string | null): Promise<string | null> {
  const db = createDatabase();
  if (!db) return null;
  const accountLearner = await findLinkedLearner(db, "USER", userId);
  const guestLearner = guestId ? await findLinkedLearner(db, "GUEST", guestId) : null;
  if (!accountLearner && guestLearner) { await addLink(db, "USER", userId, guestLearner); return guestLearner; }
  if (!accountLearner) return createLinkedLearner(db, "USER", userId);
  if (guestLearner && guestLearner !== accountLearner) await mergeLearners(db, guestLearner, accountLearner);
  return accountLearner;
}
