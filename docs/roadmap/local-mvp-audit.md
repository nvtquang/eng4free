# Local MVP readiness audit

Audit date: 2026-09-21

## Verdict

The repository is a healthy **foundation/prototype**, not a complete local MVP
yet. Build quality is good, but the current product has one fully interactive
learning vertical: TOEIC Part 5 with three seeded questions. Most other areas are
catalogue, static demonstration or isolated UI components.

## Evidence collected

| Check | Result | Meaning |
| --- | --- | --- |
| TypeScript | Pass | Source compiles with strict TypeScript. |
| Unit tests | 30 pass | Pure scoring/domain tests are covered. |
| Production build | Pass | Next.js production compilation succeeds. |
| Playwright | 2 pass | Only API answer-key privacy and TOEIC Part 5 countdown are tested. |
| Route smoke test | Public routes return 200 | Rendering is not the same as a complete user flow. |
| Local PostgreSQL | Reachable | Persistence is available for local MVP work. |

The Playwright configuration uses `E4F_USE_IN_MEMORY=true`, so it does not prove
the real local PostgreSQL flows, content seeds, CMS persistence or media workflow.

## Actual local database state

| Data | Count | Readiness |
| --- | ---: | --- |
| Users | 1 | Available for auth testing. |
| Courses / levels / units / lessons | 0 / 0 / 0 / 0 | Not seeded; CEFR route is static metadata only. |
| Vocabulary / vocabulary reviews | 0 / 0 | UI reads an imported catalogue and browser localStorage only. |
| Exams / parts / questions | 1 / 1 / 3 | Only TOEIC Part 5 starter data exists. |
| Attempts | 9 | Part 5 persistence has been exercised. |
| Progress events | 0 | Dashboard has no real learner activity to project. |
| Content batches / media | 1 / 0 | CMS content workflow is not populated with usable media. |
| Writing submissions / speaking sessions | 0 / 0 | UI interactions do not persist a local learning history. |

## Capability assessment

| Capability | Status | What is actually usable | Gap before MVP |
| --- | --- | --- | --- |
| App shell, responsive layout, basic locale switch | Partial | Pages render; locale switch exists. | Many user-facing strings are route/component-local rather than translated centrally. |
| Auth and guest mode | Partial | Google OAuth and guest Part 5 attempts work locally. | Account migration/ownership behavior is not defined across all domains. |
| CEFR A1-C2 | Prototype | Six levels and lesson links are listed. | Every lesson route explicitly says the Lesson Engine will render later; no lesson blocks, questions, completion or seeded courses. |
| Vocabulary | Partial | CEFR level filter and local FSRS-style card rating work. | No database cards/reviews, search, topics, IELTS/TOEIC sets, learned count or progress event. |
| Grammar | Missing | Navigation label only. | No grammar route, data model, catalogue, lesson or exercises. |
| Pronunciation | Partial | IPA/minimal-pair/shadowing cards plus browser record/replay. | No lesson sequence, source audio, saved recording/session, progress or exercise scoring. |
| Listening | Missing | No learner route/activity. | Need local audio, transcript and deterministic questions. |
| Reading | Missing | No learner route/activity. | Need passages, timing and question flow. |
| Writing | Prototype | One IELTS prompt and deterministic word/paragraph diagnostics. | No autosave, persistence, revision history, CEFR writing activity or progress event. |
| Speaking | Prototype | One IELTS Part 1 recorder and replay. | No Parts 2/3, saved sessions/history, CEFR speaking activity or progress event. |
| TOEIC | Partial | Part 5 start/save/submit/review/history works. | Parts 1-4/6-7, practice bank, mini test and full mock do not exist; page explicitly marks them pending. |
| IELTS | Prototype | Band calculators, one Writing prompt and one Speaking prompt. | Listening/Reading are marked coming soon; no full exam/attempt/review flow. |
| Dashboard | Prototype | Projects stored progress events. | Only TOEIC submit emits an event, local DB has zero events; no course/vocab/speaking/writing projections. |
| Admin CMS | Partial | Admin gate, draft creation and batch transition API exist. | JSON textarea is a developer tool, not course/lesson/exam/media authoring; no previews and no local asset workflow. |
| AI / cloud integrations | Deferred | Safe fallbacks and interfaces exist. | Correctly excluded from local MVP acceptance. |

## Highest-priority blockers

1. There is no complete content/lesson rendering path. It blocks CEFR, grammar,
   four-skill learning, CMS value and dashboard progress.
2. The site has no local demo-content pack except three TOEIC Part 5 questions.
3. Core product routes are missing: Grammar, skill-specific Listening/Reading/
   Writing/Speaking practice, TOEIC Parts 1-4/6-7, mock test and IELTS Listening/
   Reading.
4. Local interactions are not consistently persisted or converted into
   `ProgressEvent`; therefore dashboard metrics cannot be trusted.
5. E2E coverage is insufficient for a local release candidate.

## Updated implementation order

This is the active sequence; do not start AI or deployment work before item 8.

1. **P0 - Product-operability pass:** inventory every navigation target; finish
   language coverage, loading/error/empty states and remove dead/coming-soon links
   from primary navigation until the corresponding feature exists.
2. **P1 - Content and Lesson Engine vertical slice:** implement published lesson
   query/rendering, lesson blocks and embedded deterministic exercises; seed one
   fully playable A1 lesson. Validate the complete CMS-to-learner path first.
3. **P2 - Local content pack:** add original/demo CEFR lessons for A1-C2, grammar
   topics, vocabulary sets, reading passages, listening audio/transcripts and
   provenance metadata. Add repeatable seed/reset scripts.
4. **P3 - Four-skill practice:** make Listening, Reading, Writing and Speaking
   independent local flows with persistence. Writing/Speaking remain non-AI.
5. **P4 - Exam engine expansion:** generalize the existing Part 5 runner into
   reusable part/section routes, then implement original TOEIC Parts 1-7 and IELTS
   Listening/Reading demo sections. Add mini/full mock orchestration last.
6. **P5 - Progress and dashboard:** emit events from every completed action,
   implement projections and verify guest/account ownership.
7. **P6 - CMS usability:** replace JSON-only authoring with scoped forms, preview,
   local media workflow and publish validation.
8. **P7 - Local release QA:** grow Playwright to all critical journeys against real
   PostgreSQL, add reset/seed fixture, verify Vietnamese/English, mobile and
   microphone-denied behavior.

## Completion rule

Call the local MVP complete only when every main navigation item has an honest,
end-to-end local activity; data survives refresh; all activity appears in the
dashboard; admins can publish the demo content; and the P7 journey suite passes.
