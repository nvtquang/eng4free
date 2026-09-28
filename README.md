# English 4 Free

Local-first English learning MVP built with Next.js App Router, TypeScript,
PostgreSQL, Drizzle ORM and shared domain modules.

## Local setup

Requirements: Node.js 20+, pnpm 9 and PostgreSQL 15+.

1. Copy `apps/web/.env.example` to `apps/web/.env.local`.
2. Set `DATABASE_URL` to a local database whose name starts with
   `english4free`, for example:

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/english4free"
   AUTH_SECRET="replace-with-a-long-random-secret"
   ```

3. Install and prepare deterministic local data:

   ```bash
   pnpm install
   pnpm qa:prepare
   ```

4. Start the web app:

   ```bash
   pnpm --filter @english4free/web dev
   ```

Open `http://localhost:3000`. Google OAuth is optional; guest learning works
without Google credentials. AI, cloud speech and S3/R2 are not required.

## Listening audio

Listening recordings are pre-generated and committed under
`apps/web/public/demo-media/audio/`. After changing or adding a listening script, run:

```bash
pip install piper-tts lameenc  # one-time setup (voices download on first run)
pnpm content:generate-audio    # generates only missing or changed files
pnpm content:check-audio       # fails if any listening script has no audio
```

If a script has no generated file yet, the app uses browser speech for it. Sources
and licences are listed in `apps/web/public/demo-media/README.md`.

## Content pack D3

The main demo content lives in `content/packs/d3`. It includes CEFR and grammar lessons, 763 sourced vocabulary words, a 200-question TOEIC mock, the TOEIC part practice sets, IELTS tests and IELTS Writing and Speaking tasks.

```bash
pnpm content:d3:check           # quality gate only
pnpm content:d3:import          # import as DRAFT; batches go to REVIEW
pnpm content:d3:review-sample   # write the 15% spot-check sheet
pnpm content:d3:publish -- --batch=toeic   # after the batch is APPROVED in the CMS
```

Sources, licences and the review workflow are described in `docs/implementation-status.md` (section D3).

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

`pnpm test:e2e` uses its own database (`english4free_e2e` by default, or
`E2E_DATABASE_URL`), so it never resets your local demo data.

`pnpm qa:prepare` is destructive: it only accepts a PostgreSQL host of
`localhost`, `127.0.0.1` or `::1` and a database named `english4free` or beginning
with `english4free_`/`english4free-`. It resets the `public` schema, migrates it
and installs deterministic fixtures.

See [implementation status](docs/implementation-status.md) and the
[manual microphone check](docs/qa/manual-microphone.md).
# eng4free
