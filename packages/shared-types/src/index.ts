export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const SKILLS = ["LISTENING", "SPEAKING", "READING", "WRITING"] as const;
export type Skill = (typeof SKILLS)[number];

export const CONTENT_STATUSES = ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const QUESTION_TYPES = ["MCQ", "MULTI_SELECT", "TRUE_FALSE", "FILL_BLANK", "MATCHING", "ORDERING", "DICTATION", "SHORT_WRITING", "ESSAY", "RECORDING", "SPEAKING_RESPONSE"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export type ProgressEventType =
  | "LESSON_COMPLETED"
  | "QUESTION_ANSWERED"
  | "VOCAB_REVIEWED"
  | "EXAM_COMPLETED"
  | "SPEAKING_SESSION_COMPLETED"
  | "WRITING_SUBMITTED";

