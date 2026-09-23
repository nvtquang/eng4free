import { describe, expect, it } from "vitest";
import { createVocabularyMemory, scheduleVocabularyReview } from "../src";

describe("FSRS vocabulary adapter", () => {
  it("creates required memory fields", () => {
    expect(createVocabularyMemory(new Date("2026-09-21T00:00:00.000Z"))).toMatchObject({ difficulty: expect.any(Number), stability: expect.any(Number), retrievability: expect.any(Number), lastReview: null });
  });
  it("schedules without hand-written interval logic", () => {
    const now = new Date("2026-09-21T00:00:00.000Z");
    const reviewed = scheduleVocabularyReview(createVocabularyMemory(now), "GOOD", now);
    expect(reviewed.repetitions).toBe(1);
    expect(reviewed.lastReview).toEqual(now);
    expect(reviewed.dueAt.getTime()).toBeGreaterThan(now.getTime());
  });
});
