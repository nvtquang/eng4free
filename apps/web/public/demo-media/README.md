# Demo media: sources and licences

Everything in this folder is served as-is from `/demo-media/…` and is committed, so every
machine plays and shows byte-identical files.

## `audio/` — listening recordings

- **Scripts:** original English 4 Free content: exam parts, listening passages, questions
  heard on their own (TOEIC Part 1–2), dictation and lesson listening blocks.
- **Engine:** [Piper](https://github.com/OHF-Voice/piper1-gpl), a local neural TTS.
  The engine's software licence (GPL-3.0) covers the program, not the audio it produces.
- **Voices and their licences:**

  | Voice model | Training data | Licence |
  | --- | --- | --- |
  | `en_GB-vctk-medium` (speakers p226, p236, p241, p257, p264, p277, p278, p360) | VCTK corpus, University of Edinburgh CSTR | CC BY 4.0 |
  | `en_US-libritts_r-medium` (speakers 15, 105, 150, 180, 330, 345, 450, 600) | LibriTTS-R | CC BY 4.0 |
  | `en_GB-cori-high` (narrator) | public-domain LibriVox recordings | public domain |

  Attribution: *Voices trained on the VCTK corpus (Yamagishi et al., University of
  Edinburgh) and LibriTTS-R (Koizumi et al.), both CC BY 4.0.*
- **Voice casting:** every speaker turn (`Woman:`, `Man:`, `Receptionist:` …) gets its
  own voice. Speakers were chosen from a pitch probe of every model speaker, so female and
  male voices are matched to the script.
- **Manifest:** `audio/manifest.json` lists, for every file, the script hash, the voices,
  the duration, the content row it was made for and when it was generated.
- **QA:** `pnpm content:qa-audio` checks the speaking rate and compares a Gemini
  transcription of each file with its script. It flags a word error rate above 10%.
- **Regenerating:** run `pnpm content:generate-audio` (needs `pip install piper-tts
  lameenc`). It skips files that are already current. `--check` lists missing audio,
  `--force` rebuilds everything and `--prune` deletes unused files.

When no generated file exists for a script (for example, a question just written in
the CMS), the app falls back to browser `speechSynthesis`.

## `images/` — pictures and figures

- **`images/toeic/*.jpg`:** CC0 1.0 photographs found through
  [Openverse](https://openverse.org). The photographer, source page and licence of each
  photo are recorded in `images/credits.json` and shown under the picture. They were
  checked by eye and chosen for TOEIC Part 1 statements. One candidate with a watermark
  was rejected.
- **`images/toeic/graphics/*.svg`:** English 4 Free original tables and graphics (CC0 1.0).
  They are drawn from the same data as the questions (`pnpm content:d3:graphics`).
- **`images/ielts/*.svg`:** English 4 Free original Writing Task 1 figures (CC0 1.0).
  They use illustrative practice data, not real statistics.
- **`toeic-part1-library-shelf.svg`:** English 4 Free original illustration (CC0 1.0).
