import { z } from "zod";

/**
 * Gradable question types. Each type is stored as two documents: `content`
 * (safe to send to learners before submission) and `answer` (server-only key).
 * The public projection of a question is therefore `{ type, content }`.
 */
export const GRADABLE_QUESTION_TYPES = ["MCQ", "MULTI_SELECT", "TRUE_FALSE", "FILL_BLANK", "MATCHING", "ORDERING", "DICTATION"] as const;
export type GradableQuestionType = (typeof GRADABLE_QUESTION_TYPES)[number];

export const TRUE_FALSE_VALUES = ["TRUE", "FALSE", "NOT_GIVEN"] as const;
export type TrueFalseValue = (typeof TRUE_FALSE_VALUES)[number];
/** Which labels a TRUE_FALSE question shows; YES/NO questions store TRUE/FALSE. */
export const TRUE_FALSE_VARIANTS = ["TRUE_FALSE_NOT_GIVEN", "YES_NO_NOT_GIVEN", "TRUE_FALSE"] as const;

const Text = z.string().trim().min(1);
const ChoiceSchema = z.object({ id: z.string().min(1).max(32), text: Text.max(2_000) });
type Choice = z.infer<typeof ChoiceSchema>;
const Prompt = Text.max(8_000);
/** A picture shown with the question (TOEIC Part 1). Local demo media or an https URL. */
export const QuestionImageSchema = z.object({ src: z.string().max(500).regex(/^(\/demo-media\/[A-Za-z0-9._/-]+|https:\/\/\S+)$/u, "Image must be a /demo-media/ path or an https URL"), alt: z.string().trim().min(1).max(300) });
const Media = { passageId: z.string().uuid().optional(), mediaId: z.string().uuid().optional(), image: QuestionImageSchema.optional() };

function uniqueIds(path: string, values: Array<{ id: string }>, context: z.RefinementCtx) {
  if (new Set(values.map((value) => value.id)).size !== values.length) context.addIssue({ code: z.ZodIssueCode.custom, message: `${path} IDs must be unique`, path: [path] });
}

/** `{{id}}` tokens in a FILL_BLANK prompt, in reading order. */
export function blankTokens(prompt: string): string[] {
  return [...prompt.matchAll(/\{\{\s*([A-Za-z0-9_-]{1,16})\s*\}\}/gu)].map((match) => match[1]!);
}

export const McqContentSchema = z.object({ prompt: Prompt, options: z.array(ChoiceSchema).min(2).max(10), ...Media }).superRefine(({ options }, context) => uniqueIds("options", options, context));
export const MultiSelectContentSchema = z.object({ prompt: Prompt, options: z.array(ChoiceSchema).min(3).max(12), selectCount: z.number().int().min(2).max(6), ...Media }).superRefine(({ options, selectCount }, context) => {
  uniqueIds("options", options, context);
  if (selectCount >= options.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "selectCount must be smaller than the number of options", path: ["selectCount"] });
});
export const TrueFalseContentSchema = z.object({ prompt: Prompt, variant: z.enum(TRUE_FALSE_VARIANTS).default("TRUE_FALSE_NOT_GIVEN"), ...Media });
export const FillBlankContentSchema = z.object({ prompt: Prompt, wordLimit: z.number().int().min(1).max(5).optional(), ...Media }).superRefine(({ prompt }, context) => {
  const tokens = blankTokens(prompt);
  if (tokens.length === 0) context.addIssue({ code: z.ZodIssueCode.custom, message: "A fill-in-the-blank prompt needs at least one {{blank}}", path: ["prompt"] });
  if (new Set(tokens).size !== tokens.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "Blank IDs must be unique", path: ["prompt"] });
});
export const MatchingContentSchema = z.object({ prompt: Prompt, items: z.array(ChoiceSchema).min(1).max(20), options: z.array(ChoiceSchema).min(2).max(20), allowReuse: z.boolean().default(false), ...Media }).superRefine(({ items, options, allowReuse }, context) => {
  uniqueIds("items", items, context); uniqueIds("options", options, context);
  if (!allowReuse && options.length < items.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "Without reuse, there must be at least as many options as items", path: ["options"] });
});
/** Items are stored in display order; that order must not reveal the answer. */
export const OrderingContentSchema = z.object({ prompt: Prompt, items: z.array(ChoiceSchema).min(2).max(12), ...Media }).superRefine(({ items }, context) => uniqueIds("items", items, context));
export const DictationContentSchema = z.object({ prompt: Prompt, playbackText: Text.max(2_000).optional(), mediaId: z.string().uuid().optional(), /** Set by the server when a generated recording exists; playbackText is then withheld. */ audioUrl: z.string().max(500).optional(), maxPlays: z.number().int().min(1).max(5).default(3), passageId: z.string().uuid().optional() }).refine((content) => Boolean(content.playbackText || content.mediaId || content.audioUrl), { message: "Dictation needs an audio asset or playback text", path: ["mediaId"] });

