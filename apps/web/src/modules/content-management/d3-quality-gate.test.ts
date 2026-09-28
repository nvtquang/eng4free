import { describe, expect, it } from "vitest";
import { checkExams, checkLessons, checkVocabulary } from "../../../../../scripts/content/d3/quality-gate";
import { arrangeLessonOptions, lq, mcq, type LessonDef, type VocabularySelection } from "../../../../../content/packs/d3/types";

const lesson = (questions: ReturnType<typeof lq>[], body = "A clear explanation of the grammar with enough words to pass the length check here."): LessonDef => ({
  key: "test", batch: "grammar", level: "A1", unit: "Unit", slug: "test-lesson", title: "Test lesson", skill: "GRAMMAR", minutes: 5,
  blocks: [{ kind: "grammar", heading: "Form", body }, { kind: "practice", instruction: "Choose.", questions }]
});
const four = [lq("Q1?", ["a", "b", "c"], 0, "Because a."), lq("Q2?", ["a", "b", "c"], 1, "Because b."), lq("Q3?", ["a", "b", "c"], 2, "Because c."), lq("Q4?", ["a", "b", "c"], 0, "Because a.")];
const source = { name: "English Wiktionary", url: "https://en.wiktionary.org/wiki/test", license: "CC BY-SA 4.0" };
const word: VocabularySelection & { example?: string } = { headword: "travel", pos: "verb", level: "A2", ipa: "/ˈtrævəl/", ipaUs: null, meaningVi: "đi du lịch", sense: "to be on a journey", sources: { level: source, meaning: source, ipa: source }, example: "We travelled by train." };

describe("D3 quality gate", () => {
  it("accepts a complete lesson and rejects placeholder text", () => {
    expect(checkLessons([lesson(four)])).toEqual([]);
    expect(checkLessons([lesson(four, "Original example for present simple. Ví dụ gốc để kiểm tra renderer lesson.")]).map((issue) => issue.problem).join(" ")).toMatch(/placeholder/u);
  });

  it("requires enough practice questions and valid answer indexes", () => {
    expect(checkLessons([lesson(four.slice(0, 2))]).some((issue) => /only 2 practice questions/u.test(issue.problem))).toBe(true);
    expect(checkLessons([lesson([...four.slice(0, 3), lq("Q?", ["a", "b"], 3, "Out of range.")])]).some((issue) => /answer index|at least 3 options/u.test(issue.problem))).toBe(true);
  });

  it("cycles lesson answer keys through the option positions", () => {
    const keys = Array.from({ length: 9 }, (_, index) => arrangeLessonOptions("lesson:x", lq("Q?", ["right", "wrong", "other"], 0, "Right."), index));
    expect(new Set(keys.map((item) => item.answer)).size).toBe(3);
    for (const item of keys) expect(item.options[item.answer]).toBe("right");
  });

  it("flags a lopsided exam key", () => {
    const questions = Array.from({ length: 10 }, (_, index) => mcq(`Question ${index}?`, ["one", "two", "three", "four"], "A", "The first option is correct here."));
    const issues = checkExams([{ key: "x", batch: "toeic", slug: "x", title: "X", type: "TOEIC", mode: "PRACTICE", durationSeconds: 60, parts: [{ partNumber: 5, title: "P5", skill: "READING", instructions: "Choose the best answer.", groups: [{ questions }] }] }]);
    expect(issues.some((issue) => /lopsided/u.test(issue.problem))).toBe(true);
  });

  it("requires sourced vocabulary with an example that uses the headword", () => {
    expect(checkVocabulary([word])).toEqual([]);
    expect(checkVocabulary([{ ...word, sources: { ...word.sources, meaning: { name: "", url: "", license: "" } } }]).some((issue) => /meaning source/u.test(issue.problem))).toBe(true);
    expect(checkVocabulary([{ ...word, example: "We went to Paris by train." }]).some((issue) => /does not use/u.test(issue.problem))).toBe(true);
    expect(checkVocabulary([{ ...word, ipa: "trævəl" }]).some((issue) => /IPA/u.test(issue.problem))).toBe(true);
  });
});
