import { z } from "zod";
import { GRADABLE_QUESTION_TYPES, TRUE_FALSE_VARIANTS, safeParseAuthoredQuestion, type AuthoredQuestion, type TrueFalseValue } from "./questions";

/**
 * Flat, spreadsheet-friendly authoring format shared by the CMS form and the
 * content importer. One row describes one question:
 *
 * - MCQ: options + correct letter ("B").
 * - MULTI_SELECT: options + correct letters ("A, D"); the learner must pick that many.
 * - TRUE_FALSE: correct is True/False/Not Given (or Yes/No/Not Given).
 * - FILL_BLANK: prompt marks blanks with "___" or {{id}}; acceptedAnswers lists
 *   blanks separated by ";" and alternatives separated by "|" ("10:30|10.30; B12").
 * - MATCHING: items (left side) + options (right side) + correct letters per item ("C, A, B").
 * - ORDERING: items in the correct order; they are shuffled deterministically for display.
 * - DICTATION: acceptedAnswers lists accepted transcripts separated by "|"; audioText is spoken.
 */
export const QuestionAuthoringSchema = z.object({
  type: z.enum(GRADABLE_QUESTION_TYPES),
  prompt: z.string().trim().min(1).max(8_000),
  options: z.array(z.string().trim().max(2_000)).max(12).default([]),
  correct: z.string().trim().max(500).optional(),
  acceptedAnswers: z.string().trim().max(4_000).optional(),
  items: z.array(z.string().trim().max(2_000)).max(20).default([]),
  audioText: z.string().trim().max(2_000).optional(),
  wordLimit: z.number().int().min(1).max(5).optional(),
  variant: z.enum(TRUE_FALSE_VARIANTS).optional()
});
export type QuestionAuthoring = z.input<typeof QuestionAuthoringSchema>;

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const letterId = (index: number) => LETTERS[index]!;

/** Splits a list cell written one per line or separated by "|". */
export function splitAuthoringList(value: string | undefined | null): string[] {
  return (value ?? "").split(/\r?\n|\|/u).map((item) => item.trim()).filter(Boolean);
}

/** "B", "b.", "(c)" → 1, 1, 2; returns null for anything else. */
function letterIndex(value: string): number | null {
  const match = /^\(?([a-z])[.)]?$/iu.exec(value.trim());
  return match ? LETTERS.indexOf(match[1]!.toLowerCase()) : null;
}

function letterList(value: string | undefined): number[] | null {
  const parts = (value ?? "").split(/[\s,;/]+/u).filter(Boolean);
  const indexes = parts.map(letterIndex);
  return parts.length && indexes.every((index): index is number => index !== null) ? indexes : null;
}

function positionalChoices(texts: string[]) {
  return texts.map((text, index) => ({ id: letterId(index), text })).filter((choice) => choice.text.length > 0);
}

function trueFalseValue(value: string | undefined): { value: TrueFalseValue; yesNo: boolean } | null {
  const key = (value ?? "").toLowerCase().replace(/[\s_-]+/gu, "");
  if (["true", "t"].includes(key)) return { value: "TRUE", yesNo: false };
  if (["false", "f"].includes(key)) return { value: "FALSE", yesNo: false };
  if (["yes", "y"].includes(key)) return { value: "TRUE", yesNo: true };
  if (["no", "n"].includes(key)) return { value: "FALSE", yesNo: true };
  if (["notgiven", "ng"].includes(key)) return { value: "NOT_GIVEN", yesNo: false };
  return null;
}

/** Stable pseudo-random shuffle so re-imports produce the same display order. */
function seededShuffle<T>(values: T[], seed: string): T[] {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  let state = hash >>> 0;
  const random = () => { state = (state + 0x6d2b79f5) >>> 0; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) { const swap = Math.floor(random() * (index + 1)); [result[index], result[swap]] = [result[swap]!, result[index]!]; }
  // A shuffle that happens to keep the correct order would give the answer away.
  if (result.length > 1 && result.every((value, index) => value === values[index])) result.push(result.shift()!);
  return result;
}

function fail(error: string) { return { success: false as const, error }; }

