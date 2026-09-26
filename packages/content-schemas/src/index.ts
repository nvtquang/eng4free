import { CEFR_LEVELS, CONTENT_STATUSES, QUESTION_TYPES, SKILLS } from "@english4free/shared-types";
import { z } from "zod";
import { McqContentSchema } from "./questions";
import { QuestionAuthoringSchema } from "./question-authoring";

// Re-exporting the validator keeps import/normalization scripts on the same
// Zod version as the application schemas.
export { z } from "zod";
export * from "./questions";
export * from "./question-authoring";

export const ProvenanceSchema = z.object({
  source: z.string().url(),
  license: z.string().min(1),
  author: z.string().min(1).optional(),
  generatedBy: z.string().min(1).optional(),
  reviewedBy: z.string().min(1).optional(),
  importedAt: z.string().datetime(),
  version: z.string().min(1)
});


export const QuestionDefinitionSchema = z.object({
  id: z.string().uuid(),
  schemaVersion: z.literal(1),
  type: z.enum(QUESTION_TYPES),
  cefrLevel: z.enum(CEFR_LEVELS).optional(),
  skill: z.enum(SKILLS).optional(),
  tags: z.array(z.string().min(1)).default([]),
  content: z.unknown(),
  explanation: z.string().min(1).optional(),
  provenance: ProvenanceSchema,
  status: z.enum(CONTENT_STATUSES)
});

export const McqQuestionWithAnswerSchema = QuestionDefinitionSchema.extend({
  type: z.literal("MCQ"),
  content: McqContentSchema,
  answer: z.object({ correctOptionId: z.string().min(1) })
}).superRefine(({ answer, content }, context) => {
  if (!content.options.some((option) => option.id === answer.correctOptionId)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Answer must reference an existing option", path: ["answer", "correctOptionId"] });
  }
});

export const McqLearnerQuestionSchema = QuestionDefinitionSchema.extend({
  type: z.literal("MCQ"),
  content: McqContentSchema
});

export const SubmitAttemptSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.array(z.object({ questionId: z.string().uuid(), selectedOptionId: z.string().min(1) })).min(1)
});

export const IpaSoundSchema = z.object({
  symbol: z.string().min(1),
  keyword: z.string().min(1),
  examples: z.array(z.string().min(1)).min(1),
  kind: z.enum(["vowel", "consonant"])
});

export const MinimalPairSchema = z.object({
  id: z.string().min(1),
  first: z.string().min(1),
  second: z.string().min(1),
  contrast: z.tuple([z.string().min(1), z.string().min(1)]).refine(([first, second]) => first !== second, "Minimal-pair sounds must differ"),
  tip: z.object({ vi: z.string().min(1), en: z.string().min(1) })
});

export const ShadowingItemSchema = z.object({
  id: z.string().min(1),
  transcript: z.object({ vi: z.string().min(1), en: z.string().min(1) }),
  targetText: z.string().min(1),
  durationSeconds: z.number().int().positive(),
  focusSounds: z.array(z.string().min(1)).min(1)
});

export const WordAlignmentSchema = z.object({
  word: z.string().min(1),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
  confidence: z.number().min(0).max(1)
}).refine(({ startMs, endMs }) => endMs >= startMs, "Word alignment cannot end before it starts");

export const SpeechAnalysisRequestSchema = z.object({
  recordingMediaId: z.string().uuid(),
  expectedText: z.string().min(1).optional(),
  language: z.literal("en")
});

export const PronunciationAnalysisSchema = z.object({
  transcript: z.string(),
  words: z.array(WordAlignmentSchema),
  phonemeFeedback: z.array(z.object({ phoneme: z.string().min(1), status: z.enum(["CORRECT", "NEEDS_WORK"]), feedback: z.string().min(1) })),
  overallScore: z.number().min(0).max(100).nullable()
});

