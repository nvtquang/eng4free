# Operations baseline

Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS production URL. The app serves
`robots.txt` and `sitemap.xml`; private `/admin` and `/api` paths are excluded.

Security headers are centralized in `apps/web/next.config.ts`. Provider keys stay
server-only. Before enabling third-party analytics, review its privacy settings and
obtain the required consent. `captureEvent`/`captureError` are intentionally local
adapters until PostHog and Sentry credentials are provisioned.
