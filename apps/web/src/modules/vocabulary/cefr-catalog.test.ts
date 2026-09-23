import { describe, expect, it } from "vitest";
import { getVocabulary, vocabularyProvenance } from "./cefr-catalog";

describe("CEFR vocabulary catalogue", () => {
  it("filters normalized dataset entries by CEFR level", () => {
    const cards = getVocabulary("B2", 8);
    expect(cards).toHaveLength(8);
    expect(cards.every((card) => card.cefrLevel === "B2")).toBe(true);
  });
  it("keeps dataset provenance available to the UI", () => {
    expect(vocabularyProvenance?.license).toContain("MIT");
  });
});
