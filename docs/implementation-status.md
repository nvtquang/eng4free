# Implementation status

Updated: 2026-10-01

Stages D4–D7 (onboarding and placement, review loops, AI, UI and the learner journey) are
described in their commits; the demo acceptance tables in
[docs/roadmap/demo-acceptance.md](roadmap/demo-acceptance.md) track every scenario step.

## D8 — Demo preparation and QA: PASS (A5 partial)

Checked on 2026-10-01. Details and the list of fixes are in section 8 of
[demo-acceptance.md](roadmap/demo-acceptance.md).

- **`pnpm demo:prepare`** (`scripts/demo-prepare.ts`) rebuilds the local demo database in one
  command, in about 2 minutes:
  - it takes a `pg_dump` backup into `.cache/demo-backups/`, then resets, migrates and seeds;
  - it imports pack D3 and republishes only the batches whose item hashes match the approval
    record `content/packs/d3/qa/approved.json`, which `content:d3:publish` now writes;
  - it checks the audio, seeds the demo account and makes the production build.
- **`pnpm demo:start`** serves the build with `E4F_DEMO_SIGN_IN=true`, which offers a one-click
  demo account on `/login`. The sign-in works only with that flag and a local `english4free*`
  database. It opens a normal Auth.js database session and merges the guest's progress, as a
  Google sign-in does.
- **`pnpm seed:demo-account`** (`scripts/seed/demo-account/`) builds a B1 IELTS learner with
  three weeks of history. The history is replayed through the app's own modules under a
  shifted clock: placement, lessons, exams, FSRS reviews, mistakes, writing and speaking. It
  ends yesterday, so rerun the seed on the morning of a demo. Writing and speaking feedback is
  real output of the app's AI pipeline, captured once with `--capture-feedback`.
- **E2E**: `e2e/demo-scenario-a|b|c.spec.ts` walk the three demo scenarios in Vietnamese without
  an AI key. `pnpm test:all` passes: 105 unit tests and 38/38 Playwright tests.
- **Product fixes found while walking the scenarios**:
  - a due-word review deck (`/vocabulary?deck=due`) and *New words in this lesson*;
  - *Results by part* on exam results;
  - a speaking clock with a two-minute limit for IELTS Part 2;
  - evaluated essays are no longer labelled as drafts;
  - history dates follow the page language;
  - learner-facing AI copy no longer mentions API keys;
  - the streak survives the current day until a whole day is missed.
- **Open**: lessons still use multiple choice only (scenario step A5), and the real-microphone
  check stays manual ([pre-demo checklist](demo/pre-demo-checklist.md)).

## D3 — Content expansion: DRAFTED, IN REVIEW

Drafted on 2026-09-28. The content lives in the pack `content/packs/d3` (typed TypeScript plus JSON). It is imported into the database as DRAFT items in batches (`lessons`, `grammar`, `toeic`, `ielts`, `topics`, `pronunciation`, `placement`), and each changed batch is set to REVIEW. The vocabulary is not in the pack: it lives only in PostgreSQL (see [Vocabulary catalogue](content/vocabulary-catalogue.md)). Nothing reaches learners until a reviewer approves the batch in the CMS and runs `pnpm content:d3:publish`.

**What the pack contains**

| Area | Content |
| --- | --- |
| Grammar | 36 topics, six per level from A1 to C2. Each has a form and use explanation with Vietnamese notes, examples, common mistakes of Vietnamese learners, and 8 practice questions. They replace the 12 placeholder grammar lessons from content pack v0.1. |
| Skill lessons | 79 lessons: 28 Reading, 27 Listening, 12 Speaking and 12 Writing, spread across every level. Listening and speaking lessons include multi-voice recordings. |
| Vocabulary (in PostgreSQL, not the pack) | 5,000 words (A1 600, A2 850, B1 1,300, B2 1,350, C1 450, C2 450), all reviewed and published. Moved from the pack into PostgreSQL on 2026-10-05, then extended from 2,429. Levels come from Words-CEFR (A1–B2, MIT) and the Octanove C1/C2 profile (CC BY-SA). IPA comes from English Wiktionary (CC BY-SA 4.0), or from ipa-dict (MIT) when Wiktionary has none. About 3,850 Vietnamese meanings come from Wiktionary via kaikki.org (CC BY-SA 4.0); the rest were written by English 4 Free editors (AI-drafted, then checked), and each word's source is recorded. Words whose only sourced meaning is wrong for learners, grammatical adverbs and spelling variants are excluded (170 decisions). Example sentences are original. Edited in `/admin/vocabulary`; see [Vocabulary catalogue](content/vocabulary-catalogue.md). |
| TOEIC | Full Mock Test 1 with 200 questions across the 7 parts and 120 minutes. Mini Tests 1 and 2. One practice set per part, 71 questions in total. |
| IELTS | Listening Tests 1 and 2 (4 sections, 40 marks each). Academic Reading Tests 1 and 2 (3 passages, 40 marks each). Six Writing tasks, three of them Task 1 with a figure. Five Speaking sets covering Parts 1–3. |
| Media | 12 CC0 photographs from Openverse for TOEIC Part 1, with credits. 7 TOEIC graphics and 3 IELTS Task 1 figures drawn from the question data. About 135 audio files. |

