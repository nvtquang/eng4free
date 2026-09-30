-- One learner per person. A guest cookie or an account is only a link to a learner.
CREATE TABLE "learners" (
  "id" uuid PRIMARY KEY,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "last_seen_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "learner_links" (
  "kind" varchar(8) NOT NULL,
  "external_id" uuid NOT NULL,
  "learner_id" uuid NOT NULL REFERENCES "learners"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("kind", "external_id")
);
CREATE INDEX "learner_links_learner_idx" ON "learner_links"("learner_id");

-- Identity map: every account gets a learner, a guest seen together with an account joins
-- that account's learner (the account it was seen with most often), other guests get their own.
CREATE TEMP TABLE "_learner_map" ("kind" varchar(8) NOT NULL, "external_id" uuid NOT NULL, "learner_id" uuid NOT NULL DEFAULT gen_random_uuid(), PRIMARY KEY ("kind", "external_id")) ON COMMIT DROP;
INSERT INTO "_learner_map" ("kind", "external_id") SELECT 'USER', "id" FROM "users";
CREATE TEMP VIEW "_owner_rows" AS
  SELECT "user_id", "guest_id" FROM "attempts"
  UNION ALL SELECT "user_id", "guest_id" FROM "lesson_completions"
  UNION ALL SELECT "user_id", "guest_id" FROM "vocabulary_reviews"
  UNION ALL SELECT "user_id", "guest_id" FROM "writing_submissions"
  UNION ALL SELECT "user_id", "guest_id" FROM "speaking_sessions"
  UNION ALL SELECT "user_id", "guest_id" FROM "progress_events"
  UNION ALL SELECT "user_id", "guest_id" FROM "learner_profiles"
  UNION ALL SELECT "user_id", "guest_id" FROM "mistakes"
  UNION ALL SELECT "user_id", "guest_id" FROM "ai_usage_logs"
  UNION ALL SELECT "owner_user_id", "owner_guest_id" FROM "media";
INSERT INTO "_learner_map" ("kind", "external_id", "learner_id")
  SELECT DISTINCT ON (pairs."guest_id") 'GUEST', pairs."guest_id", m."learner_id"
  FROM (SELECT "user_id", "guest_id", count(*) AS n FROM "_owner_rows" WHERE "user_id" IS NOT NULL AND "guest_id" IS NOT NULL GROUP BY 1, 2) pairs
  JOIN "_learner_map" m ON m."kind" = 'USER' AND m."external_id" = pairs."user_id"
  ORDER BY pairs."guest_id", pairs.n DESC;
INSERT INTO "_learner_map" ("kind", "external_id")
  SELECT DISTINCT 'GUEST', o."guest_id" FROM "_owner_rows" o
  WHERE o."guest_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "_learner_map" m WHERE m."kind" = 'GUEST' AND m."external_id" = o."guest_id");
INSERT INTO "learners" ("id") SELECT DISTINCT "learner_id" FROM "_learner_map";
INSERT INTO "learner_links" ("kind", "external_id", "learner_id") SELECT "kind", "external_id", "learner_id" FROM "_learner_map";
DROP VIEW "_owner_rows";

-- Attach every row to its learner. Owner-keyed tables follow owner_key, the others prefer the account.
ALTER TABLE "attempts" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "lesson_completions" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "vocabulary_reviews" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "writing_submissions" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "speaking_sessions" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "progress_events" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "learner_profiles" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "mistakes" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE CASCADE;
ALTER TABLE "media" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE SET NULL;
ALTER TABLE "ai_usage_logs" ADD COLUMN "learner_id" uuid REFERENCES "learners"("id") ON DELETE SET NULL;

UPDATE "attempts" t SET "learner_id" = COALESCE((SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'USER' AND l."external_id" = t."user_id"), (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'GUEST' AND l."external_id" = t."guest_id"));
UPDATE "writing_submissions" t SET "learner_id" = COALESCE((SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'USER' AND l."external_id" = t."user_id"), (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'GUEST' AND l."external_id" = t."guest_id"));
UPDATE "speaking_sessions" t SET "learner_id" = COALESCE((SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'USER' AND l."external_id" = t."user_id"), (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'GUEST' AND l."external_id" = t."guest_id"));
UPDATE "progress_events" t SET "learner_id" = COALESCE((SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'USER' AND l."external_id" = t."user_id"), (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'GUEST' AND l."external_id" = t."guest_id"));
UPDATE "ai_usage_logs" t SET "learner_id" = COALESCE((SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'USER' AND l."external_id" = t."user_id"), (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'GUEST' AND l."external_id" = t."guest_id"));
UPDATE "media" t SET "learner_id" = COALESCE((SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'USER' AND l."external_id" = t."owner_user_id"), (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = 'GUEST' AND l."external_id" = t."owner_guest_id"));
UPDATE "lesson_completions" t SET "learner_id" = (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = CASE WHEN t."owner_key" LIKE 'user:%' THEN 'USER' ELSE 'GUEST' END AND l."external_id" = CASE WHEN t."owner_key" LIKE 'user:%' THEN substring(t."owner_key" from 6) ELSE substring(t."owner_key" from 7) END::uuid);
UPDATE "vocabulary_reviews" t SET "learner_id" = (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = CASE WHEN t."owner_key" LIKE 'user:%' THEN 'USER' ELSE 'GUEST' END AND l."external_id" = CASE WHEN t."owner_key" LIKE 'user:%' THEN substring(t."owner_key" from 6) ELSE substring(t."owner_key" from 7) END::uuid);
UPDATE "learner_profiles" t SET "learner_id" = (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = CASE WHEN t."owner_key" LIKE 'user:%' THEN 'USER' ELSE 'GUEST' END AND l."external_id" = CASE WHEN t."owner_key" LIKE 'user:%' THEN substring(t."owner_key" from 6) ELSE substring(t."owner_key" from 7) END::uuid);
UPDATE "mistakes" t SET "learner_id" = (SELECT l."learner_id" FROM "learner_links" l WHERE l."kind" = CASE WHEN t."owner_key" LIKE 'user:%' THEN 'USER' ELSE 'GUEST' END AND l."external_id" = CASE WHEN t."owner_key" LIKE 'user:%' THEN substring(t."owner_key" from 6) ELSE substring(t."owner_key" from 7) END::uuid);