/** Converts one flat authoring row into a validated stored question (content + key). */
export function buildQuestionFromAuthoring(raw: QuestionAuthoring): { success: true; data: AuthoredQuestion } | { success: false; error: string } {
  const parsed = QuestionAuthoringSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
  const input = parsed.data;
  const options = positionalChoices(input.options);
  switch (input.type) {
    case "MCQ": {
      const index = letterIndex(input.correct ?? "");
      if (index === null) return fail("MCQ needs one correct option letter, for example B");
      return safeParseAuthoredQuestion({ type: "MCQ", content: { prompt: input.prompt, options }, answer: { correctOptionId: letterId(index) } });
    }
    case "MULTI_SELECT": {
      const indexes = letterList(input.correct);
      if (!indexes || indexes.length < 2) return fail("Multiple selection needs at least two correct option letters, for example A, D");
      return safeParseAuthoredQuestion({ type: "MULTI_SELECT", content: { prompt: input.prompt, options, selectCount: indexes.length }, answer: { correctOptionIds: indexes.map(letterId) } });
    }
    case "TRUE_FALSE": {
      const value = trueFalseValue(input.correct);
      if (!value) return fail("True/False needs True, False, Not Given, Yes or No as the correct answer");
      const variant = input.variant ?? (value.yesNo ? "YES_NO_NOT_GIVEN" : "TRUE_FALSE_NOT_GIVEN");
      return safeParseAuthoredQuestion({ type: "TRUE_FALSE", content: { prompt: input.prompt, variant }, answer: { correct: value.value } });
    }
    case "FILL_BLANK": {
      let counter = 0;
      const prompt = /\{\{[^}]+\}\}/u.test(input.prompt) ? input.prompt : input.prompt.replace(/_{3,}/gu, () => `{{${++counter}}}`);
      const tokens = [...prompt.matchAll(/\{\{\s*([A-Za-z0-9_-]{1,16})\s*\}\}/gu)].map((match) => match[1]!);
      const groups = (input.acceptedAnswers ?? "").split(/;|\r?\n/u).map((group) => group.split("|").map((answer) => answer.trim()).filter(Boolean)).filter((group) => group.length);
      if (!tokens.length) return fail("Mark each blank in the prompt with ___ or {{1}}");
      if (groups.length !== tokens.length) return fail(`The prompt has ${tokens.length} blank(s) but ${groups.length} accepted-answer group(s) were given; separate blanks with ";" and alternatives with "|"`);
      return safeParseAuthoredQuestion({ type: "FILL_BLANK", content: { prompt, wordLimit: input.wordLimit }, answer: { blanks: Object.fromEntries(tokens.map((token, index) => [token, groups[index]!])) } });
    }
    case "MATCHING": {
      const items = input.items.filter(Boolean).map((text, index) => ({ id: String(index + 1), text }));
      const indexes = letterList(input.correct);
      if (!items.length) return fail("Matching needs at least one item");
      if (!indexes || indexes.length !== items.length) return fail(`Matching needs one correct option letter per item (${items.length}), for example C, A, B`);
      const allowReuse = new Set(indexes).size !== indexes.length || options.length < items.length;
      return safeParseAuthoredQuestion({ type: "MATCHING", content: { prompt: input.prompt, items, options, allowReuse }, answer: { matches: Object.fromEntries(items.map((item, index) => [item.id, letterId(indexes[index]!)])) } });
    }
    case "ORDERING": {
      const correctOrder = input.items.filter(Boolean);
      if (correctOrder.length < 2) return fail("Ordering needs at least two items, listed in the correct order");
      const display = seededShuffle(correctOrder.map((text, index) => ({ text, index })), `${input.prompt}\u0000${correctOrder.join("\u0000")}`);
      const items = display.map((item, index) => ({ id: letterId(index), text: item.text }));
      const order = correctOrder.map((_, correctIndex) => letterId(display.findIndex((item) => item.index === correctIndex)));
      return safeParseAuthoredQuestion({ type: "ORDERING", content: { prompt: input.prompt, items }, answer: { order } });
    }
    case "DICTATION": {
      const accepted = splitAuthoringList(input.acceptedAnswers ?? input.correct);
      if (!accepted.length) return fail("Dictation needs at least one accepted transcript");
      return safeParseAuthoredQuestion({ type: "DICTATION", content: { prompt: input.prompt, playbackText: input.audioText || accepted[0] }, answer: { accepted } });
    }
  }
}

const typeAliases: Array<[RegExp, (typeof GRADABLE_QUESTION_TYPES)[number]]> = [
  [/^(mcq|multiple ?choice|single ?choice|choice|image_mcq|audio_mcq|reading_mcq)$/u, "MCQ"],
  [/^(multi|multi[ _-]?select|multiple ?selection|choose ?(two|three))$/u, "MULTI_SELECT"],
  [/^(tf|tfng|ynng|true[ _/-]?false([ _/-]?not[ _-]?given)?|yes[ _/-]?no([ _/-]?not[ _-]?given)?)$/u, "TRUE_FALSE"],
  [/^(fill|fill[ _-]?(in|blank|blanks)|gap[ _-]?fill|completion|short[ _-]?answer)$/u, "FILL_BLANK"],
  [/^(match|matching|matching[ _-]?headings?)$/u, "MATCHING"],
  [/^(order|ordering|sequence|sequencing)$/u, "ORDERING"],
  [/^(dictation|listen[ _-]?and[ _-]?write)$/u, "DICTATION"]
];

/** Reads a spreadsheet "type" cell ("TFNG", "gap fill", "matching headings"…); empty means MCQ. */
export function parseQuestionTypeLabel(value: string | undefined | null): (typeof GRADABLE_QUESTION_TYPES)[number] | null {
  const key = (value ?? "").trim().toLowerCase();
  if (!key) return "MCQ";
  const upper = key.toUpperCase();
  if ((GRADABLE_QUESTION_TYPES as readonly string[]).includes(upper)) return upper as (typeof GRADABLE_QUESTION_TYPES)[number];
  return typeAliases.find(([pattern]) => pattern.test(key))?.[1] ?? null;
}
