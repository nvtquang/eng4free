# Reuse matrix — Phase 0

No source from a reference repository has been copied into the target packages.
The decisions below are implementation constraints for subsequent phases.

| Repository | Feature verified in code | Useful components / logic | Target module | Strategy | License | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `toeic-practice` | Dependency-free TOEIC LR runner; JSON validator, timer, persisted session, navigation, review, weak-topic trends | `js/core/format.js`, `engine.js`, `storage.js`, `progress.js`; documented test JSON | `packages/content-schemas`, `packages/scoring-core`, `modules/exams`, `modules/attempts` | Re-specify schemas and port deterministic rules to strict TS with server scoring/tests; do not migrate DOM/UI | MIT | Real audio not implemented; test-data provenance review | PORT_REWRITE |
| `toeic-space-fe` | React/TS feature folders, i18next, TanStack Query, Zustand, auth shell | Module boundary, providers, HTTP client conventions, VI/EN locale organization | `apps/web`, `modules/auth`, `components` | Use as a structural reference; selectively port only after file-level attribution is recorded | MIT | Current reviewed source is essentially auth/shared shell, not full TOEIC engine | PORT_REWRITE |
| `toeic-space-be` | .NET microservice topology, Identity implementation, R2 abstraction | `IObjectStorageService` idea; OTP/auth concepts | `modules/media`, `modules/auth` | Reimplement the small concepts in Next/Auth.js; no source reuse | No license | Assessment/content implementation is mostly placeholder; over-engineered microservices | REFERENCE_ONLY |
| `ielts-prep` / BandReady | Electron React app plus FastAPI sidecar; reading/listening/writing/speaking/pronunciation/SRS/placement; substantial Vitest/Pytest suite | Feature decomposition, sidecar API boundaries, SRS and scoring test cases, accessibility patterns, content normalisation workflow | `modules/*`, `services/speech`, `packages/srs`, `workers/async-ai` | Port selected domain contracts and tests; exclude Electron bridge and local-device assumptions | MIT | Content/media needs independent clearance; very broad scope | PORT_REWRITE |
| `IELTS_WEB` | React/Node/Prisma app with pages and services for the four skills, progress, badges, writing AI, band helpers | Route/service decomposition; inspect band-descriptor configuration as a reference | `modules/exams`, `modules/ai-writing`, `modules/progress` | Reimplement only verified requirements; do not copy code/data | No root license | License ambiguity and JS/non-type-safe architecture | REFERENCE_ONLY |
| `ispeakerreact` | React/Vite/Electron educational pronunciation app; sound, word, exercise, conversation and exam UI | IPA/sound/minimal-pair/shadowing UX, recorder/playback interaction ideas, countdown hook | `modules/pronunciation`, `components` | Port isolated web UI only after asset and dependency review; remove Electron/FFmpeg desktop paths | Apache-2.0 | Shipped audio/image/exercise assets are not automatically reusable | PORT_REWRITE |
| `LibreLingo` | Next web app, YAML/JSON course tooling, challenge formats, course tests | Content-import lessons and challenge modelling | `packages/content-schemas`, `workers/content-import` | Learn from schemas/tooling; independently design schemas | AGPL-3.0 | Copyleft makes direct code reuse unsuitable | REFERENCE_ONLY |
| `Words-CEFR-Dataset` | CSV/SQLite word, POS, frequency, inferred CEFR category dataset | Normalization input and provenance model | `content/cefr`, `scripts/import/cefr`, `modules/vocabulary` | Build importer that records dataset version/source; sample and validate level quality | MIT | Upstream source conditions; labels are estimates | DATA_SOURCE |
| `CEFR-English-Level-Predictor` | Python XGBoost/feature inference API and CEFR-labelled training data | Text-difficulty estimation for authoring QA, never learner placement as sole signal | `workers/content-import` or optional `services/speech`-adjacent ML service | Wrap behind a small internal interface after model evaluation/retraining | MIT | Old dependencies; source data quality and bias | WRAP_SERVICE |
| `LiveKit Agents` | Python realtime agent framework with STT/TTS/LLM/VAD plugins and tested examples | Realtime session orchestration, turn model, provider adapters | `services/realtime-speaking` | Depend on maintained package/service; never vendor full repo | Apache-2.0 | Provider costs, model terms, operational complexity | WRAP_SERVICE |
| `LanguageTool` | Java grammar/style engine with HTTP server module and language resources | Deterministic writing issue pass | `modules/ai-writing` via adapter | Deploy/run separately behind an HTTP adapter; cache and rate-limit caller | LGPL-2.1 | License/resource boundary and hosting capacity | WRAP_SERVICE |
| `langchain4j` | Java AI/RAG/provider framework with broad tests | Provider abstraction/RAG design ideas | `modules/ai-tutor`, `modules/ai-writing` | Use Vercel AI SDK TypeScript adapter instead; retain only as documentation reference | Apache-2.0 | Wrong runtime/stack for target | ARCHIVE |
| `fe` (existing local Vite prototype; not a Git repo) | React landing page with `react-i18next` Vietnamese/English shell | Existing copy/visual prototype only | `(marketing)` | Replace incrementally with SSR Next pages; keep until its contents are deliberately migrated | Local/unlicensed | Not SEO/Next architecture; no reusable domain core | ARCHIVE |

## Capability winners and duplicates

| Capability | Chosen baseline | Why |
| --- | --- | --- |
| TOEIC deterministic runner | `toeic-practice` | Most complete, well-documented pure engine; must be ported server-side and supplied real licensed audio. |
| TOEIC UI architecture / i18n | `toeic-space-fe` | Closest TS React stack, but only as a pattern because it is incomplete. |
| IELTS learning domains and tests | BandReady | Deepest feature/test coverage; port contracts rather than Electron UI. |
| Pronunciation educational UX | iSpeaker | Directly relevant IPA/sound/exercise/conversation surface. |
| Vocabulary seed | Words-CEFR-Dataset | Structured dataset with identified provenance; import, never display raw. |
| Spaced repetition | Official `ts-fsrs` package to be added later | No checked-out FSRS repository exists; do not copy an ad-hoc algorithm. |
| Grammar checking | LanguageTool HTTP service | Preserve LGPL boundary; no vendoring. |
| Realtime speaking | LiveKit Agents service | Avoid implementing WebRTC/agent orchestration from scratch. |

## Repositories not present

No Git checkout for `ts-fsrs`, Whisper, faster-whisper, WhisperX, Montreal Forced
Aligner, SpeechBrain, Pipecat, or Piper was found. They must not be assumed to
be locally available. Add them only after a separate license, model and operating-cost review.

