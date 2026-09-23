# Speech service

This is an HTTP boundary, not a bundled speech model. Run it with
`uv run uvicorn app.main:app --port 8001` or Docker. Health works immediately;
analysis endpoints intentionally return `503 SPEECH_PROVIDER_UNAVAILABLE` until a
provider adapter is selected and configured.

The service accepts internal `recordingMediaId` values, never learner-supplied URLs.
The future provider resolves that ID through the media service before it transcribes.

Set the same `SPEECH_SERVICE_API_KEY` in this service and in `apps/web/.env.local`
before exposing the service outside localhost. The web app sends it as `x-api-key`.
`/health` remains unauthenticated for container orchestration; analysis endpoints are
protected whenever the key is set.
