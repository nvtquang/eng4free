# Production integrations

Milestone 13 connects existing modular boundaries to real infrastructure. Never
put a credential in Git, browser code, content JSON or screenshots.

## PostgreSQL and migrations

Set a least-privilege production `DATABASE_URL`, then run migrations once per
release:

```powershell
pnpm db:migrate
```

`GET /api/health` performs a lightweight database check. It returns `200` only
when PostgreSQL is configured and reachable; it never exposes a connection URL
or provider credential.

## Google OAuth

Set `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. Create
a **Web application** OAuth client and register the exact callback:

```text
https://YOUR_DOMAIN/api/auth/callback/google
```

For local development use `http://localhost:3000/api/auth/callback/google`. The
Auth.js Drizzle adapter explicitly maps to this project's plural `users`,
`accounts`, `sessions` and `verification_tokens` tables.

## Cloudflare R2 / S3-compatible media

Keep the bucket private. The web app creates short-lived signed `PUT` and `GET`
URLs only after admin authorization. Create an R2 S3 API token scoped to this
bucket, then set:

```env
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=english-4-free-media
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
MEDIA_SIGNED_URL_TTL_SECONDS=900
```

For an S3 provider, use its endpoint, region and access keys instead. Set
`S3_FORCE_PATH_STYLE=true` only if that provider requires path-style requests.

Configure the bucket CORS policy with only your actual web origins:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://YOUR_DOMAIN"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Upload flow: create a `PENDING` media record through CMS, `POST` to
`/api/admin/media/{mediaId}/upload`, upload bytes to the returned URL using the
returned `requiredContentType`, then `POST` to
`/api/admin/media/{mediaId}/complete`. Completion verifies size/content type
with `HeadObject`, marks the media `READY`, and returns a time-limited playback
URL. The browser must not receive R2/S3 credentials.

## AI providers

Writing and Tutor call provider URLs server-side, enforce a timeout, send
`Authorization: Bearer <key>` when a key is configured, then validate returned
JSON with the product Zod schema.

```env
AI_WRITING_PROVIDER_URL=https://provider.example/v1/writing/evaluate
AI_WRITING_PROVIDER_API_KEY=...
AI_TUTOR_PROVIDER_URL=https://provider.example/v1/tutor/explain
AI_TUTOR_PROVIDER_API_KEY=...
AI_PROVIDER_TIMEOUT_MS=12000
```

An omitted URL retains the safe fallback: Writing returns deterministic
diagnostics only and Tutor returns the official explanation. Provider endpoints
must be server-to-server adapters that return schemas from
`packages/content-schemas`; never expose an LLM key to the client.

## Speech service

Set the same random `SPEECH_SERVICE_API_KEY` in web and speech environments.
Analysis endpoints receive it in `x-api-key`; `/health` remains available to
container orchestration.

```env
SPEECH_SERVICE_URL=https://speech.YOUR_DOMAIN
SPEECH_SERVICE_API_KEY=...
SPEECH_SERVICE_TIMEOUT_MS=12000
```

The shipped FastAPI service correctly returns `503` for analysis until a real
transcription/alignment adapter is configured. It does not invent pronunciation
feedback.

## Smoke test order

1. Deploy variables and run migrations.
2. Verify `/api/health` reports database `reachable: true`.
3. Sign in with a controlled Google account.
4. Create draft media as admin, obtain an upload URL, upload using the exact
   returned content type, then complete it.
5. Enable AI only after its provider contract test passes.
6. Verify speech health; keep learner analysis disabled until a real model is
   installed.