**How the quality rules are enforced**

- **Quality gate** (`pnpm content:d3:check`, `scripts/content/d3/quality-gate.ts`). Every import runs it first. It checks for:
  - placeholder text such as "placeholder", "original-answer", "Example 1 using…", "lorem" or "TODO"
  - an answer key that is valid for the question type and spread across positions
  - text of a sensible length
  - images that exist on disk and carry a licence credit
  - Speaking sets that have all three parts and Writing Task 1 prompts that have a figure
- **Vocabulary rules** (`apps/web/src/modules/vocabulary/catalog-rules.ts`, run by `pnpm vocab:check` and on every CMS save): a sourced meaning, IPA written as /…/, a per-field source and licence, and an original example of 4+ words that uses the headword. Only reviewed words are published.
  - Every Vietnamese translation group Wiktionary lists is kept; a reviewer picks the sense a learner needs. A word is excluded when Wiktionary has no Vietnamese translation for its learner sense (for example *interest*, whose only translation is *lãi*), or when the entry has a typo or is vulgar.
  - Characters that look Latin but are Cyrillic are rejected. IPA is normalised to dictionary style: /r/, /l/, no tie bars.
- **Photographs.** Candidates were searched on Openverse with the CC0 filter and chosen by eye. One watermarked photo was rejected. Each Part 1 statement was written from what the photo actually shows.
- **Blind cross-check** (`pnpm content:d3:crosscheck`). Gemini answers every question from the learner's material without seeing the key. For Part 1 it receives the actual photograph. Its answers are scored by `scoring-core`. Any disagreement is recorded in `content/packs/d3/qa/crosscheck.json` and highlighted in the review sheet.
- **Review sheet** (`pnpm content:d3:review-sample`). This writes `docs/content/d3-review-sample.md`: a fixed random sample of 15% per batch plus every flagged item, showing exactly what the learner sees, the answer key and the explanation.

**Audio**

- Audio is generated with Piper TTS instead of edge-tts, because the edge-tts terms are unclear.
  - The voices are VCTK and LibriTTS-R (CC BY 4.0) and cori (public domain).
  - Each speaker's voice was checked with a pitch probe so that it matches the character's gender.
  - Speech is paced to learner speed and encoded as 48 kbps mono MP3.
- New audio features:
  - Listening passages (TOEIC conversations and talks, IELTS sections) and questions heard on their own (TOEIC Part 1–2) each get their own recording.
  - The script is withheld from learners until they submit.
  - The review page offers a replay and the transcript.
- `pnpm content:qa-audio` measures the speaking rate and compares a Gemini transcription with the script.
  - It caught answer letters being read wrongly ("(A)" was heard as "PS"). They are now read as "A.".
  - It caught spelled names being unclear. Letters are now separated by commas.
  - It caught accented loanwords such as "café" being garbled. Accents are now removed before synthesis.

**Product changes that came with D3**

- Migration `0015`: a `vocabulary.attribution` column and a `practice_prompts` table.
- `/ielts/writing` and `/ielts/speaking` list the published tasks. Task 1 shows its figure, and Speaking shows Part 1, the cue card and Part 3.
- `/skills/speaking` and `/skills/writing` list their lessons by level.
- `/vocabulary` has paging, a link to the source of each word and a licence credit line.
- `/about` has a "Sources and licences" section that gives the CC BY and CC BY-SA attribution.
- The exam runner groups each passage or recording with its questions. Listening parts can hold many recordings, and question and passage images carry credits.
- Lesson options are rotated at import so that answer keys cycle through the positions.