export const McqAnswerSchema = z.object({ correctOptionId: z.string().min(1) });
export const MultiSelectAnswerSchema = z.object({ correctOptionIds: z.array(z.string().min(1)).min(2).max(6) });
export const TrueFalseAnswerSchema = z.object({ correct: z.enum(TRUE_FALSE_VALUES) });
export const FillBlankAnswerSchema = z.object({ blanks: z.record(z.array(Text.max(200)).min(1).max(10)) });
export const MatchingAnswerSchema = z.object({ matches: z.record(z.string().min(1)) });
export const OrderingAnswerSchema = z.object({ order: z.array(z.string().min(1)).min(2) });
export const DictationAnswerSchema = z.object({ accepted: z.array(Text.max(2_000)).min(1).max(10) });

export const McqResponseSchema = z.object({ optionId: z.string().min(1).max(32) });
export const MultiSelectResponseSchema = z.object({ optionIds: z.array(z.string().min(1).max(32)).max(12) });
export const TrueFalseResponseSchema = z.object({ value: z.enum(TRUE_FALSE_VALUES) });
export const FillBlankResponseSchema = z.object({ blanks: z.record(z.string().max(200)) });
export const MatchingResponseSchema = z.object({ matches: z.record(z.string().max(32)) });
export const OrderingResponseSchema = z.object({ order: z.array(z.string().min(1).max(32)).max(12) });
export const DictationResponseSchema = z.object({ text: z.string().max(2_000) });

const definitions = {
  MCQ: { content: McqContentSchema, answer: McqAnswerSchema, response: McqResponseSchema },
  MULTI_SELECT: { content: MultiSelectContentSchema, answer: MultiSelectAnswerSchema, response: MultiSelectResponseSchema },
  TRUE_FALSE: { content: TrueFalseContentSchema, answer: TrueFalseAnswerSchema, response: TrueFalseResponseSchema },
  FILL_BLANK: { content: FillBlankContentSchema, answer: FillBlankAnswerSchema, response: FillBlankResponseSchema },
  MATCHING: { content: MatchingContentSchema, answer: MatchingAnswerSchema, response: MatchingResponseSchema },
  ORDERING: { content: OrderingContentSchema, answer: OrderingAnswerSchema, response: OrderingResponseSchema },
  DICTATION: { content: DictationContentSchema, answer: DictationAnswerSchema, response: DictationResponseSchema }
} as const;

type Definitions = typeof definitions;
export type QuestionContent<T extends GradableQuestionType = GradableQuestionType> = z.infer<Definitions[T]["content"]>;
export type QuestionAnswer<T extends GradableQuestionType = GradableQuestionType> = z.infer<Definitions[T]["answer"]>;
export type QuestionResponse<T extends GradableQuestionType = GradableQuestionType> = z.infer<Definitions[T]["response"]>;

/** A question with its key, as stored on the server. */
export type AuthoredQuestion = { [T in GradableQuestionType]: { type: T; content: QuestionContent<T>; answer: QuestionAnswer<T> } }[GradableQuestionType];
/** What a learner may see before submitting. */
export type PublicQuestion = { [T in GradableQuestionType]: { type: T; content: QuestionContent<T> } }[GradableQuestionType];
export type TypedResponse = { [T in GradableQuestionType]: { type: T; response: QuestionResponse<T> } }[GradableQuestionType];

export function isGradableQuestionType(value: string): value is GradableQuestionType {
  return (GRADABLE_QUESTION_TYPES as readonly string[]).includes(value);
}

function ids(values: Choice[]) { return new Set(values.map((value) => value.id)); }

/** Cross-checks that the key refers to the content (options, blanks, items). */
function checkAnswer(question: AuthoredQuestion): string | null {
  switch (question.type) {
    case "MCQ": return ids(question.content.options).has(question.answer.correctOptionId) ? null : "Answer must reference an existing option";
    case "MULTI_SELECT": {
      const options = ids(question.content.options); const correct = question.answer.correctOptionIds;
      if (new Set(correct).size !== correct.length || !correct.every((id) => options.has(id))) return "Correct options must be distinct existing options";
      return correct.length === question.content.selectCount ? null : "The number of correct options must equal selectCount";
    }
    case "TRUE_FALSE": return question.content.variant === "TRUE_FALSE" && question.answer.correct === "NOT_GIVEN" ? "A True/False question cannot have Not Given as its answer" : null;
    case "FILL_BLANK": {
      const tokens = blankTokens(question.content.prompt); const keys = Object.keys(question.answer.blanks);
      return keys.length === tokens.length && tokens.every((token) => keys.includes(token)) ? null : "Every blank needs accepted answers, and only blanks in the prompt may have answers";
    }
    case "MATCHING": {
      const items = ids(question.content.items); const options = ids(question.content.options); const entries = Object.entries(question.answer.matches);
      if (entries.length !== items.size || !entries.every(([item, option]) => items.has(item) && options.has(option))) return "Every item must match one existing option";
      return question.content.allowReuse || new Set(entries.map(([, option]) => option)).size === entries.length ? null : "An option is used more than once but reuse is not allowed";
    }
    case "ORDERING": {
      const items = ids(question.content.items); const order = question.answer.order;
      return order.length === items.size && new Set(order).size === order.length && order.every((id) => items.has(id)) ? null : "The order must list every item exactly once";
    }
    case "DICTATION": return null;
  }
}

