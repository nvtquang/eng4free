import { describe, expect, it } from "vitest";
import { findWordsInText } from "./lesson-words";

const words = (...headwords: string[]) => headwords.map((headword) => ({ headword }));

describe("lesson words", () => {
  it("finds words in order of first appearance, including common inflections", () => {
    const text = "The museum guide explained the history. Visitors studied the paintings while she was describing them.";
    const found = findWordsInText(text, words("describe", "history", "visitor", "study", "museum", "guide", "airport"), 10);
    expect(found.map((word) => word.headword)).toEqual(["museum", "guide", "history", "visitor", "study", "describe"]);
  });

  it("matches multi-word headwords as phrases and respects the limit", () => {
    const text = "Please look after the plants and take part in the meeting.";
    expect(findWordsInText(text, words("take part", "look after", "plant"), 2).map((word) => word.headword)).toEqual(["look after", "plant"]);
    expect(findWordsInText("I look at the after-party.", words("look after"), 5)).toEqual([]);
  });

  it("never offers function words, which usually match a different word", () => {
    expect(findWordsInText("You can buy fruit after work.", words("can", "after", "fruit"), 5).map((word) => word.headword)).toEqual(["fruit"]);
  });

  it("does not repeat a headword listed twice", () => {
    expect(findWordsInText("A fair price at the fair.", words("fair", "fair"), 5)).toHaveLength(1);
  });
});