**Publishing**

```
pnpm content:d3:import                    # quality gate, then DRAFT items and REVIEW batches (idempotent)
pnpm content:d3:review-sample             # docs/content/d3-review-sample.md
# CMS /admin → Content batches: REVIEW → APPROVED after the spot check
pnpm content:d3:publish -- --batch=toeic  # PUBLISHED, and archives the demo content it replaces
```

Publishing a batch archives what it replaces:
- **grammar** replaces the v0.1 placeholder grammar lessons and courses;
- **vocabulary** replaces the unsourced v0.1 and local words;
- **toeic** replaces the single-question `toeic-part-N-demo` sets, the mini and full demos, and `toeic-fixture-v01`;
- **ielts** replaces `ielts-fixture-v01` and the one-question demos.

`pnpm test:e2e` imports the pack and publishes it on the E2E database with `--test-db`. That flag is refused on any database whose name is not `*_e2e`, `*_qa` or `*_test`.

## D2 — Real listening audio and images: PASS

Checked on 2026-09-26.

**Audio generation.** `pnpm content:generate-audio` reads every spoken script in the database: exam part recordings, dictation questions and lesson listening blocks.
- It synthesises each speaker turn with edge-tts (en-US, en-GB, en-AU and en-CA neural voices) and joins the turns with silent MP3 frames. The join does not use ffmpeg (`modules/media/mp3-frames.ts`).
- It writes the files to `apps/web/public/demo-media/audio/` together with `manifest.json`. The manifest records the script hash, the voices, the duration, the source row and the generation time.
- Rerunning the script skips files that are already current. `--check` fails if any script has no audio, `--force` regenerates every file and `--prune` deletes files that are no longer used.
- Provenance and licence notes are in `public/demo-media/README.md`.

**How the app finds audio.** Files are looked up by a hash of the script (`modules/media/demo-audio.ts`), so content rows need no media ids. The same script resolves to the same committed file on every machine.

**Voice casting.**
- Speaker labels (`Woman:`, `Man:`, `Receptionist:`) each get a different accent and voice.
- `metadata.audioVoices` pins a voice to a speaker.
- TOEIC uses all four accents; IELTS uses British and Australian voices.

**What the learner receives.**
- While an attempt is running, the learner gets `audioUrl` only. `playbackText` and the dictation script are withheld, which closes the transcript leak noted in D1.
- The review page after submission adds a replay player and a collapsible transcript.
- The generation settings (`audioVoices`, `audioVoice`, `audioPauseMs`) are never sent to the client.

**Player.**
- `components/questions/limited-audio.tsx` enforces the play limit (Practice 2 plays, Mini/Full 1 play) and has no seeking.
- Browser `speechSynthesis` is used only when a script has no generated file. For example, a question just written in the CMS falls back until the generator is run.
- Lesson players also fall back to speech when a recording fails to load, including a failure before hydration.

**TOEIC demo content.**
- Part 1 has a photograph (`public/demo-media/images/toeic-part1-library-shelf.svg`, an original CC0 illustration) and four spoken statements. The answer choices show letters only.
- Part 2 has a spoken question and three spoken responses.
- Part 3 is a two-voice conversation.
- Part 4 is a short talk.
- The correct answer is no longer always option A.
- MCQ content accepts an optional `image { src, alt }`.

**Coverage.** `pnpm content:check-audio` reports 13/13 spoken scripts with audio. Every file decodes in Chromium, and the decoded duration matches the manifest.

**Tests.**
- Unit tests: MP3 frame parsing and joining, script hashing, speaker parsing, manifest lookup, and the public metadata projection.
- E2E (`e2e/listening-media.spec.ts`):
  - no script appears in the attempt API for IELTS, dictation or TOEIC
  - the Part 1 image loads
  - the limited player plays
  - the review shows the transcript
  - lessons fall back to speech when a recording returns 404
- Full suite: 25/25 E2E passing.

## D1 — Question Engine question types: PASS

- Seven gradable types share one engine: MCQ, MULTI_SELECT, TRUE_FALSE
  (True/False/Not Given, Yes/No/Not Given, True/False), FILL_BLANK, MATCHING,
  ORDERING and DICTATION. Each has a Zod content schema (learner-safe), a key
  schema (server-only), a response schema and cross-validation of key against
  content (`packages/content-schemas/src/questions.ts`).
