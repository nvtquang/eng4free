CREATE TABLE "lesson_completions" (
  "id" uuid PRIMARY KEY,
  "lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
  "owner_key" varchar(64) NOT NULL,
  "user_id" uuid REFERENCES "users"("id"),
  "guest_id" uuid,
  "raw_score" integer NOT NULL,
  "total_questions" integer NOT NULL,
  "completed_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "lesson_completions_lesson_owner_idx" ON "lesson_completions"("lesson_id", "owner_key");
