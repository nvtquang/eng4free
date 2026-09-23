# Domain map

| Domain | Owns | Key collaboration |
| --- | --- | --- |
| Auth | user identity, profile, roles | Supplies actor to all protected use cases |
| Content management | batch provenance, status workflow, publishing | Publishes versioned course/exam/question content |
| Courses / lessons | course → level → unit → lesson → blocks | Lesson blocks embed public Question definitions |
| Questions | versioned content and answer contracts | Used by lessons, practice, placement and exams |
| Exams / attempts | exam session, answers, timer policy, submission/review | Calls scoring; emits progress events |
| Scoring | deterministic answer evaluation and score maps | Pure package; no persistence |
| Vocabulary | lexical entry, lists/tags, review queue | Uses FSRS adapter; emits review events |
| Pronunciation | IPA, minimal pairs, shadowing, recording request | Delegates analysis to SpeechService |
| AI writing / tutor / speaking | structured feedback, usage, caching | Receives canonical context; never owns answer keys |
| Progress / gamification | immutable `ProgressEvent`, XP, streak and projections | The single source of derived learning progress |
| Media | media metadata and signed storage URLs | Used by passages, audio, recordings and CMS |

Content status is shared by CMS and learner views: `DRAFT → REVIEW → APPROVED →
PUBLISHED → ARCHIVED`. Only `PUBLISHED` versions can appear in learner APIs.

