ALTER TABLE "vocabulary_reviews" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "vocabulary_reviews" ADD COLUMN "guest_id" uuid;
ALTER TABLE "vocabulary_reviews" ADD COLUMN "owner_key" varchar(64);
UPDATE "vocabulary_reviews" SET "owner_key" = 'user:' || "user_id"::text WHERE "owner_key" IS NULL;
ALTER TABLE "vocabulary_reviews" ALTER COLUMN "owner_key" SET NOT NULL;
ALTER TABLE "vocabulary_reviews" DROP CONSTRAINT IF EXISTS "vocabulary_reviews_user_vocab_idx";
DROP INDEX IF EXISTS "vocabulary_reviews_user_vocab_idx";
CREATE UNIQUE INDEX "vocabulary_reviews_owner_vocab_idx" ON "vocabulary_reviews"("owner_key", "vocabulary_id");
CREATE INDEX "vocabulary_reviews_owner_due_idx" ON "vocabulary_reviews"("owner_key", "due_at");
