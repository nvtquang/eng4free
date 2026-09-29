CREATE TABLE "mistakes" (
  "id" uuid PRIMARY KEY,
  "owner_key" varchar(64) NOT NULL,
  "user_id" uuid REFERENCES "users"("id"),
  "guest_id" uuid,
  "source_type" varchar(16) NOT NULL,
  "source_id" varchar(128) NOT NULL,
  "source_title" varchar(255),
  "question_id" varchar(128) NOT NULL,
  "skill" varchar(16),
  "prompt" text NOT NULL,
  "options" jsonb NOT NULL DEFAULT '[]',
  "correct_option_id" varchar(64) NOT NULL,
  "explanation" text,
  "times_wrong" integer NOT NULL DEFAULT 1,
  "resolved_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "mistakes_owner_question_idx" ON "mistakes"("owner_key", "question_id");
CREATE INDEX "mistakes_owner_resolved_idx" ON "mistakes"("owner_key", "resolved_at")
