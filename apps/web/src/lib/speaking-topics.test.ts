import { describe, expect, it } from "vitest";
import { advancedSuggestions, getSpeakingCategories } from "./speaking-topics";

describe("speaking topics", () => {
  const topics = getSpeakingCategories("vi").flatMap((category) => category.topics);

  it("uses unique topic ids", () => {
    expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length);
  });

  it("gives every topic basic and advanced sentences (5–6 in total)", () => {
    for (const topic of topics) {
      expect(topic.advanced.length, topic.id).toBeGreaterThan(0);
      expect(topic.suggestions.length + topic.advanced.length, topic.id).toBeGreaterThanOrEqual(5);
    }
  });

  it("has no advanced sentences for unknown topic ids", () => {
    const ids = new Set(topics.map((topic) => topic.id));
    expect(Object.keys(advancedSuggestions).filter((id) => !ids.has(id))).toEqual([]);
  });
});
