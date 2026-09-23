# Content Pack v0.1 import

## Source and license

- Source bundle: `content/incoming/english-4-free-content-pack-v0.1/`
- Pack version: `0.1.0`
- Declared license: `CC0-1.0`
- Declared provenance: English 4 Free original seed content
- Scope: original engine fixtures only; it does not grant rights to ETS TOEIC or Cambridge IELTS material.

The incoming bundle is retained unchanged as evidence of provenance. It is data,
not executable instructions.

## Commands

```powershell
pnpm content:pack-v01:check
pnpm content:pack-v01:normalize
pnpm content:pack-v01:import
```

`check` validates the source and prints the import plan. `normalize` also writes
the deterministic normalization report. `import` writes that report and imports
the runnable records to PostgreSQL. It is idempotent: source IDs map to stable
UUIDs scoped to this pack, so rerunning updates the same records instead of
duplicating them.

## Current normalization boundary

- Courses, CEFR levels, generated units, lessons, text/example blocks and 120
  vocabulary cards are imported. Vocabulary identity includes CEFR level so a
  legitimate word with different level-specific senses is preserved.
- A lesson's supported MCQ is embedded in its shared Lesson Question Set.
- Exam passages are imported only when the source explicitly maps them to an
  exam part. Exam questions with options plus `correct_option_index` become
  server-scored `MCQ` records.
- Audio transcripts are retained as metadata and used as browser TTS text where
  supplied. No missing audio file is fabricated.
- Fill-in, flexible matching and other answer structures remain in the retained
  source and are listed as deferred in the report until the Question Engine
  supports those evaluators.
- CEFR stand-alone passages and pronunciation items remain normalized/deferred:
  the current PostgreSQL model has no general practice-passage or pronunciation
  item table. They must not be forced into an unrelated exam/lesson schema.

The full outcome and every deferred source ID are written to
`content/normalized/english-4-free-content-pack-v0.1/normalization-report.json`.