-- A guest row and an account row can now describe the same thing for one learner: keep the newest.
DELETE FROM "lesson_completions" a USING "lesson_completions" b WHERE a."learner_id" = b."learner_id" AND a."lesson_id" = b."lesson_id" AND (a."updated_at" < b."updated_at" OR (a."updated_at" = b."updated_at" AND a."id" < b."id"));
DELETE FROM "vocabulary_reviews" a USING "vocabulary_reviews" b WHERE a."learner_id" = b."learner_id" AND a."vocabulary_id" = b."vocabulary_id" AND (a."updated_at" < b."updated_at" OR (a."updated_at" = b."updated_at" AND a."id" < b."id"));
DELETE FROM "mistakes" a USING "mistakes" b WHERE a."learner_id" = b."learner_id" AND a."question_id" = b."question_id" AND (a."updated_at" < b."updated_at" OR (a."updated_at" = b."updated_at" AND a."id" < b."id"));
DELETE FROM "learner_profiles" a USING "learner_profiles" b WHERE a."learner_id" = b."learner_id" AND (a."updated_at" < b."updated_at" OR (a."updated_at" = b."updated_at" AND a."id" < b."id"));

-- Idempotency keys embedded the old owner ("user:<id>" or "guest:<id>"), rewrite them to the learner id.
DROP INDEX "progress_events_idempotency_idx";
UPDATE "progress_events" SET "idempotency_key" = regexp_replace("idempotency_key", '(user|guest):[0-9a-f-]{36}', "learner_id"::text) WHERE "idempotency_key" ~ '(user|guest):[0-9a-f-]{36}';
DELETE FROM "progress_events" a USING "progress_events" b WHERE a."idempotency_key" = b."idempotency_key" AND (a."occurred_at" > b."occurred_at" OR (a."occurred_at" = b."occurred_at" AND a."id" > b."id"));
CREATE UNIQUE INDEX "progress_events_idempotency_idx" ON "progress_events"("idempotency_key");

ALTER TABLE "attempts" ALTER COLUMN "learner_id" SET NOT NULL;
ALTER TABLE "lesson_completions" ALTER COLUMN "learner_id" SET NOT NULL;
ALTER TABLE "vocabulary_reviews" ALTER COLUMN "learner_id" SET NOT NULL;
ALTER TABLE "writing_submissions" ALTER COLUMN "learner_id" SET NOT NULL;
ALTER TABLE "speaking_sessions" ALTER COLUMN "learner_id" SET NOT NULL;
ALTER TABLE "progress_events" ALTER COLUMN "learner_id" SET NOT NULL;
ALTER TABLE "learner_profiles" ALTER COLUMN "learner_id" SET NOT NULL;
ALTER TABLE "mistakes" ALTER COLUMN "learner_id" SET NOT NULL;

-- The old owner columns (and the indexes built on them) go away.
ALTER TABLE "attempts" DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "lesson_completions" DROP COLUMN "owner_key", DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "vocabulary_reviews" DROP COLUMN "owner_key", DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "writing_submissions" DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "speaking_sessions" DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "progress_events" DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "learner_profiles" DROP COLUMN "owner_key", DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "mistakes" DROP COLUMN "owner_key", DROP COLUMN "user_id", DROP COLUMN "guest_id";
ALTER TABLE "media" DROP COLUMN "owner_user_id", DROP COLUMN "owner_guest_id";
ALTER TABLE "ai_usage_logs" DROP COLUMN "user_id", DROP COLUMN "guest_id";

CREATE INDEX "attempts_learner_idx" ON "attempts"("learner_id", "created_at");
CREATE UNIQUE INDEX "lesson_completions_learner_lesson_idx" ON "lesson_completions"("learner_id", "lesson_id");
CREATE UNIQUE INDEX "vocabulary_reviews_learner_vocab_idx" ON "vocabulary_reviews"("learner_id", "vocabulary_id");
CREATE INDEX "vocabulary_reviews_learner_due_idx" ON "vocabulary_reviews"("learner_id", "due_at");
CREATE INDEX "writing_submissions_learner_prompt_idx" ON "writing_submissions"("learner_id", "prompt_id");
CREATE INDEX "speaking_sessions_learner_prompt_idx" ON "speaking_sessions"("learner_id", "prompt_id");
CREATE INDEX "progress_events_learner_idx" ON "progress_events"("learner_id", "occurred_at");
CREATE UNIQUE INDEX "learner_profiles_learner_idx" ON "learner_profiles"("learner_id");
CREATE UNIQUE INDEX "mistakes_learner_question_idx" ON "mistakes"("learner_id", "question_id");
CREATE INDEX "mistakes_learner_resolved_idx" ON "mistakes"("learner_id", "resolved_at");
CREATE INDEX "media_learner_idx" ON "media"("learner_id");
CREATE INDEX "ai_usage_logs_learner_created_idx" ON "ai_usage_logs"("learner_id", "created_at")