export const WritingSubmissionSchema = z.object({
  promptId: z.string().min(1).max(128),
  taskType: z.enum(["IELTS_TASK_1", "IELTS_TASK_2", "GENERAL"]),
  text: z.string().trim().min(1).max(12_000),
  language: z.literal("en"),
  expectedMinimumWords: z.number().int().positive().max(1_000).optional()
});
export const WritingPersistenceSchema = z.object({ submissionId: z.string().uuid().optional(), promptId: z.string().min(1).max(128), taskType: z.enum(["IELTS_TASK_1", "IELTS_TASK_2", "GENERAL"]), promptText: z.string().min(1).max(8_000), text: z.string().max(12_000), action: z.enum(["SAVE_DRAFT", "SUBMIT"]), examType: z.enum(["TOEIC", "IELTS"]).nullable().optional() }).superRefine(({ text, action }, context) => { if (action === "SUBMIT" && !text.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["text"], message: "Submitted writing cannot be empty" }); });
export const SpeakingSessionInputSchema = z.object({ promptId: z.string().min(1).max(128), prompt: z.string().min(1).max(8_000), examType: z.enum(["TOEIC", "IELTS"]).nullable().optional() });
export const SpeakingRubricLevelSchema = z.enum(["NEEDS_WORK", "DEVELOPING", "SECURE"]);
export const SpeakingRubricCriterionSchema = z.object({ level: SpeakingRubricLevelSchema, feedback: z.string().min(1).max(2_000) });
export const SpeakingFeedbackSchema = z.object({
  transcript: z.string().min(1).max(20_000),
  summary: z.string().min(1).max(4_000),
  rubric: z.object({ taskResponse: SpeakingRubricCriterionSchema, fluency: SpeakingRubricCriterionSchema, grammar: SpeakingRubricCriterionSchema, vocabulary: SpeakingRubricCriterionSchema }),
  corrections: z.array(z.object({ original: z.string().min(1).max(1_000), correction: z.string().min(1).max(1_000), explanation: z.string().min(1).max(2_000) })).max(12),
  strengths: z.array(z.string().min(1).max(1_000)).max(10),
  nextSteps: z.array(z.string().min(1).max(1_000)).max(10),
  disclaimer: z.string().min(1).max(500)
});

export const WritingDiagnosticsSchema = z.object({
  wordCount: z.number().int().nonnegative(),
  paragraphCount: z.number().int().nonnegative(),
  meetsExpectedWordCount: z.boolean().nullable(),
  notices: z.array(z.string())
});

export const WritingRubricLevelSchema = z.enum(["NEEDS_WORK", "DEVELOPING", "SECURE"]);
export const WritingRubricCriterionSchema = z.object({ level: WritingRubricLevelSchema, feedback: z.string().min(1).max(2_000) });
export const WritingFeedbackSchema = z.object({
  summary: z.string().min(1).max(4_000),
  /** Deliberately descriptive: these are not claimed IELTS band scores. */
  rubric: z.object({ taskResponse: WritingRubricCriterionSchema, coherenceAndCohesion: WritingRubricCriterionSchema, lexicalResource: WritingRubricCriterionSchema, grammaticalRangeAndAccuracy: WritingRubricCriterionSchema }),
  grammarIssues: z.array(z.object({ message: z.string().min(1).max(1_000), start: z.number().int().nonnegative(), end: z.number().int().nonnegative(), suggestion: z.string().min(1).max(1_000).optional() })).max(20),
  vocabularyIssues: z.array(z.object({ message: z.string().min(1).max(1_000), start: z.number().int().nonnegative(), end: z.number().int().nonnegative(), suggestion: z.string().min(1).max(1_000).optional() })).max(20),
  coherenceIssues: z.array(z.string().min(1).max(1_000)).max(10),
  revisionSuggestions: z.array(z.string().min(1).max(1_000)).max(10),
  rubricDisclaimer: z.string().min(1).max(500)
});

export const TutorRequestSchema = z.object({ attemptId: z.string().uuid(), questionId: z.string().uuid(), learnerAnswer: z.string().min(1).max(128) });
export const TutorFeedbackSchema = z.object({ correct: z.boolean(), explanation: z.string().min(1), nextStep: z.string().min(1), providerUsed: z.boolean() });
export const WritingEvaluationRequestSchema = z.object({ submissionId: z.string().uuid() });