/** Parses and cross-validates a stored or authored question. Throws a ZodError-style Error when invalid. */
export function parseAuthoredQuestion(raw: { type: string; content: unknown; answer: unknown }): AuthoredQuestion {
  if (!isGradableQuestionType(raw.type)) throw new Error(`Unsupported question type: ${raw.type}`);
  const definition = definitions[raw.type];
  const question = { type: raw.type, content: definition.content.parse(raw.content), answer: definition.answer.parse(raw.answer) } as AuthoredQuestion;
  const problem = checkAnswer(question);
  if (problem) throw new Error(problem);
  return question;
}

export function safeParseAuthoredQuestion(raw: { type: string; content: unknown; answer: unknown }): { success: true; data: AuthoredQuestion } | { success: false; error: string } {
  try { return { success: true, data: parseAuthoredQuestion(raw) }; }
  catch (error) { return { success: false, error: error instanceof z.ZodError ? error.issues.map((issue) => `${issue.path.join(".") || "question"}: ${issue.message}`).join("; ") : error instanceof Error ? error.message : "Invalid question" }; }
}

/** The learner-facing projection. Content never contains the key. */
export function parsePublicQuestion(raw: { type: string; content: unknown }): PublicQuestion {
  if (!isGradableQuestionType(raw.type)) throw new Error(`Unsupported question type: ${raw.type}`);
  return { type: raw.type, content: definitions[raw.type].content.parse(raw.content) } as PublicQuestion;
}

export function toPublicQuestion(question: AuthoredQuestion): PublicQuestion {
  return { type: question.type, content: question.content } as PublicQuestion;
}

/**
 * Validates a learner response against the public content: shape, and that every
 * referenced option/item/blank exists. Returns null when the response is invalid.
 */
export function parseLearnerResponse(question: PublicQuestion, raw: unknown): QuestionResponse | null {
  const parsed = definitions[question.type].response.safeParse(raw);
  if (!parsed.success) return null;
  const response = parsed.data;
  switch (question.type) {
    case "MCQ": return ids(question.content.options).has((response as QuestionResponse<"MCQ">).optionId) ? response : null;
    case "MULTI_SELECT": { const selected = (response as QuestionResponse<"MULTI_SELECT">).optionIds; const options = ids(question.content.options); return selected.length <= question.content.selectCount && new Set(selected).size === selected.length && selected.every((id) => options.has(id)) ? response : null; }
    case "TRUE_FALSE": return question.content.variant === "TRUE_FALSE" && (response as QuestionResponse<"TRUE_FALSE">).value === "NOT_GIVEN" ? null : response;
    case "FILL_BLANK": { const tokens = new Set(blankTokens(question.content.prompt)); return Object.keys((response as QuestionResponse<"FILL_BLANK">).blanks).every((key) => tokens.has(key)) ? response : null; }
    case "MATCHING": { const items = ids(question.content.items); const options = ids(question.content.options); return Object.entries((response as QuestionResponse<"MATCHING">).matches).every(([item, option]) => items.has(item) && (option === "" || options.has(option))) ? response : null; }
    case "ORDERING": { const order = (response as QuestionResponse<"ORDERING">).order; const items = ids(question.content.items); return order.length === items.size && new Set(order).size === order.length && order.every((id) => items.has(id)) ? response : null; }
    case "DICTATION": return response;
  }
}

/** Whether a learner has actually answered (used for "answered" counters). */
export function isResponseAnswered(type: GradableQuestionType, response: unknown): boolean {
  if (!response || typeof response !== "object") return false;
  const value = response as Record<string, unknown>;
  switch (type) {
    case "MCQ": return typeof value.optionId === "string" && value.optionId.length > 0;
    case "MULTI_SELECT": return Array.isArray(value.optionIds) && value.optionIds.length > 0;
    case "TRUE_FALSE": return typeof value.value === "string";
    case "FILL_BLANK": return Object.values((value.blanks ?? {}) as Record<string, string>).some((text) => text.trim().length > 0);
    case "MATCHING": return Object.values((value.matches ?? {}) as Record<string, string>).some(Boolean);
    case "ORDERING": return Array.isArray(value.order) && value.order.length > 0;
    case "DICTATION": return typeof value.text === "string" && value.text.trim().length > 0;
  }
}

/** Marks a question is worth, derived from public content so learners can see it: one per blank, matched item or required selection. */
export function questionPoints(question: PublicQuestion): number {
  switch (question.type) {
    case "MULTI_SELECT": return question.content.selectCount;
    case "FILL_BLANK": return blankTokens(question.content.prompt).length;
    case "MATCHING": return question.content.items.length;
    default: return 1;
  }
}
