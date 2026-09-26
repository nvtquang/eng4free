import { describe, expect, it } from "vitest";
import { buildQuestionFromAuthoring, parseAuthoredQuestion, parseLearnerResponse, toPublicQuestion, type AuthoredQuestion, type QuestionAuthoring } from "@english4free/content-schemas";
import { normalizeDictation, normalizeShortAnswer, scoreQuestion } from "../src/index";

function build(input: QuestionAuthoring): AuthoredQuestion {
  const built = buildQuestionFromAuthoring(input);
  if (!built.success) throw new Error(built.error);
  return built.data;
}

describe("answer normalization", () => {
  it("ignores case, extra whitespace, typographic quotes and surrounding punctuation", () => {
    expect(normalizeShortAnswer("  The   Campus’s  CARD. ")).toBe("the campus's card");
  });
  it("ignores punctuation inside dictation transcripts", () => {
    expect(normalizeDictation("Please, bring your campus card!")).toBe(normalizeDictation("please bring your campus card"));
  });
});

describe("question authoring and scoring", () => {
  it("scores MCQ by the correct option", () => {
    const question = build({ type: "MCQ", prompt: "Pick one", options: ["Red", "Blue", "Green"], correct: "b" });
    expect(scoreQuestion(question, { optionId: "b" })).toEqual({ correct: true, earnedPoints: 1, availablePoints: 1 });
    expect(scoreQuestion(question, { optionId: "a" }).correct).toBe(false);
  });

  it("gives one mark per correct selection in multiple selection and ignores extra picks", () => {
    const question = build({ type: "MULTI_SELECT", prompt: "Choose TWO", options: ["A", "B", "C", "D", "E"], correct: "A, D" });
    expect(question.content).toMatchObject({ selectCount: 2 });
    expect(scoreQuestion(question, { optionIds: ["d", "a"] })).toEqual({ correct: true, earnedPoints: 2, availablePoints: 2 });
    expect(scoreQuestion(question, { optionIds: ["a", "c"] })).toEqual({ correct: false, earnedPoints: 1, availablePoints: 2 });
    expect(scoreQuestion(question, { optionIds: ["b", "c", "a", "d"] }).earnedPoints).toBe(0);
  });

  it("supports True/False/Not Given and Yes/No/Not Given labels on the same scale", () => {
    const tfng = build({ type: "TRUE_FALSE", prompt: "Trees reduce noise.", correct: "Not Given" });
    const ynng = build({ type: "TRUE_FALSE", prompt: "The writer agrees.", correct: "yes" });
    expect(tfng.content).toMatchObject({ variant: "TRUE_FALSE_NOT_GIVEN" });
    expect(ynng.content).toMatchObject({ variant: "YES_NO_NOT_GIVEN" });
    expect(scoreQuestion(tfng, { value: "NOT_GIVEN" }).correct).toBe(true);
    expect(scoreQuestion(ynng, { value: "TRUE" }).correct).toBe(true);
  });

  it("scores each blank separately, accepts alternatives and normalizes case and spacing", () => {
    const question = build({ type: "FILL_BLANK", prompt: "The workshop begins at ___ in room ___.", acceptedAnswers: "10:30 | 10.30 | ten thirty ; B12" });
    expect(question.content).toMatchObject({ prompt: "The workshop begins at {{1}} in room {{2}}." });
    expect(scoreQuestion(question, { blanks: { "1": "  Ten   Thirty ", "2": "b12." } })).toEqual({ correct: true, earnedPoints: 2, availablePoints: 2 });
    expect(scoreQuestion(question, { blanks: { "1": "11:00", "2": "B12" } })).toEqual({ correct: false, earnedPoints: 1, availablePoints: 2 });
  });

  it("rejects answers longer than the word limit", () => {
    const question = build({ type: "FILL_BLANK", prompt: "Bring your ___.", acceptedAnswers: "campus card", wordLimit: 2 });
    expect(scoreQuestion(question, { blanks: { "1": "campus card" } }).correct).toBe(true);
    expect(scoreQuestion(question, { blanks: { "1": "your campus card" } }).correct).toBe(false);
  });

  it("scores matching per item and allows option reuse when the key repeats an option", () => {
    const question = build({ type: "MATCHING", prompt: "Match each speaker", items: ["Anna", "Ben", "Chen"], options: ["Agrees", "Disagrees"], correct: "A, B, A" });
    expect(question.content).toMatchObject({ allowReuse: true });
    expect(scoreQuestion(question, { matches: { "1": "a", "2": "b", "3": "b" } })).toEqual({ correct: false, earnedPoints: 2, availablePoints: 3 });
  });

  it("shuffles ordering items so display order never reveals the answer", () => {
    const question = build({ type: "ORDERING", prompt: "Put the steps in order", items: ["First", "Second", "Third", "Fourth"] });
    if (question.type !== "ORDERING") throw new Error("Expected ordering");
    expect(question.content.items.map((item) => item.text)).not.toEqual(["First", "Second", "Third", "Fourth"]);
    const correctOrder = question.answer.order;
    expect(correctOrder.map((id) => question.content.items.find((item) => item.id === id)?.text)).toEqual(["First", "Second", "Third", "Fourth"]);
    expect(scoreQuestion(question, { order: correctOrder }).correct).toBe(true);
    expect(scoreQuestion(question, { order: [...correctOrder].reverse() }).correct).toBe(false);
    expect(build({ type: "ORDERING", prompt: "Put the steps in order", items: ["First", "Second", "Third", "Fourth"] })).toEqual(question);
  });

  it("accepts dictation transcripts regardless of punctuation and case", () => {
    const question = build({ type: "DICTATION", prompt: "Write what you hear", acceptedAnswers: "Please bring your campus card." });
    expect(scoreQuestion(question, { text: "please bring your Campus Card" }).correct).toBe(true);
    expect(scoreQuestion(question, { text: "please bring your card" }).correct).toBe(false);
  });

  it("scores a missing response as zero", () => {
    const question = build({ type: "FILL_BLANK", prompt: "___ and ___", acceptedAnswers: "a; b" });
    expect(scoreQuestion(question, null)).toEqual({ correct: false, earnedPoints: 0, availablePoints: 2 });
  });
});

