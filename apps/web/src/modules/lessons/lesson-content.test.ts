import { describe, expect, it } from "vitest";
import { LessonQuestionSetContentSchema } from "@english4free/content-schemas";

describe("lesson question-set content", () => {
  it("requires every answer key to reference an option", () => {
    const result = LessonQuestionSetContentSchema.safeParse({ instruction: "Choose one.", questions: [{ id: "f40d445d-9f99-4cac-8c10-bf3e1652b1a9", prompt: "Question", options: [{ id: "a", text: "A" }, { id: "b", text: "B" }], correctOptionId: "missing", explanation: "Explanation" }] });
    expect(result.success).toBe(false);
  });
});
