import { describe, expect, it } from "vitest";
import { getWritingCategories } from "./writing-topics";

describe("writing topics", () => {
  for (const locale of ["vi", "en"] as const) {
    const categories = getWritingCategories(locale);
    const topics = categories.flatMap((category) => category.topics);

    it(`uses unique topic ids (${locale})`, () => {
      expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length);
    });

    it(`gives every topic a prompt and 5–6 sentence frames (${locale})`, () => {
      for (const topic of topics) {
        expect(topic.prompt.trim().length, topic.id).toBeGreaterThan(10);
        expect(topic.advanced.length, topic.id).toBeGreaterThan(0);
        expect(topic.suggestions.length + topic.advanced.length, topic.id).toBeGreaterThanOrEqual(5);
      }
    });

    it(`gives every category a suggested length (${locale})`, () => {
      for (const category of categories) expect(category.note, category.id).toMatch(/\d/);
    });
  }
});
