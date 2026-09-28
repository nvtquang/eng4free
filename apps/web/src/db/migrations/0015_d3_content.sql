ALTER TABLE "vocabulary" ADD COLUMN "attribution" jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE "practice_prompts" (
  "id" uuid PRIMARY KEY,
  "slug" varchar(128) NOT NULL UNIQUE,
  "kind" varchar(32) NOT NULL,
  "title" varchar(255) NOT NULL,
  "content" jsonb NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "status" "content_status" NOT NULL DEFAULT 'DRAFT',
  "content_batch_id" uuid REFERENCES "content_batches"("id"),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "practice_prompts_kind_status_idx" ON "practice_prompts"("kind", "status", "sort_order")
