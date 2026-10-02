# Manual microphone QA

The automated Playwright suite uses Chromium's fake microphone stream, so it is
deterministic and never depends on physical hardware. Check a real microphone by hand
before every demo, on the machine and browser the demo will use.

## Before you start

- Open the app as `http://localhost:3000`. Browsers only allow the microphone on HTTPS
  or on `localhost`. A LAN address such as `http://192.168.1.20:3000` silently blocks
  recording, so do not present from another device over the network.
- On Windows, check **Settings → Privacy & security → Microphone**: *Microphone access*
  and *Let desktop apps access your microphone* must be on, and the right input device
  must be selected under **Settings → System → Sound → Input**.
- Close other apps that may hold the microphone (Zoom, Teams, OBS).

## Check (about 3 minutes)

1. Open `/skills/speaking`, choose any topic and press **Nhấn để nói** (*Push to talk*).
   Allow microphone access when the browser asks.
2. Check that the clock starts counting (`0:01`, `0:02`, …). Speak for about 10 seconds,
   press **Dừng ghi âm** (*Stop recording*), play the preview and check that your voice
   is clear and loud enough.
3. Press **Lưu bản ghi** (*Save recording*). With `GEMINI_API_KEY` set, a transcript and
   feedback appear after about 10 seconds. Check that the transcript matches what you said.
   Each check uses one transcription and one feedback request from the daily free quota.
4. Reload the page and play the recording from the history.
5. Open `/ielts/speaking`, press **Chuẩn bị (1:00)**, then **Tôi đã sẵn sàng**, and
   start recording. The clock shows `0:05 / 2:00`, and recording stops by itself at 2:00.
6. Deny access once. In Chrome, click the icon left of the address bar → *Site settings*
   → *Microphone: Block*, then reload and press **Nhấn để nói**. A clear error must
   appear and no session is created. Set the permission back to *Allow* (or *Ask*)
   afterwards.

Local recordings are private to their authenticated user or guest cookie and are
written to `.local-media/recordings`, which is ignored by Git.
