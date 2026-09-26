# Demo media: sources and licences

Everything in this folder is served as-is from `/demo-media/…` and is committed, so every
machine plays byte-identical files.

## `audio/` — listening recordings

- **Scripts:** original English 4 Free content. They come from the exam, dictation and
  lesson rows in the database (`exam_parts.metadata.playbackText`,
  `questions.content.playbackText` and `lesson_blocks.content.playbackText`).
- **Voices:** Microsoft Edge neural text-to-speech, generated through the open-source
  [`edge-tts`](https://github.com/rany2/edge-tts) client. The voices are en-US, en-GB,
  en-AU and en-CA, so TOEIC recordings mix accents the way the real test does.
- **Speakers:** each speaker turn (`Woman:`, `Man:`, `Receptionist:` …) is synthesised
  with its own voice. The turns are joined with short silences, with no re-encoding.
- **Manifest:** `audio/manifest.json` lists, for every file:
  - the script hash
  - the voices used
  - the duration
  - the content row it was made for
  - when it was generated
- **Regenerating:** run `pnpm content:generate-audio`. It skips files that are already
  current and remakes only scripts that changed. `--check` lists missing audio,
  `--force` rebuilds everything and `--prune` deletes unused files.
- **Licence note:** these files are for the local demo only. Before a public launch,
  confirm the terms of the TTS service, or regenerate the files with a licensed engine
  (Azure Speech, Gemini TTS) or with recorded voice actors. Only the manifest and the
  files would change, because content refers to audio through the script hash.

When no generated file exists for a script (for example, a question just written in
the CMS), the app falls back to browser `speechSynthesis`.

## `images/` — question pictures

| File | Used by | Source / licence |
| --- | --- | --- |
| `toeic-part1-library-shelf.svg` | TOEIC Part 1 demo question | Original English 4 Free illustration, released under CC0 1.0 |
