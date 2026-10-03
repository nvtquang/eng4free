# Deploying English 4 Free

This guide takes the app from a laptop to a public site. It covers the pieces every host needs:
images, database, object storage, domain, releases, backups, scheduled jobs and monitoring.
Credentials never go into Git; they live in the host's environment settings and in the GitHub
`production` environment.

## What runs in production

| Piece | What it is | Notes |
|---|---|---|
| Web | `Dockerfile` target `runner`: the Next.js standalone server on port 3000 | Stateless when S3/R2 is configured, so it can run as several instances. |
| Tools | `Dockerfile` target `tools`: the repo with all dependencies | Runs `pnpm db:migrate`, the content import and `pnpm maintenance:retention`. |
| PostgreSQL 16+ | Learner data, content, rate-limit counters, telemetry | Use a managed database with point-in-time recovery (Neon, Supabase, RDS) or the `db` service in `infra/docker-compose.app.yml`. |
| Object storage | Cloudflare R2 or any S3-compatible bucket | Speaking recordings and CMS media. Keep the bucket private. |
| Gemini | AI feedback, tutor and transcription | Set the daily budgets below the account quota. |
| Resend | Email sign-in links | Optional; Google sign-in works without it. |

## Choosing a host

- **One server with Docker** (a VPS from any provider): run `infra/docker-compose.app.yml`
  behind Caddy or Nginx for TLS. This is the cheapest option and has no time limits on
  requests. Add a backup of the `db-data` volume, or point `DATABASE_URL` at a managed
  database instead of the `db` service.
- **A container platform** (Render, Railway, Fly.io, Coolify, Dokploy): deploy the
  `ghcr.io/<owner>/english4free-web` image that the Release workflow pushes, with a managed
  PostgreSQL. Most of these platforms provide a deploy hook URL; store it as the
  `DEPLOY_HOOK_URL` secret.
- **Vercel**: the app runs there too, because recordings go to R2 and limits live in PostgreSQL.
  Two limits apply:
  - AI feedback can take up to 30 seconds, so a plan whose functions are allowed to run that long is needed;
  - CMS spreadsheet imports keep the uploaded file on the local disk between *upload* and *apply*
    (`.local-imports`), which serverless functions do not share. Run imports from a Docker
    deployment or locally against the production database.

## Environment

Start from `apps/web/.env.example`. In production, set at least:

- `DATABASE_URL`, `AUTH_SECRET` (`openssl rand -base64 32`).
- `APP_URL` and `AUTH_URL`: the public `https://` origin. Canonical URLs, the sitemap, share
  images and sign-in links are built from them.
- `ADMIN_EMAILS`.
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. Recordings then go to
  the bucket, and the bucket origin is added to the Content-Security-Policy at run time.
- `GEMINI_API_KEY`, `AI_DAILY_BUDGET`, `AI_TRANSCRIPTION_DAILY_BUDGET`. On the Gemini free tier
  (about 20 feedback and 25 transcription requests a day), use for example `18` and `22`.
- `TRUSTED_PROXY_HOPS`: the number of proxies that append to `X-Forwarded-For` in front of the
  app (usually `1`). With `0`, per-IP AI limits are off. Never expose the app directly with a
  value above 0, because clients could then forge their address.
- Sign-in: `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` and/or `AUTH_RESEND_KEY`/`AUTH_EMAIL_FROM`.

Never set `E4F_DEMO_SIGN_IN`, `E4F_MAIL_OUTBOX`, `E4F_E2E_ADMIN_TOKEN` or `E4F_USE_IN_MEMORY` in
production; the first two refuse to work outside a local database anyway.

## Domain

1. Point the domain at the host (A/AAAA records for a VPS, or the CNAME the platform gives).
2. Set `APP_URL` and `AUTH_URL` to `https://your-domain`.
3. Google: add `https://your-domain/api/auth/callback/google` to the OAuth client.
4. Resend: verify the sending domain (SPF and DKIM records) and set `AUTH_EMAIL_FROM` on it.
5. After the first deploy, submit `https://your-domain/sitemap.xml` in Google Search Console.

## First deploy

```bash
# 1. Database schema
docker run --rm -e DATABASE_URL ghcr.io/<owner>/english4free-tools:latest pnpm db:migrate
# 2. Learning content: import pack D3 and publish the batches that match the approval record
docker run --rm -e DATABASE_URL ghcr.io/<owner>/english4free-tools:latest \
  sh -c "pnpm content:d3:import && pnpm content:d3:publish -- --from-record"
# 3. Start the web image, then check https://your-domain/api/health
```

Do not run `pnpm db:seed`, `pnpm demo:prepare` or `pnpm seed:demo-account` in production: they
add test fixtures and the demo learner.

## Releases

`.github/workflows/release.yml` runs after CI passes on `main`:

1. builds the `tools` and `web` images and pushes them to GitHub Container Registry, tagged with
   the commit SHA and `latest`;
2. runs `pnpm db:migrate` against `PRODUCTION_DATABASE_URL`. The migrator takes a PostgreSQL
   advisory lock, so parallel runs are safe;
3. calls `DEPLOY_HOOK_URL` so the host pulls the new web image.

Both secrets are optional. Without them the workflow only publishes images.

**Migrations run before the new code is live**, so each migration must work with the version
that is still running. Add columns and tables first and remove them in a later release.
**Rollback**: redeploy the previous `web:<sha>` image. Migrations are forward-only, so the
compatibility rule above is what makes this safe.

## Backups

- Prefer a managed database with point-in-time recovery.
- `.github/workflows/backup.yml` also writes a daily `pg_dump` to a bucket
  (`BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ACCESS_KEY_ID`,
  `BACKUP_S3_SECRET_ACCESS_KEY`). Use a different bucket from the media bucket, and add a
  lifecycle rule that deletes old dumps.
- **Restore** into a new database and test it at least once a quarter:

  ```bash
  pg_restore --clean --if-exists --no-owner -d "$NEW_DATABASE_URL" english4free-YYYYMMDDTHHMMSSZ.dump
  ```

## Scheduled jobs

`.github/workflows/maintenance.yml` runs `pnpm maintenance:retention -- --apply` every day with the
production secrets. It deletes:

- old recordings;
- inactive and empty guest learners;
- expired rate-limit windows;
- old telemetry.

On a single server, a cron entry that runs the tools image does the same.

`.github/workflows/reminders.yml` runs `pnpm maintenance:reminders` at the start of every hour.

- It sends study reminder emails to accounts that turned them on in their profile, at the hour each learner chose.
- It needs `AUTH_SECRET` (it signs the unsubscribe links), `AUTH_RESEND_KEY`, the `AUTH_EMAIL_FROM` variable and the `APP_URL` variable.
- Each email carries a one-click `List-Unsubscribe` header.
- Without Resend configured, the profile hides the reminder settings.

## Monitoring

- **Uptime**: point an external monitor (Better Stack, UptimeRobot) at `/api/health`. It returns
  503 when the database is unreachable.
- **Logs**: errors are written to stdout as one JSON object per line (`level`, `name`, `message`,
  `path`, `digest`), ready for the host's log search.
- **`/admin/operations`** (admins only) shows:
  - the learner funnel: guest sessions, then finished setup, a first lesson, and a return on another day;
  - today's AI calls and budget;
  - the most frequent errors of the last week, from the server and from browsers;
  - product events.
