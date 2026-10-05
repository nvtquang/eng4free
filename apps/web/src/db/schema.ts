import { boolean, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid, varchar, integer, real, uniqueIndex, index } from "drizzle-orm/pg-core";

export const contentStatus = pgEnum("content_status", ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]);
export const examType = pgEnum("exam_type", ["TOEIC", "IELTS"]);
export const attemptStatus = pgEnum("attempt_status", ["IN_PROGRESS", "SUBMITTED", "EXPIRED"]);
export const lessonBlockType = pgEnum("lesson_block_type", ["RICH_TEXT", "VOCABULARY", "GRAMMAR", "MEDIA", "QUESTION_SET", "PRONUNCIATION"]);
export const writingSubmissionStatus = pgEnum("writing_submission_status", ["DRAFT", "SUBMITTED", "EVALUATED", "FAILED"]);
export const speakingSessionStatus = pgEnum("speaking_session_status", ["IN_PROGRESS", "COMPLETED", "FAILED"]);

export const contentBatches = pgTable("content_batches", {
  id: uuid("id").primaryKey(),
  source: text("source").notNull(),
  license: varchar("license", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  generatedBy: varchar("generated_by", { length: 255 }),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  status: contentStatus("status").notNull().default("DRAFT")
});

/** Raw author uploads and their normalized staging data. These records are not
 * learner-visible; publication continues through the normal content workflow. */
export const contentImports = pgTable("content_imports", {
  id: uuid("id").primaryKey(),
  contentBatchId: uuid("content_batch_id").notNull().references(() => contentBatches.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 512 }).notNull(),
  fileType: varchar("file_type", { length: 16 }).notNull(),
  contentType: varchar("content_type", { length: 128 }).notNull(),
  byteSize: integer("byte_size").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  targetType: varchar("target_type", { length: 16 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("EXTRACTED"),
  extraction: jsonb("extraction").notNull().default({}),
  mapping: jsonb("mapping").notNull().default({}),
  result: jsonb("result").notNull().default({}),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image")
});

/** One row per person learning. A guest cookie or an account is only a link to a learner (learner_links). */
export const learners = pgTable("learners", { id: uuid("id").primaryKey(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow() });
/** kind USER: external_id is users.id; kind GUEST: external_id is the anonymous cookie id. */
export const learnerLinks = pgTable("learner_links", { kind: varchar("kind", { length: 8 }).notNull(), externalId: uuid("external_id").notNull(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [primaryKey({ columns: [table.kind, table.externalId] }), index("learner_links_learner_idx").on(table.learnerId)]);

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  // Keep Auth.js adapter field names here. The physical columns remain snake_case,
  // while these property names match AdapterAccount's persisted shape.
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 })
}, (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull()
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull()
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);

export const exams = pgTable("exams", {
  id: uuid("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  type: examType("type").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  mode: varchar("mode", { length: 24 }).notNull().default("PRACTICE"),
  metadata: jsonb("metadata").notNull().default({}),
  status: contentStatus("status").notNull().default("DRAFT"),
  contentBatchId: uuid("content_batch_id").references(() => contentBatches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const examParts = pgTable("exam_parts", {
  id: uuid("id").primaryKey(),
  examId: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  partNumber: integer("part_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
  instructions: text("instructions"),
  durationSeconds: integer("duration_seconds")
  , skill: varchar("skill", { length: 16 })
  , metadata: jsonb("metadata").notNull().default({})
});

export const passages = pgTable("passages", {
  id: uuid("id").primaryKey(),
  examPartId: uuid("exam_part_id").notNull().references(() => examParts.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull().default(1),
  metadata: jsonb("metadata").notNull().default({})
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey(),
  examPartId: uuid("exam_part_id").notNull().references(() => examParts.id, { onDelete: "cascade" }),
  passageId: uuid("passage_id").references(() => passages.id, { onDelete: "set null" }),
  groupKey: varchar("group_key", { length: 128 }),
  schemaVersion: integer("schema_version").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  content: jsonb("content").notNull(),
  answer: jsonb("answer").notNull(),
  explanation: text("explanation"),
  tags: jsonb("tags").notNull(),
  status: contentStatus("status").notNull().default("DRAFT"),
  contentBatchId: uuid("content_batch_id").references(() => contentBatches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey(),
  examId: uuid("exam_id").notNull().references(() => exams.id),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  status: attemptStatus("status").notNull().default("IN_PROGRESS"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  rawScore: integer("raw_score"),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("attempts_learner_idx").on(table.learnerId, table.createdAt)]);

export const attemptAnswers = pgTable("attempt_answers", {
  attemptId: uuid("attempt_id").notNull().references(() => attempts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  /** Legacy single-choice answer; kept in sync for MCQ. */
  selectedOptionId: varchar("selected_option_id", { length: 128 }),
  /** Structured learner response for every question type. */
  response: jsonb("response"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [primaryKey({ columns: [table.attemptId, table.questionId] })]);

export const courses = pgTable("courses", { id: uuid("id").primaryKey(), slug: varchar("slug", { length: 128 }).notNull().unique(), title: varchar("title", { length: 255 }).notNull(), description: text("description"), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() });
export const courseLevels = pgTable("course_levels", { id: uuid("id").primaryKey(), courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }), cefrLevel: varchar("cefr_level", { length: 2 }).notNull(), sortOrder: integer("sort_order").notNull(), title: varchar("title", { length: 255 }).notNull() });
export const courseUnits = pgTable("course_units", { id: uuid("id").primaryKey(), courseLevelId: uuid("course_level_id").notNull().references(() => courseLevels.id, { onDelete: "cascade" }), slug: varchar("slug", { length: 128 }).notNull(), title: varchar("title", { length: 255 }).notNull(), sortOrder: integer("sort_order").notNull() }, (table) => [uniqueIndex("course_units_level_slug_idx").on(table.courseLevelId, table.slug)]);
export const lessons = pgTable("lessons", { id: uuid("id").primaryKey(), unitId: uuid("unit_id").notNull().references(() => courseUnits.id, { onDelete: "cascade" }), slug: varchar("slug", { length: 128 }).notNull(), title: varchar("title", { length: 255 }).notNull(), skill: varchar("skill", { length: 16 }), estimatedMinutes: integer("estimated_minutes").notNull(), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("lessons_unit_slug_idx").on(table.unitId, table.slug)]);
export const lessonBlocks = pgTable("lesson_blocks", { id: uuid("id").primaryKey(), lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }), type: lessonBlockType("type").notNull(), sortOrder: integer("sort_order").notNull(), schemaVersion: integer("schema_version").notNull(), content: jsonb("content").notNull() });
export const lessonCompletions = pgTable("lesson_completions", { id: uuid("id").primaryKey(), lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), rawScore: integer("raw_score").notNull(), totalQuestions: integer("total_questions").notNull(), completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("lesson_completions_learner_lesson_idx").on(table.learnerId, table.lessonId)]);
/**
 * The vocabulary catalogue. PostgreSQL is its only home: editors change words in the CMS and
 * scripts add new words as DRAFT rows (see modules/vocabulary/catalog.ts).
 * senseGroups: Wiktionary's Vietnamese translation groups; senseChoice: the reviewer's pick
 * (group indexes or "group.word"). Only reviewed words (reviewedAt set) are published.
 */
export const vocabulary = pgTable("vocabulary", { id: uuid("id").primaryKey(), headword: varchar("headword", { length: 255 }).notNull(), partOfSpeech: varchar("part_of_speech", { length: 64 }), cefrLevel: varchar("cefr_level", { length: 2 }), ipa: varchar("ipa", { length: 255 }), meaning: text("meaning"), example: text("example"), audioMediaId: uuid("audio_media_id"), tags: jsonb("tags").notNull().default([]), attribution: jsonb("attribution").notNull().default({}), senseGroups: jsonb("sense_groups").notNull().default([]), senseChoice: jsonb("sense_choice").notNull().default([0]), reviewedBy: varchar("reviewed_by", { length: 255 }), reviewedAt: timestamp("reviewed_at", { withTimezone: true }), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("vocabulary_headword_pos_level_idx").on(table.headword, table.partOfSpeech, table.cefrLevel)]);
/** Every change to a word: action (CREATE | UPDATE | REVIEW | EXCLUDE | PUBLISH), each changed field as [before, after], who and when. */
export const vocabularyRevisions = pgTable("vocabulary_revisions", { id: uuid("id").primaryKey(), vocabularyId: uuid("vocabulary_id").notNull().references(() => vocabulary.id, { onDelete: "cascade" }), action: varchar("action", { length: 32 }).notNull(), changes: jsonb("changes").notNull().default({}), changedBy: varchar("changed_by", { length: 255 }).notNull(), changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [index("vocabulary_revisions_word_idx").on(table.vocabularyId, table.changedAt)]);
/** Words a reviewer decided not to teach; the candidate script never adds them again. */
export const vocabularyExclusions = pgTable("vocabulary_exclusions", { headword: varchar("headword", { length: 255 }).notNull(), partOfSpeech: varchar("part_of_speech", { length: 64 }).notNull(), reason: text("reason").notNull(), decidedBy: varchar("decided_by", { length: 255 }).notNull(), decidedAt: timestamp("decided_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [primaryKey({ columns: [table.headword, table.partOfSpeech] })]);
/** Groups of free speaking/writing topics (kind FREE_SPEAKING | FREE_WRITING); title and note are { vi, en }. */
export const topicCategories = pgTable("topic_categories", { id: uuid("id").primaryKey(), kind: varchar("kind", { length: 32 }).notNull(), slug: varchar("slug", { length: 128 }).notNull().unique(), title: jsonb("title").notNull(), note: jsonb("note"), sortOrder: integer("sort_order").notNull().default(0), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() });
/**
 * Every practice topic: free speaking/writing topics and IELTS Writing/Speaking tasks.
 * kind: FREE_SPEAKING | FREE_WRITING | IELTS_SPEAKING | IELTS_WRITING_TASK_1 | IELTS_WRITING_TASK_2.
 * Speaking sessions and writing submissions reference a topic by id.
 */
export const topics = pgTable("topics", { id: uuid("id").primaryKey(), slug: varchar("slug", { length: 128 }).notNull().unique(), kind: varchar("kind", { length: 32 }).notNull(), categoryId: uuid("category_id").references(() => topicCategories.id, { onDelete: "set null" }), title: varchar("title", { length: 255 }).notNull(), content: jsonb("content").notNull(), sortOrder: integer("sort_order").notNull().default(0), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [index("topics_kind_status_idx").on(table.kind, table.status, table.sortOrder)]);
/** IPA sounds, minimal pairs and shadowing sentences (kind SOUND | PAIR | SHADOW). */
export const pronunciationItems = pgTable("pronunciation_items", { id: uuid("id").primaryKey(), kind: varchar("kind", { length: 16 }).notNull(), slug: varchar("slug", { length: 128 }).notNull().unique(), content: jsonb("content").notNull(), sortOrder: integer("sort_order").notNull().default(0), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [index("pronunciation_items_kind_idx").on(table.kind, table.status, table.sortOrder)]);
/** Import change detection: the authored item's hash and the hash last published, per pack item key. */
export const contentItemHashes = pgTable("content_item_hashes", { itemKey: varchar("item_key", { length: 255 }).primaryKey(), batchId: uuid("batch_id").notNull().references(() => contentBatches.id, { onDelete: "cascade" }), hash: varchar("hash", { length: 64 }).notNull(), publishedHash: varchar("published_hash", { length: 64 }), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [index("content_item_hashes_batch_idx").on(table.batchId)]);
export const vocabularyReviews = pgTable("vocabulary_reviews", { id: uuid("id").primaryKey(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), vocabularyId: uuid("vocabulary_id").notNull().references(() => vocabulary.id, { onDelete: "cascade" }), dueAt: timestamp("due_at", { withTimezone: true }).notNull(), lastReview: timestamp("last_review", { withTimezone: true }), difficulty: real("difficulty").notNull(), stability: real("stability").notNull(), retrievability: real("retrievability").notNull(), elapsedDays: integer("elapsed_days").notNull(), scheduledDays: integer("scheduled_days").notNull(), learningSteps: integer("learning_steps").notNull(), repetitions: integer("repetitions").notNull(), lapses: integer("lapses").notNull(), fsrsState: integer("fsrs_state").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("vocabulary_reviews_learner_vocab_idx").on(table.learnerId, table.vocabularyId), index("vocabulary_reviews_learner_due_idx").on(table.learnerId, table.dueAt)]);
export const writingSubmissions = pgTable("writing_submissions", { id: uuid("id").primaryKey(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), examType: examType("exam_type"), topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }), /** Free-text id used before topics existed; only read to link old history. */ legacyPromptId: varchar("legacy_prompt_id", { length: 128 }), taskType: varchar("task_type", { length: 64 }).notNull(), prompt: jsonb("prompt").notNull(), text: text("text").notNull(), wordCount: integer("word_count").notNull().default(0), status: writingSubmissionStatus("status").notNull().default("DRAFT"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(), submittedAt: timestamp("submitted_at", { withTimezone: true }) }, (table) => [index("writing_submissions_learner_topic_idx").on(table.learnerId, table.topicId)]);
export const writingRevisions = pgTable("writing_revisions", { id: uuid("id").primaryKey(), submissionId: uuid("submission_id").notNull().references(() => writingSubmissions.id, { onDelete: "cascade" }), text: text("text").notNull(), wordCount: integer("word_count").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() });
export const writingFeedback = pgTable("writing_feedback", { id: uuid("id").primaryKey(), submissionId: uuid("submission_id").notNull().references(() => writingSubmissions.id, { onDelete: "cascade" }), revisionId: uuid("revision_id").references(() => writingRevisions.id, { onDelete: "set null" }), provider: varchar("provider", { length: 128 }).notNull(), model: varchar("model", { length: 128 }), kind: varchar("kind", { length: 32 }).notNull().default("AI_PRACTICE"), content: jsonb("content").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [index("writing_feedback_submission_created_idx").on(table.submissionId, table.createdAt), uniqueIndex("writing_feedback_revision_provider_idx").on(table.revisionId, table.provider)]);
/** Explanation history is scoped to a submitted attempt and never exposes an answer key. */
export const tutorFeedback = pgTable("tutor_feedback", { id: uuid("id").primaryKey(), attemptId: uuid("attempt_id").notNull().references(() => attempts.id, { onDelete: "cascade" }), questionId: uuid("question_id").notNull(), learnerAnswer: varchar("learner_answer", { length: 128 }).notNull(), provider: varchar("provider", { length: 64 }).notNull(), content: jsonb("content").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("tutor_feedback_attempt_question_answer_idx").on(table.attemptId, table.questionId, table.learnerAnswer), index("tutor_feedback_attempt_created_idx").on(table.attemptId, table.createdAt)]);
export const speakingSessions = pgTable("speaking_sessions", { id: uuid("id").primaryKey(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), examType: examType("exam_type"), topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }), /** IELTS part within the topic, e.g. "part2" or "part3:1"; null for free topics. */ part: varchar("part", { length: 16 }), /** Free-text id used before topics existed; only read to link old history. */ legacyPromptId: varchar("legacy_prompt_id", { length: 128 }), prompt: text("prompt").notNull().default("Speak about the topic."), status: speakingSessionStatus("status").notNull().default("IN_PROGRESS"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), completedAt: timestamp("completed_at", { withTimezone: true }) }, (table) => [index("speaking_sessions_learner_topic_idx").on(table.learnerId, table.topicId, table.part)]);
export const speakingTurns = pgTable("speaking_turns", { id: uuid("id").primaryKey(), sessionId: uuid("session_id").notNull().references(() => speakingSessions.id, { onDelete: "cascade" }), turnOrder: integer("turn_order").notNull(), prompt: text("prompt"), transcript: text("transcript"), audioMediaId: uuid("audio_media_id"), durationMs: integer("duration_ms"), feedback: jsonb("feedback"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("speaking_turns_session_order_idx").on(table.sessionId, table.turnOrder)]);
export const progressEvents = pgTable("progress_events", { id: uuid("id").primaryKey(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), type: varchar("type", { length: 64 }).notNull(), skill: varchar("skill", { length: 16 }), sourceType: varchar("source_type", { length: 64 }), sourceId: varchar("source_id", { length: 128 }), idempotencyKey: varchar("idempotency_key", { length: 255 }), metadata: jsonb("metadata").notNull().default({}), occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("progress_events_idempotency_idx").on(table.idempotencyKey), index("progress_events_learner_idx").on(table.learnerId, table.occurredAt)]);
export const media = pgTable("media", { id: uuid("id").primaryKey(), /** Set for learner recordings; null for published content media. */ learnerId: uuid("learner_id").references(() => learners.id, { onDelete: "set null" }), kind: varchar("kind", { length: 32 }).notNull(), storageKey: text("storage_key").notNull().unique(), contentType: varchar("content_type", { length: 128 }).notNull(), byteSize: integer("byte_size").notNull(), status: varchar("status", { length: 32 }).notNull().default("PENDING"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [index("media_learner_idx").on(table.learnerId)]);
/** One row per learner (guest or account) from onboarding; drives the "what to do next" page. levelSource is SELF or PLACEMENT. */
export const placementItems = pgTable("placement_items", { id: uuid("id").primaryKey(), slug: varchar("slug", { length: 128 }).notNull().unique(), skill: varchar("skill", { length: 16 }).notNull(), cefrLevel: varchar("cefr_level", { length: 2 }).notNull(), content: jsonb("content").notNull(), answer: jsonb("answer").notNull(), sortOrder: integer("sort_order").notNull().default(0), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [index("placement_items_skill_level_idx").on(table.skill, table.cefrLevel, table.status)]);
export const placementAttempts = pgTable("placement_attempts", { id: uuid("id").primaryKey(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), state: jsonb("state").notNull(), result: jsonb("result"), startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(), completedAt: timestamp("completed_at", { withTimezone: true }) }, (table) => [index("placement_attempts_learner_idx").on(table.learnerId, table.startedAt)]);
export const learnerProfiles = pgTable("learner_profiles", { id: uuid("id").primaryKey(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), goal: varchar("goal", { length: 16 }).notNull(), cefrLevel: varchar("cefr_level", { length: 2 }).notNull(), levelSource: varchar("level_source", { length: 16 }).notNull().default("SELF"), minutesPerDay: integer("minutes_per_day").notNull(), placementScore: integer("placement_score"), placementTotal: integer("placement_total"), skillLevels: jsonb("skill_levels"), completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("learner_profiles_learner_idx").on(table.learnerId)]);
/** Wrong answers gathered from lessons and exams for re-practice (the learner's "mistake notebook"). One row per owner+question; resolvedAt is set once they answer it correctly again. */
export const mistakes = pgTable("mistakes", { id: uuid("id").primaryKey(), learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }), sourceType: varchar("source_type", { length: 16 }).notNull(), sourceId: varchar("source_id", { length: 128 }).notNull(), sourceTitle: varchar("source_title", { length: 255 }), questionId: varchar("question_id", { length: 128 }).notNull(), skill: varchar("skill", { length: 16 }), prompt: text("prompt").notNull(), options: jsonb("options").notNull().default([]), correctOptionId: varchar("correct_option_id", { length: 64 }).notNull(), explanation: text("explanation"), timesWrong: integer("times_wrong").notNull().default(1), resolvedAt: timestamp("resolved_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("mistakes_learner_question_idx").on(table.learnerId, table.questionId), index("mistakes_learner_resolved_idx").on(table.learnerId, table.resolvedAt)]);
export const mediaProcessingJobs = pgTable("media_processing_jobs", { id: uuid("id").primaryKey(), type: varchar("type", { length: 64 }).notNull(), status: varchar("status", { length: 32 }).notNull().default("PENDING"), payload: jsonb("payload").notNull(), attempts: integer("attempts").notNull().default(0), error: text("error"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() });

/**
 * Operational records for server-side AI calls. Neither table stores API keys or
 * raw request text: cache keys and usage input hashes are SHA-256 digests.
 */
export const aiResponseCache = pgTable("ai_response_cache", {
  id: uuid("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 64 }).notNull().unique(),
  operation: varchar("operation", { length: 64 }).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  response: jsonb("response").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("ai_response_cache_expiry_idx").on(table.expiresAt)]);

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: uuid("id").primaryKey(),
  learnerId: uuid("learner_id").references(() => learners.id, { onDelete: "set null" }),
  operation: varchar("operation", { length: 64 }).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  model: varchar("model", { length: 128 }),
  inputHash: varchar("input_hash", { length: 64 }).notNull(),
  cacheHit: boolean("cache_hit").notNull().default(false),
  status: varchar("status", { length: 32 }).notNull(),
  latencyMs: integer("latency_ms"),
  promptTokens: integer("prompt_tokens"),
  responseTokens: integer("response_tokens"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("ai_usage_logs_learner_created_idx").on(table.learnerId, table.createdAt), index("ai_usage_logs_operation_created_idx").on(table.operation, table.createdAt)]);

export const rateLimitCounters = pgTable("rate_limit_counters", {
  key: varchar("key", { length: 255 }).notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
}, (table) => [primaryKey({ columns: [table.key, table.windowStart] }), index("rate_limit_counters_expires_idx").on(table.expiresAt)]);

export const telemetryEvents = pgTable("telemetry_events", {
  id: uuid("id").primaryKey(),
  /** "event" for product events, "error" for server and browser errors. */
  kind: varchar("kind", { length: 8 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  message: text("message"),
  path: varchar("path", { length: 512 }),
  properties: jsonb("properties").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("telemetry_events_kind_created_idx").on(table.kind, table.createdAt), index("telemetry_events_name_created_idx").on(table.name, table.createdAt)]);

/** Study reminder emails, opt-in per account. `hour` is the local hour in Vietnam. */
export const reminderPreferences = pgTable("reminder_preferences", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  hour: integer("hour").notNull().default(19),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
