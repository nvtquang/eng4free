import { jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid, varchar, integer, real, uniqueIndex } from "drizzle-orm/pg-core";

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
  userId: uuid("user_id").references(() => users.id),
  guestId: uuid("guest_id"),
  status: attemptStatus("status").notNull().default("IN_PROGRESS"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  rawScore: integer("raw_score"),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const attemptAnswers = pgTable("attempt_answers", {
  attemptId: uuid("attempt_id").notNull().references(() => attempts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  selectedOptionId: varchar("selected_option_id", { length: 128 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [primaryKey({ columns: [table.attemptId, table.questionId] })]);

export const courses = pgTable("courses", { id: uuid("id").primaryKey(), slug: varchar("slug", { length: 128 }).notNull().unique(), title: varchar("title", { length: 255 }).notNull(), description: text("description"), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() });
export const courseLevels = pgTable("course_levels", { id: uuid("id").primaryKey(), courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }), cefrLevel: varchar("cefr_level", { length: 2 }).notNull(), sortOrder: integer("sort_order").notNull(), title: varchar("title", { length: 255 }).notNull() });
export const courseUnits = pgTable("course_units", { id: uuid("id").primaryKey(), courseLevelId: uuid("course_level_id").notNull().references(() => courseLevels.id, { onDelete: "cascade" }), slug: varchar("slug", { length: 128 }).notNull(), title: varchar("title", { length: 255 }).notNull(), sortOrder: integer("sort_order").notNull() }, (table) => [uniqueIndex("course_units_level_slug_idx").on(table.courseLevelId, table.slug)]);
export const lessons = pgTable("lessons", { id: uuid("id").primaryKey(), unitId: uuid("unit_id").notNull().references(() => courseUnits.id, { onDelete: "cascade" }), slug: varchar("slug", { length: 128 }).notNull(), title: varchar("title", { length: 255 }).notNull(), skill: varchar("skill", { length: 16 }), estimatedMinutes: integer("estimated_minutes").notNull(), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("lessons_unit_slug_idx").on(table.unitId, table.slug)]);
export const lessonBlocks = pgTable("lesson_blocks", { id: uuid("id").primaryKey(), lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }), type: lessonBlockType("type").notNull(), sortOrder: integer("sort_order").notNull(), schemaVersion: integer("schema_version").notNull(), content: jsonb("content").notNull() });
export const lessonCompletions = pgTable("lesson_completions", { id: uuid("id").primaryKey(), lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }), ownerKey: varchar("owner_key", { length: 64 }).notNull(), userId: uuid("user_id").references(() => users.id), guestId: uuid("guest_id"), rawScore: integer("raw_score").notNull(), totalQuestions: integer("total_questions").notNull(), completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("lesson_completions_lesson_owner_idx").on(table.lessonId, table.ownerKey)]);
export const vocabulary = pgTable("vocabulary", { id: uuid("id").primaryKey(), headword: varchar("headword", { length: 255 }).notNull(), partOfSpeech: varchar("part_of_speech", { length: 64 }), cefrLevel: varchar("cefr_level", { length: 2 }), ipa: varchar("ipa", { length: 255 }), meaning: text("meaning"), example: text("example"), audioMediaId: uuid("audio_media_id"), tags: jsonb("tags").notNull().default([]), status: contentStatus("status").notNull().default("DRAFT"), contentBatchId: uuid("content_batch_id").references(() => contentBatches.id), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("vocabulary_headword_pos_level_idx").on(table.headword, table.partOfSpeech, table.cefrLevel)]);
export const vocabularyReviews = pgTable("vocabulary_reviews", { id: uuid("id").primaryKey(), userId: uuid("user_id").notNull(), vocabularyId: uuid("vocabulary_id").notNull().references(() => vocabulary.id, { onDelete: "cascade" }), dueAt: timestamp("due_at", { withTimezone: true }).notNull(), lastReview: timestamp("last_review", { withTimezone: true }), difficulty: real("difficulty").notNull(), stability: real("stability").notNull(), retrievability: real("retrievability").notNull(), elapsedDays: integer("elapsed_days").notNull(), scheduledDays: integer("scheduled_days").notNull(), learningSteps: integer("learning_steps").notNull(), repetitions: integer("repetitions").notNull(), lapses: integer("lapses").notNull(), fsrsState: integer("fsrs_state").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("vocabulary_reviews_user_vocab_idx").on(table.userId, table.vocabularyId)]);
export const writingSubmissions = pgTable("writing_submissions", { id: uuid("id").primaryKey(), userId: uuid("user_id").references(() => users.id), guestId: uuid("guest_id"), examType: examType("exam_type"), promptId: varchar("prompt_id", { length: 128 }).notNull().default("general-writing"), taskType: varchar("task_type", { length: 64 }).notNull(), prompt: jsonb("prompt").notNull(), text: text("text").notNull(), wordCount: integer("word_count").notNull().default(0), status: writingSubmissionStatus("status").notNull().default("DRAFT"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(), submittedAt: timestamp("submitted_at", { withTimezone: true }) });
export const writingRevisions = pgTable("writing_revisions", { id: uuid("id").primaryKey(), submissionId: uuid("submission_id").notNull().references(() => writingSubmissions.id, { onDelete: "cascade" }), text: text("text").notNull(), wordCount: integer("word_count").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() });
export const writingFeedback = pgTable("writing_feedback", { id: uuid("id").primaryKey(), submissionId: uuid("submission_id").notNull().references(() => writingSubmissions.id, { onDelete: "cascade" }).unique(), provider: varchar("provider", { length: 128 }).notNull(), model: varchar("model", { length: 128 }), content: jsonb("content").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() });
export const speakingSessions = pgTable("speaking_sessions", { id: uuid("id").primaryKey(), userId: uuid("user_id").references(() => users.id), guestId: uuid("guest_id"), examType: examType("exam_type"), promptId: varchar("prompt_id", { length: 128 }).notNull().default("general-speaking"), prompt: text("prompt").notNull().default("Speak about the topic."), status: speakingSessionStatus("status").notNull().default("IN_PROGRESS"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), completedAt: timestamp("completed_at", { withTimezone: true }) });
export const speakingTurns = pgTable("speaking_turns", { id: uuid("id").primaryKey(), sessionId: uuid("session_id").notNull().references(() => speakingSessions.id, { onDelete: "cascade" }), turnOrder: integer("turn_order").notNull(), prompt: text("prompt"), transcript: text("transcript"), audioMediaId: uuid("audio_media_id"), durationMs: integer("duration_ms"), feedback: jsonb("feedback"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("speaking_turns_session_order_idx").on(table.sessionId, table.turnOrder)]);
export const progressEvents = pgTable("progress_events", { id: uuid("id").primaryKey(), userId: uuid("user_id").references(() => users.id), guestId: uuid("guest_id"), type: varchar("type", { length: 64 }).notNull(), skill: varchar("skill", { length: 16 }), sourceType: varchar("source_type", { length: 64 }), sourceId: varchar("source_id", { length: 128 }), idempotencyKey: varchar("idempotency_key", { length: 255 }), metadata: jsonb("metadata").notNull().default({}), occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow() }, (table) => [uniqueIndex("progress_events_idempotency_idx").on(table.idempotencyKey)]);
export const media = pgTable("media", { id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").references(() => users.id), ownerGuestId: uuid("owner_guest_id"), kind: varchar("kind", { length: 32 }).notNull(), storageKey: text("storage_key").notNull().unique(), contentType: varchar("content_type", { length: 128 }).notNull(), byteSize: integer("byte_size").notNull(), status: varchar("status", { length: 32 }).notNull().default("PENDING"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() });
export const mediaProcessingJobs = pgTable("media_processing_jobs", { id: uuid("id").primaryKey(), type: varchar("type", { length: 64 }).notNull(), status: varchar("status", { length: 32 }).notNull().default("PENDING"), payload: jsonb("payload").notNull(), attempts: integer("attempts").notNull().default(0), error: text("error"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() });
