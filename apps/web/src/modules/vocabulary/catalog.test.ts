import { describe, expect, it } from "vitest";
import { applyPatch, type CatalogRow } from "./catalog";
import { EDITOR_SOURCE, wiktionarySource } from "./catalog-rules";

const word: CatalogRow = {
  id: "w1", headword: "port", partOfSpeech: "noun", cefrLevel: "B1", ipa: "/pɔːt/", meaning: "cảng", example: "Hai Phong is a busy port.", status: "PUBLISHED", reviewedBy: null, reviewedAt: null, updatedAt: new Date(0),
  senseGroups: [{ sense: "dock or harbour", words: ["cảng"] }, { sense: "left-hand side of a vessel", words: ["mạn trái"] }], senseChoice: [0],
  attribution: { ipaUs: null, sense: "dock or harbour", sources: { level: { name: "Words-CEFR Dataset", url: "https://github.com/Maximax67/Words-CEFR-Dataset", license: "MIT" }, meaning: wiktionarySource("port", "meaning"), ipa: wiktionarySource("port", "ipa") } }
};

describe("catalogue edits", () => {
  it("rebuilds the meaning from a new sense choice and keeps Wiktionary as its source", () => {
    const result = applyPatch(word, { senseChoice: [1, 0] }, "editor@example.com");
    expect(result.ok && result.entry.meaning).toBe("mạn trái; cảng");
    expect(result.ok && result.entry.attribution.sources?.meaning?.name).toMatch(/Wiktionary/u);
  });

  it("records English 4 Free as the source of an editor's own meaning and IPA", () => {
    const result = applyPatch(word, { meaningText: "cảng biển", ipa: "/pɔːrt/" }, "editor@example.com");
    expect(result.ok && result.entry.attribution.sources?.meaning).toEqual(EDITOR_SOURCE);
    expect(result.ok && result.entry.attribution.sources?.ipa).toEqual(EDITOR_SOURCE);
  });

  it("marks the reviewer and rejects an edit that breaks the rules", () => {
    const reviewed = applyPatch(word, { markReviewed: true }, "editor@example.com", new Date("2026-10-05T00:00:00Z"));
    expect(reviewed.ok && [reviewed.entry.reviewedBy, reviewed.entry.reviewedAt?.toISOString()]).toEqual(["editor@example.com", "2026-10-05T00:00:00.000Z"]);
    const broken = applyPatch(word, { example: "A ship arrived." }, "editor@example.com");
    expect(broken.ok).toBe(false);
    expect(!broken.ok && broken.issues.map((issue) => issue.problem).join(" ")).toMatch(/too short|does not use/u);
    expect(applyPatch(word, { senseChoice: [5] }, "editor@example.com").ok).toBe(false);
  });
});
