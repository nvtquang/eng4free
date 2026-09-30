import { describe, expect, it } from "vitest";
import type { ProgressEvent } from "./progress";
import { estimateStudyMinutes } from "./study-minutes";

const now = new Date("2026-09-30T10:00:00+07:00");
let counter = 0;
const event = (type: ProgressEvent["type"], at: string, extra: Partial<ProgressEvent> = {}): ProgressEvent => ({ id: String(++counter), learnerId: "l", type, skill: null, occurredAt: new Date(at), metadata: {}, ...extra });

describe("estimated study minutes", () => {
  it("adds up today's activities and ignores other days", () => {
    const events = [
      event("LESSON_COMPLETED", "2026-09-30T08:00:00+07:00", { metadata: { estimatedMinutes: 12 } }),
      event("LESSON_COMPLETED", "2026-09-29T23:30:00+07:00", { metadata: { estimatedMinutes: 12 } }),
      event("EXAM_STARTED", "2026-09-30T08:10:00+07:00", { sourceId: "attempt-1" }),
      event("EXAM_COMPLETED", "2026-09-30T08:30:00+07:00", { sourceId: "attempt-1" }),
      event("SPEAKING_COMPLETED", "2026-09-30T09:00:00+07:00", { metadata: { durationMs: 120_000 } }),
      event("WRITING_SUBMITTED", "2026-09-30T09:30:00+07:00", { metadata: { wordCount: 150 } }),
      event("VOCAB_REVIEWED", "2026-09-30T09:40:00+07:00"),
      event("VOCAB_REVIEWED", "2026-09-30T09:41:00+07:00"),
      event("LISTENING_COMPLETED", "2026-09-30T08:00:00+07:00")
    ];
    // 12 lesson + 20 exam + (2 + 2) speaking + 15 writing + 1 vocabulary
    expect(estimateStudyMinutes(events, now)).toBe(52);
  });

  it("uses the Vietnam calendar day, not UTC", () => {
    expect(estimateStudyMinutes([event("LESSON_COMPLETED", "2026-09-29T17:30:00Z")], now)).toBe(10);
  });
});