- `scoring-core` scores every type deterministically. Short answers ignore case,
  extra whitespace, typographic quotes and surrounding punctuation; dictation also
  ignores inner punctuation; several accepted answers and word limits are
  supported. Marks follow IELTS conventions: one per blank, matched item or
  required selection; ordering and dictation are all-or-nothing.
- Attempt answers are stored as structured JSON (`attempt_answers.response`,
  migration `0014`); legacy MCQ rows and `selectedOptionId` payloads still work.
  Raw score and totals are in marks, and the IELTS/TOEIC estimate uses marks.
- One flat authoring format (`question-authoring.ts`) drives the CMS question form
  (type-aware, validated in the browser with the same rules) and the spreadsheet
  importer (new type, accepted-answers, items, option E/F, audio-text and
  word-limit columns). Publishing validates every stored question.
- Content Pack v0.1 is classified by answer shape; 0 exam questions are deferred
  (66 imported, previously 60).
- New original seed `ielts-practice-test-1` (22 marks: form and summary completion,
  choose-two, MCQ, matching, matching headings, True/False/Not Given) and
  `ielts-skills-drill-dictation-order`.

Known limits: lesson question sets are still MCQ-only; listening parts and
dictation use browser speech, so their transcript is present in the page until
recorded audio replaces it (D2); AI Tutor still covers the legacy Part 5 runner only.

Validation: ESLint, TypeScript, 79 unit tests (16 scoring-core, 61 web, 2 SRS) and
22 Playwright journeys pass, including a perfect-score IELTS attempt through the
UI with reload/resume, dictation + ordering, and a CMS-authored gap-fill question.

## D0-fix — demo hygiene and learner-facing cleanup: PASS

Scope and acceptance criteria: `docs/roadmap/demo-acceptance.md`.

- `pnpm test:e2e` runs against a dedicated `english4free_e2e` database (or
  `E2E_DATABASE_URL`) and creates it when missing, so E2E never resets or
  pollutes the demo database. `pnpm db:clean-test-content` removes content that
  earlier E2E runs published into the current database.
- Vocabulary FSRS schedules are stored server-side per learner (guest or
  account) in `vocabulary_reviews`; the vocabulary page queues due words first
  and holds back words scheduled for later. Browser storage is no longer used.
- Exam results show a practice-only TOEIC scaled score / IELTS band estimate per
  skill, projected from the attempt's accuracy.
- Listening, Reading and Grammar list published lessons from the database;
  IELTS Writing/Speaking reuse the persisted Writing workspace and push-to-talk
  Speaking flows and are reachable from `/ielts`.
- Learner-facing copy no longer mentions internal components; exam modes,
  skills and statuses are localized; About and Privacy pages replace the
  placeholder section route; the placement-test button no longer links to a
  missing feature.

- Gemini structured feedback was timing out: the default thinking depth took
  ~12 s against a 12 s budget. The provider now requests `thinking_level: low`
  (`AI_THINKING_LEVEL`), uses a 30 s default timeout and retries once on
  500/502/503. Writing history updates as soon as a submission is saved, before
  AI feedback arrives.

Migration: `0013_vocabulary_review_owner.sql`.

Validation: ESLint, TypeScript, 62 unit tests and 19 Playwright journeys pass
(E2E on the isolated `english4free_e2e` database, with Gemini configured).

## Stage 6 — Gemini AI foundation: PASS (local fallback remains enabled)

- Added a provider abstraction shared by AI Tutor and AI Writing; the first
  implementation is a Gemini REST adapter using structured JSON output.
- `GEMINI_API_KEY` is read only in server modules and sent only to Gemini in an
  `x-goog-api-key` request header. It is never placed in client code, responses,
  cache keys or audit logs.
- Added per-operation/learner rate limiting, SHA-256 cache keys, Zod validation
  of every provider response, short-lived response caching, and best-effort
  PostgreSQL usage logs with token counts and latency.
- Without `GEMINI_API_KEY`, existing safe local behavior is retained: Tutor
  shows the official explanation; Writing returns deterministic diagnostics.

Migration: `0010_ai_foundation.sql`.

