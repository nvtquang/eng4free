# Migration plan

## Completed — Phase 0 / foundation

- Inventoried 12 cloned repositories and the existing local Vite prototype.
- Recorded code/data license decisions in `docs/reuse-audit/licenses.md`.
- Selected port/wrap/reference strategies in `docs/reuse-audit/reuse-matrix.md`.
- Created a minimal pnpm workspace and pure Question/Scoring foundation. No reference source or dataset was copied.
- Verification passed: `pnpm test` (2/2), `pnpm --filter @english4free/web typecheck`, and `pnpm --filter @english4free/web build`.

## Next — Phase 1: TOEIC vertical slice

1. Add Drizzle/PostgreSQL schema for content batch, exam, part, question, attempt and answer.
2. Implement repository ports and `submitExamAttempt()` server use case.
3. Add authenticated/guest attempt persistence plus autosave.
4. Implement Part 5 MCQ end-to-end, then Part 1 with only licensed/original images/audio.
5. Port behaviour specifications from `toeic-practice` into Vitest/Playwright tests; do not port its browser globals/UI.

## Completed — Phase 1: TOEIC Part 5 vertical slice

- Added Drizzle/PostgreSQL schema and SQL migration for content batches, exams,
  parts, questions, attempts and answers.
- Added original TOEIC Part 5 seed content. After applying the SQL migration and
  setting `DATABASE_URL`, run `pnpm db:migrate` then `pnpm seed:toeic-part5`.
- Implemented guest attempts with an HTTP-only guest cookie, autosave, answer
  validation, server-side scoring, submit and explanation-safe review.
- Added `/toeic/practice/part-5`, including timer, answer state and autosave status.
- Added unit coverage for autosave, invalid-option rejection and submission scoring.
  `attempts.user_id` is ready for Auth.js; fake authentication was not added.

## Next — Phase 1b: productionise TOEIC foundation

1. Add Auth.js and attach the authenticated actor to attempt ownership.
2. Configure Neon in local/preview environments and replace the in-memory dev fallback.
3. Add Playwright coverage for refresh/resume, timer expiry and answer-key non-disclosure.
4. Add TOEIC Part 1 only after original/licensed images and audio are available.

## Completed — Phase 2: learning core

- Added the Course → CEFR Level → Unit → Lesson → Lesson Block relational model.
- Added vocabulary and FSRS review persistence, including `difficulty`, `stability`,
  `retrievability`, `dueAt` and `lastReview`.
- Added the official MIT-licensed `ts-fsrs` scheduler adapter with deterministic tests.
- Added and executed a CEFR importer. It normalized 7,988 entries with source/license
  provenance into `content/cefr/imports/words-cefr.v1.json`; raw dataset files remain references.
- Added `0001_phase2_learning_core.sql`; `pnpm db:migrate` now applies both migrations in order.

## Completed — Phase 1b: productionise TOEIC foundation

- Added Auth.js with a Drizzle adapter and optional Google OAuth. Sign-in stays
  disabled until the required Google/Auth.js environment variables are configured.
- Added Auth.js user, account, session and verification-token tables plus ownership
  binding from authenticated attempts to `attempts.user_id`.
- Added ownership coverage: a different guest/user cannot autosave another user’s attempt.
- Added Playwright specs for the countdown and answer-key non-disclosure. Browser
  binaries are intentionally not downloaded during normal dependency install.
- Added `0002_phase1b_auth.sql`; `pnpm db:migrate` now applies Phase 0 through 1b.

## Completed — UI-0: `/fe` visual audit

- Audited the Vite prototype’s sections, tokens, interaction hooks, localization,
  accessibility patterns and external assets.
- Approved its warm editorial design direction and documented explicit port/rebuild/defer decisions.
- Created a UI-1 backlog that prevents migration of raw HTML, Vite coupling and fake learning logic.

## Next — UI-1: shared design system

1. Configure Tailwind/shadcn and visual tokens in `apps/web`.
2. Implement shared shell, responsive navigation and SSR-safe Vietnamese/English locale system.
3. Port the visual system before composing the actual marketing pages in UI-2.

## Completed — UI-1: shared design system

- Added Tailwind CSS, semantic design tokens and reusable Button, Card, Section,
  Eyebrow and LevelBadge primitives to the Next.js app.
