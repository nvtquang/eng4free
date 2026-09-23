# Manual microphone QA

The automated Playwright suite uses Chromium's fake microphone stream, so it is
deterministic and never depends on physical hardware.

For a real-device check:

1. Run the app on `http://localhost:3000` and open `/skills/speaking`.
2. Select **Start recording** and allow microphone access.
3. Speak for several seconds, stop, play the local preview and save it.
4. Reload the page and play the recording from History.
5. Repeat once with microphone permission denied and verify that a clear error is
   displayed without creating a session.

Local recordings are private to their authenticated user or guest cookie and are
written to `.local-media/recordings`, which is ignored by Git.