Validation: local PostgreSQL migration, 46 Vitest tests, ESLint and TypeScript
all pass. Production build is intentionally not run while the local Next.js dev
server is active, because this project keeps its dev and production build caches
separate to avoid invalidating a running browser session.

Known operational limitation: rate-limit memory is per process. Replace it with
Redis/Upstash before running multiple web instances.

## Stage 6b — AI Tutor and AI Writing workflows: PASS (requires Gemini key for generated feedback)

- Tutor feedback is now saved and restored per submitted attempt, question and
  learner answer. The model receives only the learner outcome and approved
  explanation; the server's answer-key identifier is never included in its
  prompt or stored in the feedback record.
- Writing is first saved as a submission/revision, then evaluated from the
  server-owned revision. Generated feedback is persisted per revision and is
  visible again from Writing history.
- Writing rubric uses the descriptive levels `NEEDS_WORK`, `DEVELOPING` and
  `SECURE` for task response, cohesion, vocabulary and grammar. It deliberately
  has no numeric band field, and every response displays a practice-only,
  non-official-band disclaimer.
- Retry is idempotent per provider/revision, while a changed submission creates
  a new revision and can keep its own feedback history.

Migrations: `0011_ai_feedback_history.sql`,
`0012_drop_legacy_writing_feedback_unique.sql`.

Validation: migration on local PostgreSQL; 48 Vitest tests; ESLint and
TypeScript pass. Local end-to-end smoke checks pass for Writing
submit → evaluate fallback → history and TOEIC submit → Tutor feedback →
history. Actual generated feedback awaits `GEMINI_API_KEY`.

## Stage 6c — AI Speaking push-to-talk: PASS (realtime deferred)

- The existing browser recorder now drives one push-to-talk flow: record,
  protected local save, server-side Gemini transcription, structured feedback,
  persistent history and playback.
- Transcription uses a dedicated server-only Gemini adapter with inline audio,
  verbatim mode and `store: false`. The API key is never sent to the browser.
- Transcript and feedback are stored on the owned Speaking turn and survive a
  page refresh. Repeated requests reuse saved results and the shared AI cache.
- Speaking feedback uses descriptive `NEEDS_WORK`, `DEVELOPING` and `SECURE`
  levels. It does not claim an official band, numeric score, acoustic quality or
  phoneme-level pronunciation result.
- Without `GEMINI_API_KEY`, microphone recording, playback and history still
  work; the UI clearly reports that STT and generated feedback are unavailable.

Validation: ESLint, TypeScript, production build and the complete Vitest suite
pass (25 files, 52 tests), including the Gemini audio request contract, provider
errors, transcript caching and feedback schema. A browser smoke test passes for
record, stop, local playback, save, history and reload with no Gemini key
configured.

Deferred by design: realtime/full-duplex conversation, streaming WebRTC and
phoneme/acoustic pronunciation scoring.

## Stage 5 — stable exam experience: PASS

- TOEIC catalog now exposes individual Part practice, a mini test and a
  full-format demo; IELTS catalog exposes Listening and Reading practice.
- All modes use the same server-owned attempt lifecycle: a fixed deadline,
  sequenced autosave, reload/resume, idempotent scoring and progress events.
- A submitted or expired attempt has its own protected result URL. Review is
  durable across browser refreshes and exam history links back to that exact
  attempt; answer keys remain unavailable before submission.
- When time expires, only answers successfully persisted before the deadline
  are scored. The learner receives a review rather than a generic submit error.

Validation: TypeScript, ESLint, 41 unit tests and 19 Playwright journeys pass.

## Content Importer — draft-to-review workflow: PASS

- Admins can upload `.xlsx`, `.csv`, `.docx` and `.pdf` source files to a
  local draft area without exposing raw JSON authoring to the normal workflow.
- Spreadsheet imports show each sheet, preview rows and map source columns to
  the shared Exam/Question model. After validation, an import creates a DRAFT
  TOEIC or IELTS exam, parts, passages and server-scored MCQs.
- Word/PDF imports extract readable text into a DRAFT lesson. The editor maps
  the document to a unit and lesson metadata, then uses the existing Lesson
  Builder to refine, preview, review and publish it. The importer deliberately
  does not invent questions or answer keys from an unreviewed document.
- Every import creates a provenance-aware Content Batch with source, licence,
  author and version metadata. Local raw uploads are stored under ignored
  `.local-imports/`; only normalized database content is publishable.
