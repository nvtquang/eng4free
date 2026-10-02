# Release checklist

The full deployment guide (images, hosting, domain, releases, backups, scheduled jobs and
monitoring) is [operations/deploy.md](operations/deploy.md).

## Before preview/production

- [ ] Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` and only the provider
  URLs/keys that are intentionally enabled.
- [ ] Run `pnpm db:migrate` against a backup-tested target database.
- [ ] Configure `ADMIN_EMAILS` with at least one controlled account.
- [ ] Set `APP_URL` and `AUTH_URL` to the public HTTPS origin: canonical URLs, hreflang,
  the sitemap, share images and sign-in links are built from them.
- [ ] For email sign-in, set `AUTH_RESEND_KEY` and `AUTH_EMAIL_FROM` (a verified Resend sender) and
  send yourself a link. Never set `E4F_MAIL_OUTBOX` or `E4F_DEMO_SIGN_IN` in a deployed app.
- [ ] Schedule `pnpm maintenance:retention -- --apply` daily (cron or a scheduled job), with the
  retention variables matching what the privacy page should promise. Run it once without
  `--apply` first to see what it would delete.
- [ ] Configure private R2/S3 credentials, restrictive bucket CORS and signed-upload smoke test.
- [ ] Confirm AI Writing/Tutor providers return the documented Zod output schemas and have a timeout/key configured.
- [ ] Set the same `SPEECH_SERVICE_API_KEY` in web and speech environments before exposing analysis endpoints.
- [ ] Review content-batch provenance and publish only approved content.
- [ ] Run `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm --filter
  @english4free/web test:e2e`. E2E builds first and runs an isolated production
  server on port 3100, leaving local development on port 3000 untouched.

- [ ] Set `AI_DAILY_BUDGET` and `AI_TRANSCRIPTION_DAILY_BUDGET` below the Gemini account quota and
  `TRUSTED_PROXY_HOPS` to the number of proxies in front of the app.
- [ ] Add the GitHub `production` environment secrets: `PRODUCTION_DATABASE_URL`, `DEPLOY_HOOK_URL`,
  the `BACKUP_S3_*` values and the `S3_*` values used by the retention workflow.

## After deploy

- [ ] Check `/api/health`, `/robots.txt`, `/sitemap.xml`, public learning routes and
  a guest TOEIC attempt.
- [ ] Paste a lesson URL into the Facebook Sharing Debugger and a Zalo chat to check the preview,
  and submit `/sitemap.xml` in Google Search Console.
- [ ] Open a missing URL and check the translated 404 page.
- [ ] Point an uptime monitor at `/api/health`, then open `/admin/operations` and check that the
  AI budget and the error list load.
- [ ] Run the Database backup workflow once by hand and restore the dump into a scratch database.
- [ ] Confirm CSP does not block required first-party assets.
- [ ] Review error/analytics privacy configuration before turning it on.
