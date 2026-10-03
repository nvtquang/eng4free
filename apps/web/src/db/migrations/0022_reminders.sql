-- Study reminders by email. Opt-in per account: a row exists once the learner has made a choice.
-- "hour" is the local hour in Vietnam (Asia/Ho_Chi_Minh) at which the reminder is sent.
CREATE TABLE "reminder_preferences" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "enabled" boolean NOT NULL DEFAULT false,
  "hour" integer NOT NULL DEFAULT 19,
  "last_sent_at" timestamptz,
  "updated_at" timestamptz NOT NULL DEFAULT now()
)
