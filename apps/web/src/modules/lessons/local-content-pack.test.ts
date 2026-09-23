import { describe, expect, it } from "vitest";
import { LessonListeningContentSchema, LessonQuestionSetContentSchema, LessonRichTextContentSchema } from "@english4free/content-schemas";
import { localDemoLessons, localDemoVocabulary } from "../../../../../content/seed/local-content-pack";

describe("local demo content pack", () => {
  it("covers every CEFR level with renderable blocks and practice", () => {
    expect(localDemoLessons.map((lesson) => lesson.level)).toEqual(["A1", "A2", "B1", "B2", "C1", "C2"]);
    for (const lesson of localDemoLessons) {
      expect(lesson.blocks.some((block) => block.type === "QUESTION_SET")).toBe(true);
      for (const block of lesson.blocks) {
        const schema = block.type === "RICH_TEXT" ? LessonRichTextContentSchema : block.type === "MEDIA" ? LessonListeningContentSchema : LessonQuestionSetContentSchema;
        expect(schema.safeParse(block.content).success).toBe(true);
      }
    }
  });
  it("contains original local vocabulary for every level", () => {
    expect(new Set(localDemoVocabulary.map((entry) => entry[2]))).toEqual(new Set(["A1", "A2", "B1", "B2", "C1", "C2"]));
  });
});