export const AdminContentBatchSchema = z.object({ source: z.string().min(3).max(500), license: z.string().min(1).max(255), author: z.string().min(1).max(255).optional(), version: z.string().min(1).max(64) });
export const AdminCourseSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(128), title: z.string().min(1).max(255), description: z.string().max(4_000).optional(), cefrLevel: z.enum(CEFR_LEVELS), unitTitle: z.string().min(1).max(255), contentBatchId: z.string().uuid().optional() });
export const AdminLessonSchema = z.object({ unitId: z.string().uuid(), slug: z.string().regex(/^[a-z0-9-]+$/).max(128), title: z.string().min(1).max(255), skill: z.enum(SKILLS), estimatedMinutes: z.number().int().positive().max(600), contentBatchId: z.string().uuid().optional() });
export const LessonRichTextContentSchema = z.object({ heading: z.string().min(1).max(255), body: z.string().min(1).max(20_000) });
export const LessonListeningContentSchema = z.object({ heading: z.string().min(1).max(255), transcript: z.string().min(1).max(20_000), playbackText: z.string().min(1).max(20_000).optional(), mediaId: z.string().uuid().optional(), sourceLabel: z.string().min(1).max(255) }).refine((content) => Boolean(content.playbackText || content.mediaId), { message: "Listening content requires browser speech text or a media asset" });
export const LessonQuestionSetContentSchema = z.object({ instruction: z.string().min(1).max(2_000), questions: z.array(z.object({ id: z.string().uuid(), prompt: z.string().min(1).max(8_000), options: z.array(z.object({ id: z.string().min(1).max(64), text: z.string().min(1).max(2_000) })).min(2).max(8), correctOptionId: z.string().min(1).max(64), explanation: z.string().min(1).max(8_000) }).superRefine(({ options, correctOptionId }, context) => { if (!options.some((option) => option.id === correctOptionId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["correctOptionId"], message: "Correct option must exist" }); })).min(1).max(30) });
export const AdminLessonBlockSchema = z.discriminatedUnion("type", [
  z.object({ lessonId: z.string().uuid(), type: z.literal("RICH_TEXT"), sortOrder: z.number().int().nonnegative().max(1000), schemaVersion: z.literal(1), content: LessonRichTextContentSchema }),
  z.object({ lessonId: z.string().uuid(), type: z.literal("GRAMMAR"), sortOrder: z.number().int().nonnegative().max(1000), schemaVersion: z.literal(1), content: LessonRichTextContentSchema }),
  z.object({ lessonId: z.string().uuid(), type: z.literal("PRONUNCIATION"), sortOrder: z.number().int().nonnegative().max(1000), schemaVersion: z.literal(1), content: LessonRichTextContentSchema }),
  z.object({ lessonId: z.string().uuid(), type: z.literal("MEDIA"), sortOrder: z.number().int().nonnegative().max(1000), schemaVersion: z.literal(1), content: LessonListeningContentSchema }),
  z.object({ lessonId: z.string().uuid(), type: z.literal("QUESTION_SET"), sortOrder: z.number().int().nonnegative().max(1000), schemaVersion: z.literal(1), content: LessonQuestionSetContentSchema })
]);
export const AdminPublishLessonSchema = z.object({ lessonId: z.string().uuid() });
export const AdminExamSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(128), title: z.string().min(1).max(255), type: z.enum(["TOEIC", "IELTS"]), mode: z.enum(["PRACTICE", "MINI_TEST", "FULL_MOCK"]).default("PRACTICE"), durationSeconds: z.number().int().positive().max(24 * 60 * 60), partNumber: z.number().int().positive().max(7), partTitle: z.string().min(1).max(255), skill: z.enum(SKILLS), contentBatchId: z.string().uuid().optional() });
export const AdminExamPartSchema = z.object({ examId: z.string().uuid(), partNumber: z.number().int().positive().max(7), title: z.string().min(1).max(255), skill: z.enum(SKILLS), instructions: z.string().max(8_000).optional(), durationSeconds: z.number().int().positive().max(24 * 60 * 60).optional() });
export const AdminMcqQuestionSchema = z.object({ examPartId: z.string().uuid(), passageId: z.string().uuid().optional(), prompt: z.string().min(1).max(8_000), options: z.array(z.object({ id: z.string().min(1).max(32), text: z.string().min(1).max(2_000) })).min(2).max(8), correctOptionId: z.string().min(1).max(32), explanation: z.string().min(1).max(8_000), tags: z.array(z.string().min(1).max(64)).max(20).default([]) }).superRefine(({ options, correctOptionId }, context) => { if (!options.some((option) => option.id === correctOptionId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["correctOptionId"], message: "Correct option must exist" }); });
/** CMS question in the shared flat authoring format; any gradable type. */
export const AdminQuestionSchema = z.object({ examPartId: z.string().uuid(), passageId: z.string().uuid().optional(), explanation: z.string().min(1).max(8_000), tags: z.array(z.string().min(1).max(64)).max(20).default([]), authoring: QuestionAuthoringSchema });
/** Accepts the current payload and the original MCQ-only payload. */
export const AdminAnyQuestionSchema = z.union([AdminQuestionSchema, AdminMcqQuestionSchema]);
export const AdminMediaSchema = z.object({ kind: z.enum(["AUDIO", "IMAGE", "RECORDING"]), storageKey: z.string().min(3).max(1_000), contentType: z.string().min(3).max(128), byteSize: z.number().int().positive().max(250_000_000) });
export const AdminVocabularySchema = z.object({ headword: z.string().min(1).max(255), partOfSpeech: z.string().min(1).max(64), cefrLevel: z.enum(CEFR_LEVELS), ipa: z.string().max(255).optional(), meaning: z.string().min(1).max(4_000), example: z.string().min(1).max(4_000), tags: z.array(z.string().min(1).max(64)).max(20).default([]), contentBatchId: z.string().uuid().optional() });
export const AdminPassageSchema = z.object({ examPartId: z.string().uuid(), title: z.string().min(1).max(255), content: z.string().min(1).max(30_000), sortOrder: z.number().int().positive().max(1000) });
export const AdminBlockMutationSchema = z.object({ blockId: z.string().uuid(), sortOrder: z.number().int().nonnegative().max(1000).optional(), action: z.enum(["REORDER", "DELETE"]) }).superRefine(({ action, sortOrder }, context) => { if (action === "REORDER" && sortOrder === undefined) context.addIssue({ code: z.ZodIssueCode.custom, path: ["sortOrder"], message: "Sort order is required" }); });
export const AdminPublishExamSchema = z.object({ examId: z.string().uuid() });

