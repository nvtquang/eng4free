-- Production readiness.
-- rate_limit_counters: fixed-window counters shared by every app instance (AI limits per
-- learner, per IP and the site-wide daily AI budget). Rows past expires_at are deleted by
-- pnpm maintenance:retention.
CREATE TABLE "rate_limit_counters" (
  "key" varchar(255) NOT NULL,
  "window_start" timestamptz NOT NULL,
  "count" integer NOT NULL DEFAULT 0,
  "expires_at" timestamptz NOT NULL,
  PRIMARY KEY ("key", "window_start")
);
CREATE INDEX "rate_limit_counters_expires_idx" ON "rate_limit_counters"("expires_at");

-- telemetry_events: first-party product events and server/browser errors. No learner id and
-- no free text from learners is stored. Rows are kept for TELEMETRY_RETENTION_DAYS.
CREATE TABLE "telemetry_events" (
  "id" uuid PRIMARY KEY,
  "kind" varchar(8) NOT NULL,
  "name" varchar(128) NOT NULL,
  "message" text,
  "path" varchar(512),
  "properties" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "telemetry_events_kind_created_idx" ON "telemetry_events"("kind", "created_at");
CREATE INDEX "telemetry_events_name_created_idx" ON "telemetry_events"("name", "created_at")
