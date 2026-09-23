ALTER TABLE "vocabulary" DROP CONSTRAINT IF EXISTS "vocabulary_headword_pos_idx";
DROP INDEX IF EXISTS "vocabulary_headword_pos_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "vocabulary_headword_pos_level_idx" ON "vocabulary" ("headword", "part_of_speech", "cefr_level");