export const ContentImportTargetSchema = z.enum(["LESSON", "EXAM"]);
export const ContentImportLessonMappingSchema = z.object({
  importId: z.string().uuid(), target: z.literal("LESSON"), unitId: z.string().uuid(), slug: z.string().regex(/^[a-z0-9-]+$/).max(128), title: z.string().min(1).max(255), skill: z.enum(SKILLS), estimatedMinutes: z.number().int().positive().max(600), sectionIndexes: z.array(z.number().int().nonnegative()).min(1).optional()
});
export const ContentImportExamMappingSchema = z.object({
  importId: z.string().uuid(), target: z.literal("EXAM"), slug: z.string().regex(/^[a-z0-9-]+$/).max(128), title: z.string().min(1).max(255), type: z.enum(["TOEIC", "IELTS"]), mode: z.enum(["PRACTICE", "MINI_TEST", "FULL_MOCK"]), durationSeconds: z.number().int().positive().max(24 * 60 * 60), sheetName: z.string().min(1).max(255), defaultPartNumber: z.number().int().positive().max(7), defaultPartTitle: z.string().min(1).max(255), defaultSkill: z.enum(["LISTENING", "READING"]), columns: z.object({ partNumber: z.string().max(255).optional(), partTitle: z.string().max(255).optional(), skill: z.string().max(255).optional(), passageTitle: z.string().max(255).optional(), passage: z.string().max(255).optional(), questionType: z.string().max(255).optional(), question: z.string().min(1).max(255), optionA: z.string().max(255).optional(), optionB: z.string().max(255).optional(), optionC: z.string().max(255).optional(), optionD: z.string().max(255).optional(), optionE: z.string().max(255).optional(), optionF: z.string().max(255).optional(), correctOption: z.string().max(255).optional(), acceptedAnswers: z.string().max(255).optional(), items: z.string().max(255).optional(), audioText: z.string().max(255).optional(), wordLimit: z.string().max(255).optional(), explanation: z.string().max(255).optional(), tags: z.string().max(255).optional() })
});
export const ContentImportApplySchema = z.discriminatedUnion("target", [ContentImportLessonMappingSchema, ContentImportExamMappingSchema]);

export type McqQuestionWithAnswer = z.infer<typeof McqQuestionWithAnswerSchema>;
export type McqLearnerQuestion = z.infer<typeof McqLearnerQuestionSchema>;
export type SubmitAttempt = z.infer<typeof SubmitAttemptSchema>;
export type IpaSound = z.infer<typeof IpaSoundSchema>;
export type MinimalPair = z.infer<typeof MinimalPairSchema>;
export type ShadowingItem = z.infer<typeof ShadowingItemSchema>;
export type WordAlignment = z.infer<typeof WordAlignmentSchema>;
export type SpeechAnalysisRequest = z.infer<typeof SpeechAnalysisRequestSchema>;
export type PronunciationAnalysis = z.infer<typeof PronunciationAnalysisSchema>;
export type WritingSubmission = z.infer<typeof WritingSubmissionSchema>;
export type WritingDiagnostics = z.infer<typeof WritingDiagnosticsSchema>;
export type WritingFeedback = z.infer<typeof WritingFeedbackSchema>;
export type WritingEvaluationRequest = z.infer<typeof WritingEvaluationRequestSchema>;
export type WritingPersistence = z.infer<typeof WritingPersistenceSchema>;
export type SpeakingSessionInput = z.infer<typeof SpeakingSessionInputSchema>;
export type SpeakingFeedback = z.infer<typeof SpeakingFeedbackSchema>;
export type TutorRequest = z.infer<typeof TutorRequestSchema>;
export type TutorFeedback = z.infer<typeof TutorFeedbackSchema>;
export type LessonQuestionSetContent = z.infer<typeof LessonQuestionSetContentSchema>;
export type LessonListeningContent = z.infer<typeof LessonListeningContentSchema>;
export type AdminLessonBlock = z.infer<typeof AdminLessonBlockSchema>;
export type ContentImportApply = z.infer<typeof ContentImportApplySchema>;

export function toLearnerQuestion(question: McqQuestionWithAnswer): McqLearnerQuestion {
  const { answer: _answer, ...learnerQuestion } = question;
  return learnerQuestion;
}
