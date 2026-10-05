# Vocabulary catalogue

The vocabulary has one home: PostgreSQL. There are no vocabulary files in the repository.
Editors change words in the CMS (`/admin/vocabulary`), and scripts add new words as drafts.
Both go through the same code (`apps/web/src/modules/vocabulary/catalog.ts`), so both apply
the same rules and write the same history.

## Tables

| Table | What it holds |
| --- | --- |
| `vocabulary` | One row per word: headword, part of speech, level, IPA, Vietnamese meaning, example, sources (`attribution`), Wiktionary's Vietnamese sense groups (`sense_groups`), the reviewer's pick (`sense_choice`), who reviewed it (`reviewed_by`, `reviewed_at`) and its status. The catalogue is the rows in the vocabulary content batch. |
| `vocabulary_revisions` | Every change: action (`CREATE`, `UPDATE`, `REVIEW`, `EXCLUDE`, `PUBLISH`), each changed field as `[before, after]`, who and when. |
| `vocabulary_exclusions` | Words a reviewer decided not to teach, with the reason. The candidate script never adds them again. |
| `vocabulary_reviews` | Each learner's review schedule (FSRS). Not part of the catalogue, but it points at catalogue rows, so words are never deleted, only archived. |

## Rules

`apps/web/src/modules/vocabulary/catalog-rules.ts` checks every save in the CMS, every
`pnpm vocab:apply` change and every publish:

- the level is A1–C2 and the part of speech is a noun, verb, adjective or adverb;
- IPA is written as `/…/`;
- there is a Vietnamese meaning, with no placeholder text;
- the level, meaning and IPA each have a source URL and licence;
- the example is original, has 4+ words, is at most 220 characters and uses the headword (or a regular form of it).

When an editor writes the meaning, IPA or level by hand instead of taking the sourced value,
that field's source becomes "English 4 Free editors".

## Adding words

1. `pnpm vocab:candidates` lists candidates from Words-CEFR, Octanove and Wiktionary into
   `.cache/vocabulary/candidates.json`. This is a transport file and is not committed.
2. `pnpm vocab:ingest -- --target=A1:500,A2:800,...` adds the missing words as unreviewed DRAFT
   rows and puts the vocabulary batch in REVIEW. Add `--editor-meanings` to also take words
   without a Wiktionary translation; their meaning starts empty, for an editor to write.
3. Review the words: pick the sense, write the example, and mark the word reviewed.
   - One word at a time: in `/admin/vocabulary`.
   - Many at once: `pnpm vocab:apply -- --in=changes.json` (format in `scripts/vocabulary/apply.ts`).
   - `pnpm vocab:check -- --list=unreviewed --level=B1` lists what is left.
4. Approve the vocabulary batch in the CMS, then run `pnpm vocab:publish`. Only reviewed words
   that pass the rules are published; the rest stay DRAFT.

An edit to a word that is already published is live as soon as it is saved.

## Moving the catalogue between databases

`pnpm vocab:snapshot export` writes the catalogue (words, history, exclusions, batch status) to a
file under `.cache/vocabulary/`. `pnpm vocab:snapshot import -- --in=<file>` upserts it by id, so
learners' review schedules are kept. Importing into a non-local database needs `--allow-remote`.

- `pnpm demo:prepare` exports the catalogue before it resets the demo database and imports it
  again afterwards. For a new database, pass `--vocabulary=<snapshot.json>`.
- `pnpm test:e2e` copies the catalogue from the demo database into the E2E database. Where there
  is no demo database (CI), it loads synthetic test words (`scripts/vocabulary/test-fixture.ts`).
- To fill a new production database, import a snapshot with `--allow-remote`.

## Backups

The database is the only copy of the catalogue, so back it up:

- production: the daily `Database backup` workflow (`.github/workflows/backup.yml`);
- local demo database: `pnpm demo:prepare` makes a `pg_dump` first. `pnpm vocab:snapshot export`
  is a quick extra copy before large edits.
