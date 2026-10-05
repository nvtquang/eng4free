import { describe, expect, it } from "vitest";
import { checkCatalogEntry, EDITOR_SOURCE, meaningFromChoice, mentionsHeadword, wiktionarySource, type CatalogEntry } from "./catalog-rules";

const word: CatalogEntry = {
  headword: "travel", partOfSpeech: "verb", cefrLevel: "A2", ipa: "/ˈtrævəl/", meaning: "đi du lịch", example: "We travelled by train.",
  attribution: { sources: { level: { name: "Words-CEFR Dataset", url: "https://github.com/Maximax67/Words-CEFR-Dataset", license: "MIT" }, meaning: wiktionarySource("travel", "meaning"), ipa: wiktionarySource("travel", "ipa") } }
};

describe("vocabulary catalogue rules", () => {
  it("accepts a sourced word whose example uses the headword", () => {
    expect(checkCatalogEntry(word)).toEqual([]);
  });

  it("rejects a missing source, an example without the headword, bad IPA and an unknown level", () => {
    const problems = (entry: CatalogEntry) => checkCatalogEntry(entry).map((issue) => issue.problem).join(" | ");
    expect(problems({ ...word, attribution: { sources: { ...word.attribution.sources, meaning: undefined } } })).toMatch(/meaning source/u);
    expect(problems({ ...word, example: "We went to Paris by train." })).toMatch(/does not use/u);
    expect(problems({ ...word, example: "Travel is fun." })).toMatch(/too short/u);
    expect(problems({ ...word, ipa: "trævəl" })).toMatch(/IPA/u);
    expect(problems({ ...word, cefrLevel: "D1" })).toMatch(/level/u);
    expect(checkCatalogEntry({ ...word, attribution: { sources: { ...word.attribution.sources, meaning: EDITOR_SOURCE } } })).toEqual([]);
  });

  it("builds the meaning from whole groups and single words, in pick order", () => {
    const groups = [{ sense: "to be on a journey", words: ["đi du lịch", "du hành"] }, { sense: "to move", words: ["di chuyển", "đi"] }];
    expect(meaningFromChoice(groups, [0])).toEqual({ meaning: "đi du lịch; du hành", sense: "to be on a journey" });
    expect(meaningFromChoice(groups, ["1.0", 0])).toEqual({ meaning: "di chuyển; đi du lịch; du hành", sense: "to move; to be on a journey" });
    expect(() => meaningFromChoice(groups, [2])).toThrow(/No sense group/u);
    expect(() => meaningFromChoice(groups, ["0.5"])).toThrow(/No word/u);
  });

  it("accepts regular forms of the headword", () => {
    expect(mentionsHeadword("She is studying hard.", "study")).toBe(true);
    expect(mentionsHeadword("They chatted for hours.", "chat")).toBe(true);
    expect(mentionsHeadword("He went home.", "go")).toBe(false);
  });
});
