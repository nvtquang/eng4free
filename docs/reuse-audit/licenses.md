# License audit — Phase 0

Audited on 2026-09-21. This register covers repositories physically cloned under
`D:\Projects\English 4 Free`; it does not treat a repository name as proof of a
license. “Content” includes test items, audio, images, word lists and model
weights, each of which may have terms separate from the source-code license.

| Repository | License found | Code reuse | Data reuse | Attribution / copyleft | Risk |
| --- | --- | --- | --- | --- | --- |
| `TOEIC/toeic-space-fe` | MIT | Permitted; port only selected patterns | No learning content found in the reviewed FE | Preserve MIT notice | Low code risk; small/incomplete scope |
| `TOEIC/toeic-space-be` | No root license | Not permitted | Not permitted | N/A | High: no license; many assessment/content folders are placeholders |
| `Pratices/toeic-practice` | MIT | Permitted; port engine/schema ideas | Treat bundled TOEIC-style tests as provenance review required despite author’s “original” claim | Preserve MIT notice; retain its ETS trademark notice | Medium: listening is text-only; do not redistribute until content audit |
| `IELTS/ielts-prep` (BandReady) | MIT | Permitted; port web-safe domain logic | Do not bulk-import `content/`; Oxford-labelled material and media require separate rights verification | Preserve MIT notice | Medium: Electron/offline assumptions and third-party content |
| `IELTS/IELTS_WEB` | No root license (frontend has a separate license file only) | Do not copy | Do not copy tests/media/questions | N/A | High: repository-level license is absent/ambiguous |
| `Listening/ispeakerreact` | Apache-2.0 | Permitted with NOTICE/license preservation | Audio, images and exercise data require asset-level provenance review | Apache-2.0 notice requirements | Medium: Electron-specific code and supplied media |
| `Pratices/LibreLingo` | AGPL-3.0 | Do not embed/copy into proprietary or differently licensed production web app without a deliberate AGPL decision | Course and image assets have their own attribution files | Network copyleft applies to modified deployed program | High for direct reuse; reference only |
| `CEFR/Words-CEFR-Dataset` | MIT | Import scripts/data model may be adapted | Dataset has MIT repo license but upstream CEFR-J/Google Ngrams/etc. require attribution/provenance retained | Preserve MIT notice and upstream source metadata | Medium: inferred CEFR labels, not authoritative exam content |
| `CEFR/CEFR-English-Level-Predictor` | MIT | May wrap/port inference if model retraining/provenance is verified | Training data needs independent provenance review | Preserve MIT notice | Medium: pinned 2021 Python dependencies and model-quality validation needed |
| `Speaking/agents` (LiveKit Agents) | Apache-2.0; `MODEL_LICENSE` also exists | Use published package or separate service, not vendored source | No model/example media imported by default | Apache-2.0 notice; inspect provider/model terms separately | Medium: paid provider and realtime infrastructure exposure |
| `Writing/languagetool` | LGPL-2.1 (`COPYING.txt`) | Do not copy/link internally without legal boundary review | Language rules/resources may have separate licenses | LGPL obligations; preserve notices | Medium: use its HTTP server as a separately deployed service after legal/ops review |
| `AI tutor/langchain4j` | Apache-2.0 | Not selected for direct use; TypeScript target uses Vercel AI SDK/provider adapter | No content import | Apache-2.0 notice if copied | Low legal / poor stack fit |

## Mandatory import metadata

Every imported or generated content record must retain `source`, `license`,
`author`, `generatedBy`, `reviewedBy`, `importedAt`, and `version`. A valid code
license does not establish a right to redistribute IELTS/TOEIC-like questions,
recordings, images, or model weights.