- Replaced the temporary app shell with responsive SiteHeader/SiteFooter, keyboard
  Escape support for mobile navigation, visible focus states and reduced-motion support.
- Added SSR-safe Vietnamese/English message catalogues. The selected locale is held
  in a first-party cookie; switching it refreshes React server components without a
  browser document reload.
- Added Inter and Source Serif 4 through `next/font`, replacing the prototype's
  external font stylesheet.

## Completed — UI-2: marketing foundation

- Rebuilt the public landing page natively in Next.js using the approved editorial
  visual language; no Vite HTML, browser-global interaction code or external imagery
  was imported.
- Added public route foundations for Learn, TOEIC, IELTS, Vocabulary, Grammar,
  Pronunciation, Dashboard, About and Blog.
- Connected the TOEIC marketing entry point to the working Part 5 vertical slice.

## Completed — Phase 2b: learning experience

- Added the CEFR learning-path UI at `/learn`, with A1–C2 progression and lesson
  routes driven by a course-domain read model rather than page-local data.
- Added a vocabulary browser at `/vocabulary`, filtered by CEFR level and reading
  from the normalized, provenance-preserving CEFR import output.
- Added a client-side vocabulary review session powered by the shared FSRS adapter.
  During the guest foundation phase, its schedule is stored only in browser
  localStorage; authenticated database persistence remains a later progress feature.
- Added unit coverage for CEFR route lookup and dataset-level filtering/provenance.

## Completed — Phase 3: pronunciation foundation

- Added native learner UI for IPA sounds, minimal pairs and shadowing at
  `/pronunciation`, driven by a pronunciation-domain content module.
- Added browser microphone recording and playback. Recordings remain in browser
  memory in this foundation iteration; no user audio is uploaded without a signed
  media-storage implementation and explicit server route.
- Added `MediaService` and `SpeechService` TypeScript contracts and documented the
  future pipeline. Next.js does not host a speech model or make phoneme decisions.
- Added unit coverage for initial pronunciation-content integrity.

## Completed — Phase 3b: speech-service integration boundary

- Added an independently deployable FastAPI speech-service scaffold under
  `services/speech`, including health, transcription, alignment and pronunciation
  analysis endpoints with a stable typed contract.
- Added a validated HTTP adapter in the web domain and an opt-in health endpoint.
  Missing/unreachable service configuration fails closed; it never fabricates a
  transcript or pronunciation score.
- Added `SPEECH_SERVICE_URL` configuration and isolated Docker Compose definition.
  The scaffold returns `503 SPEECH_PROVIDER_UNAVAILABLE` until a deliberate
  faster-whisper/WhisperX/MFA/SpeechBrain provider decision is implemented.

## Completed — Phase 4: IELTS and AI-feedback contracts

- Added IELTS landing, turn-based Speaking and Writing routes, plus pure band
  calculators for Listening and Academic Reading raw scores.
- Added Zod-validated Writing submission, diagnostics and structured-feedback
  contracts. The first Writing endpoint provides deterministic word/paragraph
  diagnostics and returns no invented band when an AI provider is absent.
- Added an optional HTTP provider boundary for AI Writing and persistence schema for
  writing submissions/feedback and speaking sessions/turns.
- Added migration `0003_phase4_ielts_ai.sql`. Apply it with `pnpm db:migrate`
  after updating your local PostgreSQL schema.

## Completed — Phase 5: content CMS workflow

- Added protected Admin CMS route and API for content-batch workflow transitions.
- Enforced the canonical draft/review/approval/publish/archive transition graph in
  a tested domain module; direct publishing from draft is rejected.
- Added temporary bootstrap authorization through `ADMIN_EMAILS`; all mutations
  remain server-authorized and database-backed when `DATABASE_URL` is configured.

## Completed — Phase 6: progress and dashboard

- Added immutable ProgressEvent storage, projection logic for XP/streak/skill
  activity, dashboard UI and TOEIC completion event emission.

## Completed — Phase 7: AI Tutor orchestration

- Added a post-submission Tutor endpoint that loads answer keys and official
  explanations only on the server, rate-limits requests and never accepts an
  answer key from a browser.
- Added a provider abstraction with a safe official-explanation fallback;
  external provider responses are Zod-validated.

## Completed — Phase 8: media and asynchronous-work boundaries

- Added media metadata and processing-job tables, job state contracts and retry
  guardrails. Media is represented by storage keys rather than local files.
