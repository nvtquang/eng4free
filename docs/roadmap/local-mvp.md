# Local-first MVP roadmap

This roadmap supersedes the delivery order in `migration-plan.md`. Build a complete,
demonstrable local product before activating paid or production infrastructure.

Current audited state and active priority order: see
`docs/roadmap/local-mvp-audit.md`. The local P3–P7 implementation and QA status is
tracked in `docs/implementation-status.md`.

Demo scope, scenarios and acceptance checklist (D0, 2026-09-26): see
`docs/roadmap/demo-acceptance.md`.

## Scope rule

The local MVP includes CEFR A1-C2 learning, vocabulary, grammar, educational
pronunciation, four skills, practice, TOEIC, IELTS, dashboard, guest/account flow
and CMS authoring. Demo content must be original, licensed or clearly marked as a
placeholder.

The following are post-MVP: AI Tutor beyond official explanations; AI Writing
scoring/correction; AI Speaking conversation/transcription/pronunciation scoring;
R2/S3; cloud speech; external AI; domain; deployment; production analytics.

Writing therefore supports drafts plus deterministic word/paragraph diagnostics;
Speaking supports browser record/replay; Tutor shows curated official explanations.
The UI must state these limits honestly and never fabricate AI feedback or bands.

## Local runtime rules

- Use local PostgreSQL and `DATABASE_URL` for persistent demo data; guest mode
  remains available.
- Keep demo assets in `apps/web/public/demo-media/` with recorded provenance.
- Seed original content from `content/` and scripts; never redistribute ETS or
  Cambridge proprietary material.
- Provider interfaces remain in code, but no MVP journey may require a provider.

## Milestones

### MVP-0 — Scope lock and baseline

- Freeze the feature list and label AI/production controls as future work.
- Verify local migrate, seed, guest attempt and optional Google login.
- Create a reset/reseed procedure, demo acceptance list and content provenance log.

**Exit:** a new developer can run, migrate, seed and complete a guest TOEIC attempt
without an external provider.

### MVP-1 — UI system and navigation

- Audit `/fe`; move reusable tokens/components into `apps/web`, not a second app.
- Complete responsive navigation for Learn, Skills, Vocabulary, Grammar,
  Pronunciation, TOEIC, IELTS, Dashboard and Admin.
- Finish Vietnamese/English coverage, font fixes, loading/error/empty states and
  keyboard/mobile accessibility.

**Exit:** every MVP route is reachable and visually coherent on mobile/desktop.

### MVP-2 — CEFR course and lesson engine

- Complete level → unit → lesson → practice listing and lesson-block rendering.
- Embed the shared Question Engine: MCQ, multi-select, fill blank, matching,
  ordering and dictation.
- Seed one finished demonstration unit for each A1-C2 level and persist completion.

**Exit:** a learner completes a lesson at every CEFR level and sees saved progress.

### MVP-3 — Vocabulary, grammar and pronunciation

- Vocabulary: CEFR/IELTS/TOEIC filters, meanings, IPA, examples, saved words and
  local review scheduling.
- Grammar: A1-C2 catalogue, explanation blocks and deterministic exercises.
- Pronunciation: IPA, minimal pairs, shadowing scripts and browser record/playback;
  no score is displayed.

**Exit:** every area has original demo content and one complete learning loop.

### MVP-4 — Four-skill practice

- Listening: local original/licensed audio, transcript reveal, comprehension and
  dictation.
- Reading: passages, timing and shared question types.
- Writing: prompt, autosave, deterministic diagnostics and revision history.
- Speaking: prompt cards, microphone permission, record/replay/delete and session
  history, without transcription or feedback.

**Exit:** all four skills have an end-to-end activity requiring no external API.

### MVP-5 — TOEIC demo completion

- Complete original-format practice flows for Parts 1-7.
- Add mini tests/full mock rules: timer, navigation, autosave, submit, review,
  explanation, history and score estimate.
- Use local demo assets; answer keys remain server-side.

**Exit:** a guest completes and reviews a full original-format demo mock.

### MVP-6 — IELTS demo completion

- Reuse Question/Attempt engines for Listening and Reading.
- Support Writing Task 1/2 drafts and deterministic diagnostics only.
- Support Speaking Parts 1-3 recording sessions only.
- Show deterministic Listening/Reading calculators; label Writing/Speaking AI as
  unavailable.

**Exit:** all four IELTS areas contain an honest original demo activity.

### MVP-7 — Dashboard and account polish

- Emit `ProgressEvent` from every important action.
- Complete streak, XP, vocabulary learned, CEFR/skill progress, exam history and
  learning history.
- Define and implement guest-to-account ownership behavior.

**Exit:** dashboard changes predictably and persists after refresh/sign-in.

### MVP-8 — CMS and local content operations

- Finish forms for courses, lessons/blocks, vocabulary, grammar, passages, media
  metadata, question bank and exams.
- Enforce DRAFT → REVIEW → APPROVED → PUBLISHED workflow.
- Use a documented local `public/demo-media` workflow; R2 upload is deferred.
- Add content preview and author-friendly validation.

**Exit:** admin can author, publish and preview a lesson/exam without editing React.

### MVP-9 — QA and local release candidate

- Test deterministic scorers, local API routes and content validation.
- Add E2E journeys: guest learning, review, microphone denial, TOEIC, IELTS,
  dashboard and CMS.
- Fix i18n/font/hydration/empty-state defects; prepare reset DB and demo tour.

**Exit:** `pnpm verify` and E2E pass; no MVP page requires AI or cloud credentials.

## Post-MVP sequence

1. **AI-1:** contextual Tutor grounded in official answer/explanation.
2. **AI-2:** Writing rubric feedback, evaluation set, usage limits and cost controls.
3. **AI-3:** speech transcription/alignment/pronunciation, then realtime speaking.
4. **PROD-1:** R2/S3, cloud PostgreSQL, secrets, backups and workers.
5. **PROD-2:** domain, production OAuth callback, hosting, monitoring, analytics and launch.

No post-MVP phase starts until its provider, budget, privacy implications and
acceptance criteria are chosen.
