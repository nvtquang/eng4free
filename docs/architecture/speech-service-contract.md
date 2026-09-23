# Speech Service contract

The web application owns learning content, user consent and media metadata. It does
not run speech models. It uploads a recording through `MediaService`, receives a
`recordingMediaId`, then calls an implementation of `SpeechService`.

```text
Browser microphone → MediaService.createUpload/finalizeUpload → recordingMediaId
  → SpeechService.transcribe / align / analyzePronunciation → structured feedback
```

`SpeechService` has three operations: `transcribe`, `align` and
`analyzePronunciation`. Alignment returns word timestamps; pronunciation analysis
returns phoneme-level status plus an optional score. The score is nullable so a
provider cannot pretend to have reliable phoneme scoring when it only transcribes.

The future `services/speech` FastAPI implementation may use faster-whisper,
WhisperX, MFA or SpeechBrain behind this interface. LLMs may explain the resulting
feedback but must not decide whether a phoneme was pronounced correctly.
