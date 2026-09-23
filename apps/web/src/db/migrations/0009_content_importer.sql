CREATE TABLE "content_imports" (
  "id" uuid PRIMARY KEY NOT NULL,
  "content_batch_id" uuid NOT NULL REFERENCES "content_batches"("id") ON DELETE CASCADE,
  "file_name" varchar(512) NOT NULL,
  "file_type" varchar(16) NOT NULL,
  "content_type" varchar(128) NOT NULL,
  "byte_size" integer NOT NULL,
  "storage_key" text NOT NULL UNIQUE,
  "target_type" varchar(16) NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'EXTRACTED',
  "extraction" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "mapping" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "result" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "error" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
