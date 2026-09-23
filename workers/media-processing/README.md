# Media-processing worker

This worker claims `PENDING` records from `media_processing_jobs` atomically,
increments `attempts`, then processes one job type at a time. It may normalize
audio, generate waveform data or request SpeechService analysis. It must use a
signed/object-storage key from the `media` table; it must never scan local uploads
or accept arbitrary URLs.

Retry at most three times. Store concise non-sensitive failure information in
`error`; do not log recording contents or credentials.
