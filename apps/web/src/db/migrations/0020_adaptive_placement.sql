-- Redesign phase 4: adaptive placement test.
-- placement_items holds the reviewed question bank (content pack batch "placement").
-- The answer key stays in "answer" and is never sent to the browser.
CREATE TABLE "placement_items" (
  "id" uuid PRIMARY KEY,
  "slug" varchar(128) NOT NULL UNIQUE,
  "skill" varchar(16) NOT NULL,
  "cefr_level" varchar(2) NOT NULL,
  "content" jsonb NOT NULL,
  "answer" jsonb NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "status" "content_status" NOT NULL DEFAULT 'DRAFT',
  "content_batch_id" uuid REFERENCES "content_batches"("id"),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "placement_items_skill_level_idx" ON "placement_items"("skill", "cefr_level", "status");

-- One row per placement run. "state" is the server-side adaptive state (asked items,
-- correctness, current level per skill), "result" is filled when the run completes.
CREATE TABLE "placement_attempts" (
  "id" uuid PRIMARY KEY,
  "learner_id" uuid NOT NULL REFERENCES "learners"("id") ON DELETE CASCADE,
  "state" jsonb NOT NULL,
  "result" jsonb,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz
);
CREATE INDEX "placement_attempts_learner_idx" ON "placement_attempts"("learner_id", "started_at");

-- Per-skill levels from the placement test, for example {"GRAMMAR":"B1","LISTENING":"A2"}.
ALTER TABLE "learner_profiles" ADD COLUMN "skill_levels" jsonb
