# Implementation status

Updated: 2026-09-23

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
- Speaking records and replays audio, but has no transcription or pronunciation
  score.
- P3–P7 learner, exam and structured CMS controls are available in Vietnamese
  and English; authored demo content itself remains English learning material.
- Google OAuth is optional and requires credentials only when sign-in is tested.

## Intentionally deferred external services

AI Tutor provider, AI Writing evaluation, AI Speaking, cloud speech/alignment,
Cloudflare R2/S3 production storage, production domain/deployment, Sentry and
PostHog are deferred. No local acceptance journey depends on them.
