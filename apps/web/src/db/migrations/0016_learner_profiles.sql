CREATE TABLE "learner_profiles" (
  "id" uuid PRIMARY KEY,
  "owner_key" varchar(64) NOT NULL,
  "user_id" uuid REFERENCES "users"("id"),
  "guest_id" uuid,
  "goal" varchar(16) NOT NULL,
  "cefr_level" varchar(2) NOT NULL,
  "level_source" varchar(16) NOT NULL DEFAULT 'SELF',
  "minutes_per_day" integer NOT NULL,
  "placement_score" integer,
  "placement_total" integer,
  "completed_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "learner_profiles_owner_key_idx" ON "learner_profiles"("owner_key")
