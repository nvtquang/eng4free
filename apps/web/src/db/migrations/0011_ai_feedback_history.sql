ALTER TABLE "writing_feedback" DROP CONSTRAINT IF EXISTS "writing_feedback_submission_id_unique";
ALTER TABLE "writing_feedback" ADD COLUMN IF NOT EXISTS "revision_id" uuid REFERENCES "writing_revisions"("id") ON DELETE SET NULL;
ALTER TABLE "writing_feedback" ADD COLUMN IF NOT EXISTS "kind" varchar(32) NOT NULL DEFAULT 'AI_PRACTICE';
CREATE INDEX IF NOT EXISTS "writing_feedback_submission_created_idx" ON "writing_feedback" ("submission_id", "created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "writing_feedback_revision_provider_idx" ON "writing_feedback" ("revision_id", "provider");

CREATE TABLE "tutor_feedback" (
  "id" uuid PRIMARY KEY NOT NULL,
  "attempt_id" uuid NOT NULL REFERENCES "attempts"("id") ON DELETE CASCADE,
  "question_id" uuid NOT NULL,
  "learner_answer" varchar(128) NOT NULL,
  "provider" varchar(64) NOT NULL,
  "content" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "tutor_feedback_attempt_question_answer_idx" UNIQUE("attempt_id", "question_id", "learner_answer")
);
CREATE INDEX "tutor_feedback_attempt_created_idx" ON "tutor_feedback" ("attempt_id", "created_at");
