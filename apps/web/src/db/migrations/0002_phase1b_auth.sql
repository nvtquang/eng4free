CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar(255), "email" varchar(255) NOT NULL UNIQUE, "email_verified" timestamptz, "image" text);
CREATE TABLE "accounts" ("user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "type" varchar(255) NOT NULL, "provider" varchar(255) NOT NULL, "provider_account_id" varchar(255) NOT NULL, "refresh_token" text, "access_token" text, "expires_at" integer, "token_type" varchar(255), "scope" varchar(255), "id_token" text, "session_state" varchar(255), PRIMARY KEY("provider", "provider_account_id"));
CREATE TABLE "sessions" ("session_token" varchar(255) PRIMARY KEY, "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "expires" timestamptz NOT NULL);
CREATE TABLE "verification_tokens" ("identifier" varchar(255) NOT NULL, "token" varchar(255) NOT NULL, "expires" timestamptz NOT NULL, PRIMARY KEY("identifier", "token"));
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
