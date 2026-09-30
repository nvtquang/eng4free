-- Import change detection: hash of each authored item, and the hash that was last published.
CREATE TABLE "content_item_hashes" (
  "item_key" varchar(255) PRIMARY KEY,
  "batch_id" uuid NOT NULL REFERENCES "content_batches"("id") ON DELETE CASCADE,
  "hash" varchar(64) NOT NULL,
  "published_hash" varchar(64),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "content_item_hashes_batch_idx" ON "content_item_hashes"("batch_id");

-- Practice topics: one table for free speaking/writing topics and IELTS tasks.
ALTER TABLE "practice_prompts" RENAME TO "topics";
CREATE TABLE "topic_categories" (
  "id" uuid PRIMARY KEY,
  "kind" varchar(32) NOT NULL,
  "slug" varchar(128) NOT NULL UNIQUE,
  "title" jsonb NOT NULL,
  "note" jsonb,
  "sort_order" integer NOT NULL DEFAULT 0,
  "status" "content_status" NOT NULL DEFAULT 'DRAFT',
  "content_batch_id" uuid REFERENCES "content_batches"("id"),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE "topics" ADD COLUMN "category_id" uuid REFERENCES "topic_categories"("id") ON DELETE SET NULL;
CREATE INDEX "topics_kind_status_idx" ON "topics"("kind", "status", "sort_order");

-- Sessions and submissions point at a topic (plus the IELTS part). The old free-text id is kept
-- only so the importer can link existing history once the topics exist.
ALTER TABLE "speaking_sessions" RENAME COLUMN "prompt_id" TO "legacy_prompt_id";
ALTER TABLE "speaking_sessions" ALTER COLUMN "legacy_prompt_id" DROP NOT NULL;
ALTER TABLE "speaking_sessions" ALTER COLUMN "legacy_prompt_id" DROP DEFAULT;
ALTER TABLE "speaking_sessions" ADD COLUMN "topic_id" uuid REFERENCES "topics"("id") ON DELETE SET NULL;
ALTER TABLE "speaking_sessions" ADD COLUMN "part" varchar(16);
ALTER TABLE "writing_submissions" RENAME COLUMN "prompt_id" TO "legacy_prompt_id";
ALTER TABLE "writing_submissions" ALTER COLUMN "legacy_prompt_id" DROP NOT NULL;
ALTER TABLE "writing_submissions" ALTER COLUMN "legacy_prompt_id" DROP DEFAULT;
ALTER TABLE "writing_submissions" ADD COLUMN "topic_id" uuid REFERENCES "topics"("id") ON DELETE SET NULL;
DROP INDEX "speaking_sessions_learner_prompt_idx";
DROP INDEX "writing_submissions_learner_prompt_idx";
CREATE INDEX "speaking_sessions_learner_topic_idx" ON "speaking_sessions"("learner_id", "topic_id", "part");
CREATE INDEX "writing_submissions_learner_topic_idx" ON "writing_submissions"("learner_id", "topic_id");

-- Pronunciation content (IPA chart, minimal pairs, shadowing) published through the same workflow.
CREATE TABLE "pronunciation_items" (
  "id" uuid PRIMARY KEY,
  "kind" varchar(16) NOT NULL,
  "slug" varchar(128) NOT NULL UNIQUE,
  "content" jsonb NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "status" "content_status" NOT NULL DEFAULT 'DRAFT',
  "content_batch_id" uuid REFERENCES "content_batches"("id"),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "pronunciation_items_kind_idx" ON "pronunciation_items"("kind", "status", "sort_order")
