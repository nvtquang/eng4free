import type { ProgressEvent } from "./progress";

/** Calendar day of a moment in the learner's time zone (Vietnam by default), as YYYY-MM-DD. */
function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

const numberOr = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;

/**
 * Estimated minutes studied on the day of `now`. The app does not time sessions, so each
 * activity counts for what it usually takes: a lesson its planned length, an exam the time
 * between start and submit (capped), a speaking recording its length plus preparation, a
 * piece of writing about ten words a minute, and a flashcard review half a minute.
 */
export function estimateStudyMinutes(events: readonly ProgressEvent[], now = new Date(), timeZone = "Asia/Ho_Chi_Minh"): number {
  const today = dayKey(now, timeZone);
  const starts = new Map(events.filter((event) => event.type === "EXAM_STARTED" && event.sourceId).map((event) => [event.sourceId!, event.occurredAt]));
  let minutes = 0;
  for (const event of events) {
    if (dayKey(event.occurredAt, timeZone) !== today) continue;
    switch (event.type) {
      case "LESSON_COMPLETED": minutes += numberOr(event.metadata.estimatedMinutes, 10); break;
      case "EXAM_COMPLETED": {
        const started = event.sourceId ? starts.get(event.sourceId) : undefined;
        const elapsed = started ? (event.occurredAt.getTime() - started.getTime()) / 60_000 : 15;
        minutes += Math.min(150, Math.max(1, elapsed));
        break;
      }
      case "SPEAKING_COMPLETED": minutes += numberOr(event.metadata.durationMs, 60_000) / 60_000 + 2; break;
      case "WRITING_SUBMITTED": minutes += Math.max(5, numberOr(event.metadata.wordCount, 50) / 10); break;
      case "VOCAB_REVIEWED": minutes += 0.5; break;
      default: break;
    }
  }
  return Math.round(minutes);
}
