/**
 * English 4 Free content pack D3: the authoring format.
 *
 * Everything in this pack is original English 4 Free material drafted with AI assistance
 * (Claude) and reviewed through the DRAFT → REVIEW → APPROVED → PUBLISHED workflow, except
 * vocabulary meanings/IPA (Wiktionary, CC BY-SA 4.0) and photographs (CC0, see media credits).
 * Nothing here is copied or adapted from ETS or Cambridge materials.
 */
import type { QuestionAuthoring } from "@english4free/content-schemas";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type BatchKey = "lessons" | "grammar" | "vocabulary" | "toeic" | "ielts";
export type Image = { src: string; alt: string; credit?: string };
/** Speaker casting for generated audio: a gender, or an exact Piper voice such as "en_GB-vctk-medium:p236". */
export type Voice = "female" | "male" | `${string}:${string}`;

/** A lesson question: the correct option is `options[answer]`. */
export type LessonQuestion = { q: string; options: string[]; answer: number; why: string };
export type LessonBlock =
  | { kind: "text"; heading: string; body: string }
  | { kind: "grammar"; heading: string; body: string }
  | { kind: "pronunciation"; heading: string; body: string }
  /** `script` is spoken (speaker labels allowed) and shown as the transcript. */
  | { kind: "listening"; heading: string; script: string; voices?: Record<string, Voice> }
  | { kind: "practice"; instruction: string; questions: LessonQuestion[] };
export type LessonDef = {
  key: string; batch: "lessons" | "grammar"; level: Level; unit: string; slug: string; title: string;
  skill: "GRAMMAR" | "READING" | "LISTENING" | "SPEAKING" | "WRITING"; minutes: number; blocks: LessonBlock[];
};

export type ExamQuestion = {
  authoring: QuestionAuthoring; explanation: string;
  /** Question heard on its own (TOEIC Part 1–2). */
  audio?: string; image?: Image; maxPlays?: number;
};
export type ExamGroup = {
  title?: string;
  /** Reading text shown with its questions. */
  passage?: string;
  /** Recording (conversation, talk, IELTS section) played before its questions; the script is revealed after submitting. */
  listening?: { script: string; voices?: Record<string, Voice>; playbackLimit?: number };
  image?: Image;
  questions: ExamQuestion[];
};
export type ExamPartDef = { partNumber: number; title: string; skill: "LISTENING" | "READING"; instructions: string; groups: ExamGroup[] };
export type ExamDef = { key: string; batch: "toeic" | "ielts"; slug: string; title: string; type: "TOEIC" | "IELTS"; mode: "PRACTICE" | "MINI_TEST" | "FULL_MOCK"; durationSeconds: number; parts: ExamPartDef[] };

export type PromptDef = {
  key: string; slug: string; kind: "IELTS_WRITING_TASK_1" | "IELTS_WRITING_TASK_2" | "IELTS_SPEAKING"; title: string; sortOrder: number;
  content: {
    instructions: string; prompt: string; image?: Image; minWords?: number; minutes?: number;
    /** Speaking: Part 1 questions, the Part 2 cue card and Part 3 discussion questions. */
    part1?: string[]; cueCard?: { topic: string; points: string[]; closing: string }; part3?: string[];
  };
};

export type VocabularySelection = {
  headword: string; pos: string; level: Level; ipa: string; ipaUs: string | null; meaningVi: string; sense: string;
  sources: Record<"level" | "meaning" | "ipa", { name: string; url: string; license: string }>;
};

// ---------- authoring helpers ----------

const LETTERS = "ABCDEFGH";
/** Multiple choice with the key given as a letter ("B"). */
export function mcq(prompt: string, options: string[], correct: string, explanation: string, extra: Omit<ExamQuestion, "authoring" | "explanation"> = {}): ExamQuestion {
  return { authoring: { type: "MCQ", prompt, options, correct }, explanation, ...extra };
}
/** TOEIC Part 1–2: the choices are heard, so only their letters are printed. */
export function heard(prompt: string, script: string, choices: number, correct: string, explanation: string, extra: Omit<ExamQuestion, "authoring" | "explanation" | "audio"> = {}): ExamQuestion {
  return { authoring: { type: "MCQ", prompt, options: LETTERS.slice(0, choices).split(""), correct }, explanation, audio: script, ...extra };
}
export function tfng(prompt: string, correct: "True" | "False" | "Not Given" | "Yes" | "No", explanation: string): ExamQuestion {
  return { authoring: { type: "TRUE_FALSE", prompt, correct }, explanation };
}
/** Gap fill: blanks are "___" in the prompt; `answers` lists each blank's accepted forms. */
export function gap(prompt: string, answers: string[][], explanation: string, wordLimit?: number): ExamQuestion {
  return { authoring: { type: "FILL_BLANK", prompt, acceptedAnswers: answers.map((forms) => forms.join(" | ")).join("; "), wordLimit }, explanation };
}
export function choose(prompt: string, options: string[], correct: string[], explanation: string): ExamQuestion {
  return { authoring: { type: "MULTI_SELECT", prompt, options, correct: correct.join(", ") }, explanation };
}
export function match(prompt: string, items: string[], options: string[], correct: string[], explanation: string): ExamQuestion {
  return { authoring: { type: "MATCHING", prompt, items, options, correct: correct.join(", ") }, explanation };
}
export function lq(q: string, options: string[], answer: number, why: string): LessonQuestion {
  return { q, options, answer, why };
}

/**
 * Lesson options are written in a natural order; on import they are rotated (order kept,
 * starting point moved) so that across a set the correct answer cycles through the
 * positions: question n puts its key at position (n + offset) mod option count.
 */
export function arrangeLessonOptions(key: string, question: LessonQuestion, ordinal: number): { options: string[]; answer: number } {
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const count = question.options.length;
  const target = (ordinal + hash) % count;
  const shift = (question.answer - target + count) % count;
  const options = question.options.map((_, index) => question.options[(index + shift) % count]!);
  return { options, answer: target };
}