- Invalid file type/MIME, files larger than 20 MB, incomplete MCQs, invalid
  answer keys and invalid draft content are rejected before content can move to
  review or publication.

Migration: `0009_content_importer.sql`.

Validation: migration, TypeScript, ESLint and 41 unit tests pass. Playwright
verifies CSV upload → column mapping → DRAFT exam → workflow approval →
publication → learner answer/scoring.

## CMS authoring workflow — operational foundation: PASS

- Replaced the ID-copying CMS screen with three authoring areas: **Lesson
  Builder**, **Exam Builder**, and **Media & vocabulary**.
- Lesson authoring now follows a visible workflow: source batch → course/unit →
  lesson → structured content blocks → learner-renderer preview → publish →
  learner route. Editors select related resources from labelled lists rather
  than entering UUIDs or raw JSON.
- Lesson blocks use task-specific forms for text, grammar, pronunciation,
  audio/listening and server-scored MCQ practice. Answer keys are still stored
  only in the server-side content model.
- Exam Builder creates a draft TOEIC/IELTS exam, then adds further parts or
  sections, passages/transcripts and MCQs. It supports the shared question and
  exam foundations without a separate TOEIC/IELTS data model.
- CMS now prevents edits to published lessons/exams, rejects a passage attached
  to the wrong exam part, and only permits publish after the source batch has
  completed DRAFT → REVIEW → APPROVED → PUBLISHED.
- The CMS-specific Vietnamese/English copy and lesson-preview notice are valid
  UTF-8 text.

Validation: production build, TypeScript, ESLint and 38 unit tests pass.
Playwright verifies both locale controls and the CMS journey from create →
preview → publish → learner, including a local audio attachment. The final
full E2E run passed after a clean PostgreSQL reset, migrations and seed.

## Local dev-server reliability

- Development uses Turbopack and the isolated `apps/web/.next-dev` cache.
  Production/E2E builds keep using `.next`, preventing build artifacts from
  invalidating the active development server's CSS or JavaScript chunks.

## Content Pack v0.1 — IMPORTED & NORMALIZED

- Preserved the supplied raw 300-record CC0-1.0 package under `content/incoming`.
- Added a schema-validated, deterministic and idempotent normalization/import
  pipeline with `pnpm content:pack-v01:check`, `:normalize` and `:import`.
- The normalization report documents every source-to-target mapping and all
  deferred records; unsupported question types are never silently converted.
- Imported to local PostgreSQL and included in `pnpm db:seed`: 8 courses, 6
  CEFR levels, 12 lessons, 36 lesson blocks, 120 vocabulary records, 2 exams,
  9 parts, 6 passages and 60 runnable server-scored MCQs.
- Migration `0008_vocabulary_level_identity.sql` changes vocabulary identity to
  `headword + part of speech + CEFR level`, preserving level-specific senses.
- Validation: source check, normalization, migration, repeated seed, ESLint,
  TypeScript and 37 unit tests pass. `/learn`, an imported lesson and an
  imported TOEIC fixture returned HTTP 200 locally.

## Local demo operability follow-up: PASS

- The locale control is visible on desktop and mobile and performs a full page
  reload after changing its durable locale cookie.
- Anonymous learner identity is established before the first learning action, so
  progress can be persisted consistently from the beginning of a visit.
- Header and login now explicitly show the signed-in state when an Auth.js
  session exists.
- IPA sounds and minimal pairs have local browser-speech listening controls;
  shadowing now includes target playback plus microphone record/replay.
- Speaking recording has explicit recording/stopping/ready/error states and
  saved playback in history. No cloud or AI provider is needed.
- Dashboard has skill activity bars and every completed lesson links directly to
  the learner's refreshed progress view.
- The original A1–C2, vocabulary, TOEIC and IELTS local demo seeds were rerun
  idempotently with `pnpm db:seed`.

Verification: TypeScript, ESLint, production build, 37 unit tests and 17
Playwright journeys pass.

## P3 — Four skills: PASS

Implemented:

- Listening and Reading use the Lesson/Question engines, server scoring, review
  and persistent completion history.
- Writing supports validated drafts, submission, word count, reload and revision
  history. No fabricated AI score is produced.
- Speaking supports permission/error states, record, local playback, protected
  local upload and persistent session history.
