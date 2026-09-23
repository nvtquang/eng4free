# Target architecture

English 4 Free is a TypeScript modular monolith with a separately deployable
speech/realtime boundary. The root is deliberately a pnpm workspace; reference
repositories stay where they are during migration and are never workspace packages.

```text
apps/web                         Next.js App Router: routes, layouts, handlers
  src/app                        thin delivery layer only
  src/modules                    domain use cases and repositories
  src/components                 reusable presentation components
  src/db                         Drizzle schema and database adapters
packages/content-schemas         versioned Zod schemas and public projections
packages/scoring-core            pure deterministic scoring; no database or React
packages/srs                     FSRS adapter (added when dependency is selected)
packages/shared-types            stable cross-domain types/enums
services/speech                  Python/FastAPI adapters: transcription/alignment/phonemes
services/realtime-speaking       LiveKit-based service, only after turn-based MVP
workers/*                        asynchronous AI, media processing and imports
content/*                        reviewed source/normalized seed material, not React code
```

## Dependency rules

1. `app/` validates/authenticates and invokes a module use case; it owns no scoring rule.
2. `components/` receive display-safe data only. Question answer keys never cross the attempt-start boundary.
3. `scoring-core` is pure and is invoked on the server. It has no Next.js, database, network or AI dependency.
4. `content-schemas` validates author/import boundaries and creates `public` question projections.
5. `modules/` may depend on packages; packages may not depend on `apps/web`.
6. Speech/LanguageTool/LiveKit are adapter clients, not dependencies embedded in route handlers.

## Initial request flow

`POST /api/exams/:id/submit` → Zod request validation → Auth.js identity →
`submitExamAttempt()` → load private answer keys → `scoreAttempt()` → persist
attempt/result and emit `EXAM_COMPLETED` → return review-safe result. The initial
client payload contains question content without answer keys.

## YAGNI boundary

The scaffold creates only the foundational packages and a health endpoint. Course,
CMS, speech, workers and R2 implementations are represented by documented
boundaries, not empty fake services.