- Added worker runbooks for media processing and asynchronous AI. Workers receive
  internal IDs and signed storage references only; large audio does not pass through
  application routes.

## Completed — Phase 9: security, SEO and observability baseline

- Added CSP and browser-security headers, sitemap/robots routes, privacy page and
  canonical URL configuration.
- Added local observability adapters with no provider keys or learner content sent
  anywhere until Sentry/PostHog are explicitly configured.

## Completed — Phase 10: delivery readiness

- Added GitHub Actions quality gates for typecheck, unit tests, production build and
  Playwright E2E with Chromium.
- Added a production release checklist covering secrets, migrations, content rights,
  media/AI provider enablement and smoke checks.

## Completed — Milestone 11 foundation: TOEIC MVP

- Added a TOEIC hub with Part 1–7 format metadata, media/content readiness states,
  practice-only scaled-score estimate and full-mock session policy.
- Kept Part 5 as the first end-to-end persisted vertical slice and added a TOEIC
  attempt-history route. Part 1–4 remain correctly blocked on licensed media;
  Part 6–7 remain blocked on reviewed original content.
- Added tests for the 200-question format contract, listening playback policy and
  score-estimate bounds. No ETS content or unlicensed media was imported.

## Completed — Milestone 12: CMS and content operations

- Added protected, Zod-validated CMS operations for content batches, course +
  level/unit, lessons, exam + part, MCQ question bank and media metadata.
- Added an admin authoring surface with documented JSON templates and generated IDs
  for dependent resources. Every operation creates DRAFT content first.
- Kept binary upload separate from CMS metadata: registered media requires the
  signed-upload integration before it can become available to learners.

## Implemented but deferred â€” Milestone 13: production integrations

- Added an S3-compatible (including Cloudflare R2) private-object adapter with
  short-lived signed PUT/GET URLs, strict metadata verification and protected CMS
  upload/finalize routes.
- Added production integration health reporting, API-key + timeout support for
  AI/speech boundaries and optional speech-service request authentication.
- Documented database, OAuth, R2 CORS, AI and speech deployment contracts in
  `docs/operations/production-integrations.md`.

> These integrations stay dormant during the local-first MVP. Do not configure
> R2/S3, external AI, cloud speech, a domain or deployment until the acceptance
> gates in `docs/roadmap/local-mvp.md` are complete.

## Later

## Completed — Local MVP P1: Lesson Engine vertical slice

- Added a published, original A1 lesson (`introduce-yourself`) with ordered rich-text
  and question-set blocks. It is seeded through `pnpm seed:a1-demo` and rendered from
  the database at `/learn/a1/introduce-yourself`.
- Added CMS operations for lesson blocks and guarded lesson publication. A lesson can
  publish only after its linked content batch is published and it has at least one block.
- Added server-side lesson scoring and idempotent completion storage. Learners receive
  no answer key before submission; first completion creates one ProgressEvent for the
  signed-in user or guest.

- The active delivery sequence is `docs/roadmap/local-mvp.md` (MVP-0 through
  MVP-9). AI and production work are explicitly post-MVP.

## Deferred decisions

- Verify legal rights for all third-party IELTS/TOEIC-style data and media before importing.
- Run a separate evaluation and infrastructure decision before adding WhisperX/MFA/SpeechBrain.
- Obtain legal approval before self-hosting LanguageTool; its HTTP boundary is intentional.

## P1 verification record

- `pnpm db:migrate` applied `0006_p1_lesson_completion` on the configured local PostgreSQL database.
- `pnpm seed:a1-demo` created or refreshed the original, published A1 "Introduce yourself" course, unit, lesson and three ordered blocks.
- `pnpm typecheck` and `pnpm --filter @english4free/web test` pass after the implementation.
- The production build emitted the lesson route and completion API in `.next/server/app-paths-manifest.json`.

## Completed — Local MVP P2: local content pack

- Added an original, published content pack covering A1 through C2: six lesson demos,
  grammar explanations, server-scored practice, a reading passage and two listening
  activities with transcripts.
- Added original CEFR-tagged vocabulary with IPA, Vietnamese meaning and an example
  sentence for each level. The vocabulary page now prefers published local database
  data and falls back to the existing read-only catalogue during an in-memory test run.
- Listening uses explicitly labelled browser speech synthesis for the local demo; it
  requires no cloud provider and is deliberately not represented as licensed audio.
