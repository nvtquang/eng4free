# Data flows

## Content pipeline

```text
author / dataset / AI draft
  → normalized JSON (schemaVersion + provenance)
  → Zod validation
  → import batch (DRAFT)
  → human review
  → APPROVED → PUBLISHED
  → learner-safe projection
```

The private answer payload is stored separately from learner-safe question
content. A reviewer can inspect both; a learner only receives the safe projection.

## Pronunciation pipeline

```text
browser microphone → signed upload / stream → SpeechService.transcribe
→ align → phoneme analysis → deterministic pronunciation score
→ stored evidence + structured feedback → optional LLM explanation
```

An LLM may explain an evidence-backed result but does not decide phoneme
correctness.

## Progress pipeline

```text
lesson/exam/vocabulary/speaking/writing use case
→ append ProgressEvent
→ progress projector
→ XP, streak, skill/course/CEFR projections
→ dashboard
```

No UI component directly increments XP or streak.