- Recording files are stored below `.local-media/` and metadata is stored in
  PostgreSQL through the Media abstraction.

Migration: `0007_p3_p5_foundation.sql`.

Tests: content schemas, media validation, writing repository and four-skills E2E.

## P4 — Shared exam engine: PASS

Implemented:

- Shared Exam, Part, Passage, Question, Attempt and Answer foundation for TOEIC
  and IELTS; answer keys are removed from pre-submit payloads.
- Deterministic fixtures for TOEIC Parts 1–7, mini test, compact full mock, IELTS
  Listening and IELTS Reading.
- Practice, mini-test and full-mock modes with timer, expiry, autosave, resume,
  idempotent submit, server scoring, result and review.
- Existing TOEIC Part 5 implementation and tests remain operational.

Tests: exam engine unit tests, fixture coverage, privacy/resume/submit E2E and
TOEIC Part 5 regression E2E.

## P5 — Progress and dashboard: PASS

Implemented:

- Idempotent `ProgressEvent` records with source and idempotency keys.
- Server-owned XP rules and Asia/Ho_Chi_Minh daily streak calculation.
- Events emitted by lessons, Listening, Reading, Writing, Speaking, exams and
  vocabulary review.
- Dashboard reads real PostgreSQL data for XP, streak, activities, vocabulary,
  skill progress, exams, Writing and Speaking.

Tests: duplicate XP/event behavior, same-day/next-day streak and cross-user
ownership boundaries exercised by API/E2E flows.

## P6 — CMS usability: PASS

Implemented:

- Structured forms for batch, course, lesson, lesson blocks, vocabulary, exam,
  passage, question and local media. Normal MCQ authoring needs no raw JSON.
- Lesson blocks can be created, reordered, removed and previewed with the learner
  renderer.
- Local MP3/WAV/OGG and PNG/JPEG/WebP upload, validation, preview and attachment.
- DRAFT → REVIEW → APPROVED → PUBLISHED content workflow.
- Publish validation blocks invalid lessons, missing media, unanswered questions
  and empty exam parts.

Tests: admin operation unit tests and CMS create/preview/publish/learner E2E.

## P7 — Local QA and hardening: PASS

Implemented:

- Guarded local PostgreSQL reset, ordered migrations and deterministic seeds.
- Deterministic QA user, CEFR lessons A1–C2, vocabulary, four-skills activities,
  TOEIC and IELTS fixtures.
- PostgreSQL singleton pool prevents per-request connection exhaustion.
- Playwright coverage for learners, four skills, exams, CMS, vi/en and mobile
  viewports 375×667 and 390×844.
- Chromium fake microphone stream supports deterministic automation; hardware
  verification remains a documented manual check.
- GitHub Actions uses PostgreSQL 16 for validation and E2E.

Final clean-database gate (2026-09-22):

- reset + migrations 0000–0007 + deterministic seeds: PASS
- ESLint: PASS, 0 errors/warnings
- TypeScript: PASS
- Vitest: PASS, 19 files / 37 web tests plus 4 package tests
- Next.js production build: PASS, 37 generated routes/pages
- Playwright on PostgreSQL: PASS, 15/15 journeys

## Architecture decisions

- Next.js routes remain transport/rendering boundaries; persistence and business
  rules live under `src/modules`.
- TOEIC, IELTS and lesson practice share questions, attempts and scoring.
- PostgreSQL owns durable state. Client code never supplies score or XP.
- Guest records are isolated by an HTTP-only guest identifier; signed-in records
  are additionally scoped by user ID.
- Local media is intentionally replaceable by the existing S3-compatible media
  boundary.

## Known local-MVP limitations

- Demo exams are compact, original-format fixtures, not licensed ETS/Cambridge
  full-length test content.
- Writing has deterministic metadata and revision history, not AI evaluation.
- Speaking transcription and feedback require `GEMINI_API_KEY`; pronunciation
  scoring remains deferred because transcript-only AI cannot assess phonemes.
- P3–P7 learner, exam and structured CMS controls are available in Vietnamese
  and English; authored demo content itself remains English learning material.
- Google OAuth is optional and requires credentials only when sign-in is tested.

## Intentionally deferred external services

Realtime AI Speaking, cloud speech/alignment, Cloudflare R2/S3 production
storage, production domain/deployment, Sentry and PostHog are deferred. Local
recording/playback remains usable without any external provider.
