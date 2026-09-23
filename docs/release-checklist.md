# Release checklist

## Before preview/production

- [ ] Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` and only the provider
  URLs/keys that are intentionally enabled.
- [ ] Run `pnpm db:migrate` against a backup-tested target database.
- [ ] Configure `ADMIN_EMAILS` with at least one controlled account.
- [ ] Configure private R2/S3 credentials, restrictive bucket CORS and signed-upload smoke test.
- [ ] Confirm AI Writing/Tutor providers return the documented Zod output schemas and have a timeout/key configured.
- [ ] Set the same `SPEECH_SERVICE_API_KEY` in web and speech environments before exposing analysis endpoints.
- [ ] Review content-batch provenance and publish only approved content.
- [ ] Run `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm --filter
  @english4free/web test:e2e`. E2E builds first and runs an isolated production
  server on port 3100, leaving local development on port 3000 untouched.

## After deploy

- [ ] Check `/api/health`, `/robots.txt`, `/sitemap.xml`, public learning routes and
  a guest TOEIC attempt.
- [ ] Confirm CSP does not block required first-party assets.
- [ ] Review error/analytics privacy configuration before turning it on.
