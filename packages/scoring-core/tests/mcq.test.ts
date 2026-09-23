import { describe, expect, it } from "vitest";
import { McqQuestionWithAnswerSchema, toLearnerQuestion } from "@english4free/content-schemas";
import { scoreMcq } from "../src";

const question = McqQuestionWithAnswerSchema.parse({
  id: "b5de2c17-8a3f-466c-a5d0-8e886ff98706",
  schemaVersion: 1,
  type: "MCQ",
  tags: ["toeic-part-5"],
  content: { prompt: "Please ___ the document.", options: [{ id: "a", text: "review" }, { id: "b", text: "reviews" }] },
  answer: { correctOptionId: "a" },
  provenance: { source: "https://example.com/original", license: "Internal", importedAt: "2026-09-21T00:00:00.000Z", version: "1" },
  status: "DRAFT"
});

describe("scoreMcq", () => {
  it("scores answers without exposing the answer key in the learner projection", () => {
    expect(scoreMcq(question, "a")).toEqual({ correct: true, earnedPoints: 1, availablePoints: 1 });
    expect(toLearnerQuestion(question)).not.toHaveProperty("answer");
  });

  it("marks an incorrect option as zero", () => {
    expect(scoreMcq(question, "b")).toEqual({ correct: false, earnedPoints: 0, availablePoints: 1 });
  });
});
