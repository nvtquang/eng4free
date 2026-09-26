import { describe, expect, it } from "vitest";
import { estimateAttempt, tallyBySkill } from "./attempt-estimate";

describe("attempt score estimate", () => {
  const skills = new Map<string, string | null>([["l1", "LISTENING"], ["l2", "LISTENING"], ["r1", "READING"], ["x", null]]);

  it("tallies marks by the skill of their exam part and ignores unknown skills", () => {
    expect(tallyBySkill(skills, [{ questionId: "l1", earnedPoints: 1, availablePoints: 1 }, { questionId: "l2", earnedPoints: 1, availablePoints: 3 }, { questionId: "r1", earnedPoints: 1, availablePoints: 1 }, { questionId: "x", earnedPoints: 1, availablePoints: 1 }])).toEqual({ listening: { correct: 2, total: 4 }, reading: { correct: 1, total: 1 } });
  });

  it("projects TOEIC accuracy onto 100 questions per skill", () => {
    expect(estimateAttempt("TOEIC", { listening: { correct: 1, total: 2 }, reading: { correct: 1, total: 1 } })).toEqual({ exam: "TOEIC", listening: 250, reading: 495, total: 745 });
  });

  it("omits a TOEIC total when one skill is not covered", () => {
    expect(estimateAttempt("TOEIC", { listening: { correct: 0, total: 0 }, reading: { correct: 3, total: 4 } })).toEqual({ exam: "TOEIC", listening: null, reading: 375, total: null });
  });

  it("projects IELTS accuracy onto 40 questions and uses the skill's band table", () => {
    expect(estimateAttempt("IELTS", { listening: { correct: 4, total: 5 }, reading: { correct: 4, total: 5 } })).toEqual({ exam: "IELTS", listening: 7.5, reading: 7 });
  });
});
