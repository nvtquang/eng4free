CREATE TABLE "progress_events" ("id" uuid PRIMARY KEY, "user_id" uuid REFERENCES "users"("id"), "guest_id" uuid, "type" varchar(64) NOT NULL, "skill" varchar(16), "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb, "occurred_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "progress_events_actor_occurred_idx" ON "progress_events"("user_id", "guest_id", "occurred_at");
