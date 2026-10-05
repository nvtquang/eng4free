-- The vocabulary catalogue lives only in PostgreSQL (it used to be authored as files in
-- content/packs/d3/vocabulary and imported). Editors change words in the CMS, and scripts add
-- new words as DRAFT rows.
-- sense_groups: every Vietnamese translation group Wiktionary gives for the entry, as
--   [{"sense": "...", "words": ["..."]}]. sense_choice: the reviewer's pick, as group indexes (2)
--   or single words within a group ("2.1"). meaning is built from that pick unless an editor
--   wrote the meaning by hand (then attribution.sources.meaning names English 4 Free).
-- reviewed_by / reviewed_at: who checked the meaning and example. Only reviewed words are published.
ALTER TABLE "vocabulary" ADD COLUMN "sense_groups" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE "vocabulary" ADD COLUMN "sense_choice" jsonb NOT NULL DEFAULT '[0]';
ALTER TABLE "vocabulary" ADD COLUMN "reviewed_by" varchar(255);
ALTER TABLE "vocabulary" ADD COLUMN "reviewed_at" timestamptz;

-- Every change to a word: who, when, and each changed field as [before, after].
CREATE TABLE "vocabulary_revisions" (
  "id" uuid PRIMARY KEY,
  "vocabulary_id" uuid NOT NULL REFERENCES "vocabulary"("id") ON DELETE CASCADE,
  "action" varchar(32) NOT NULL,
  "changes" jsonb NOT NULL DEFAULT '{}',
  "changed_by" varchar(255) NOT NULL,
  "changed_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "vocabulary_revisions_word_idx" ON "vocabulary_revisions"("vocabulary_id", "changed_at");

-- Words a reviewer decided not to teach (for example: Wiktionary has no Vietnamese translation
-- for the sense learners need). The candidate script never adds them again.
CREATE TABLE "vocabulary_exclusions" (
  "headword" varchar(255) NOT NULL,
  "part_of_speech" varchar(64) NOT NULL,
  "reason" text NOT NULL,
  "decided_by" varchar(255) NOT NULL,
  "decided_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("headword", "part_of_speech")
)
