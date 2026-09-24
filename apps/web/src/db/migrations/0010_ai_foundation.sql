CREATE TABLE "ai_response_cache" (
  "id" uuid PRIMARY KEY NOT NULL,
  "cache_key" varchar(64) NOT NULL UNIQUE,
  "operation" varchar(64) NOT NULL,
  "provider" varchar(64) NOT NULL,
  "model" varchar(128) NOT NULL,
  "response" jsonb NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "ai_response_cache_expiry_idx" ON "ai_response_cache" ("expires_at");

CREATE TABLE "ai_usage_logs" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "guest_id" uuid,
  "operation" varchar(64) NOT NULL,
  "provider" varchar(64) NOT NULL,
  "model" varchar(128),
  "input_hash" varchar(64) NOT NULL,
  "cache_hit" boolean NOT NULL DEFAULT false,
  "status" varchar(32) NOT NULL,
  "latency_ms" integer,
  "prompt_tokens" integer,
  "response_tokens" integer,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "ai_usage_logs_actor_created_idx" ON "ai_usage_logs" ("user_id", "guest_id", "created_at");
CREATE INDEX "ai_usage_logs_operation_created_idx" ON "ai_usage_logs" ("operation", "created_at");
