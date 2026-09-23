import { describe, expect, it } from "vitest";
import { isAttemptExpired, scoreStoredAnswers } from "./exam-engine";
import { localExamFixtures } from "../../../../../content/seed/local-exam-pack";
describe("shared exam engine", () => {
  it("ships all TOEIC parts and IELTS Listening/Reading fixtures", () => { const full = localExamFixtures.find((exam) => exam.mode === "FULL_MOCK"); expect(full?.parts.map((part) => part.partNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]); expect(localExamFixtures.some((exam) => exam.slug === "ielts-listening-demo")).toBe(true); expect(localExamFixtures.some((exam) => exam.slug === "ielts-reading-demo")).toBe(true); });
  it("scores only stored server answers", () => { const scored = scoreStoredAnswers([{ id: "q1", answer: { correctOptionId: "a" }, explanation: "e" }, { id: "q2", answer: { correctOptionId: "b" }, explanation: "e" }], [{ questionId: "q1", selectedOptionId: "a" }, { questionId: "q2", selectedOptionId: "a" }]); expect(scored.rawScore).toBe(1); expect(scored.results[0].correctOptionId).toBe("a"); });
  it("expires exactly at the deadline", () => { const deadline = new Date("2026-01-01T00:00:00Z"); expect(isAttemptExpired(deadline, deadline)).toBe(true); expect(isAttemptExpired(deadline, new Date("2025-12-31T23:59:59Z"))).toBe(false); });
});
