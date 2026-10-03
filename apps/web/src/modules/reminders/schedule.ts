/** Reminders follow the learner's day in Vietnam. */
export const REMINDER_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type ReminderKind = "keep-streak" | "daily" | "come-back";

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: REMINDER_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const hourFormat = new Intl.DateTimeFormat("en-GB", { timeZone: REMINDER_TIME_ZONE, hour: "2-digit", hourCycle: "h23" });

/** Calendar day in Vietnam, as YYYY-MM-DD. */
export function localDay(date: Date): string {
  return dayFormat.format(date);
}

export function localHour(date: Date): number {
  return Number(hourFormat.format(date));
}

function daysBetween(earlier: string, later: string): number {
  return Math.round((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / 86_400_000);
}

/**
 * Whether to send a reminder now, and which one. Reminders go out at the learner's chosen hour,
 * at most once a day, never on a day they have already studied, and less often as they drift
 * away: every day for a week after their last study day (or after they turned reminders on),
 * then once a week until day 30, then not at all, so a lapsed learner is not nagged forever.
 */
export function decideReminder(input: { now: Date; hour: number; lastSentAt: Date | null; lastActivity: Date | null; enabledAt: Date }): ReminderKind | null {
  const today = localDay(input.now);
  if (localHour(input.now) !== input.hour) return null;
  if (input.lastSentAt && localDay(input.lastSentAt) === today) return null;
  if (input.lastActivity && localDay(input.lastActivity) === today) return null;
  if (input.lastActivity && daysBetween(localDay(input.lastActivity), today) === 1) return "keep-streak";
  const anchor = input.lastActivity && input.lastActivity > input.enabledAt ? input.lastActivity : input.enabledAt;
  const days = daysBetween(localDay(anchor), today);
  if (days <= 7) return "daily";
  if (days <= 30 && days % 7 === 1) return "come-back";
  return null;
}