describe("public projection and response validation", () => {
  it("never includes the answer key in the learner projection", () => {
    for (const input of [
      { type: "FILL_BLANK", prompt: "Room ___", acceptedAnswers: "B12" },
      { type: "DICTATION", prompt: "Write", acceptedAnswers: "hello", audioText: "Say hello" },
      { type: "MATCHING", prompt: "Match", items: ["x"], options: ["secret-free", "other"], correct: "a" }
    ] satisfies QuestionAuthoring[]) {
      const projection = JSON.stringify(toPublicQuestion(build(input)));
      expect(projection).not.toContain("answer");
      expect(projection).not.toContain("B12");
    }
  });

  it("rejects responses that reference unknown options, items or blanks", () => {
    const matching = toPublicQuestion(build({ type: "MATCHING", prompt: "Match", items: ["x", "y"], options: ["p", "q"], correct: "a, b" }));
    expect(parseLearnerResponse(matching, { matches: { "1": "a" } })).not.toBeNull();
    expect(parseLearnerResponse(matching, { matches: { "9": "a" } })).toBeNull();
    const multi = toPublicQuestion(build({ type: "MULTI_SELECT", prompt: "Choose TWO", options: ["a", "b", "c"], correct: "a, b" }));
    expect(parseLearnerResponse(multi, { optionIds: ["a", "b", "c"] })).toBeNull();
    const blank = toPublicQuestion(build({ type: "FILL_BLANK", prompt: "___", acceptedAnswers: "x" }));
    expect(parseLearnerResponse(blank, { blanks: { "2": "x" } })).toBeNull();
  });

  it("rejects authored questions whose key does not match their content", () => {
    expect(() => parseAuthoredQuestion({ type: "MCQ", content: { prompt: "p", options: [{ id: "a", text: "x" }, { id: "b", text: "y" }] }, answer: { correctOptionId: "z" } })).toThrow();
    expect(buildQuestionFromAuthoring({ type: "FILL_BLANK", prompt: "___ and ___", acceptedAnswers: "only one" }).success).toBe(false);
    expect(buildQuestionFromAuthoring({ type: "MATCHING", prompt: "m", items: ["x", "y"], options: ["p", "q"], correct: "a" }).success).toBe(false);
  });
});
