import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const envFiles = [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")];
for (const envFile of envFiles) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Create apps/web/.env.local from apps/web/.env.example and set DATABASE_URL.");
}

const client = postgres(connectionString, { prepare: false });

async function migrate() {
  await client.unsafe("CREATE TABLE IF NOT EXISTS _e4f_migrations (id varchar(128) PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const migrationDirectory = resolve(process.cwd(), "apps/web/src/db/migrations");
  const migrationFiles = ["0000_phase1_toeic.sql", "0001_phase2_learning_core.sql", "0002_phase1b_auth.sql", "0003_phase4_ielts_ai.sql", "0004_phase6_progress.sql", "0005_phase8_media_jobs.sql", "0006_p1_lesson_completion.sql", "0007_p3_p5_foundation.sql", "0008_vocabulary_level_identity.sql", "0009_content_importer.sql", "0010_ai_foundation.sql", "0011_ai_feedback_history.sql", "0012_drop_legacy_writing_feedback_unique.sql", "0013_vocabulary_review_owner.sql", "0014_structured_answers.sql"];
  for (const filename of migrationFiles) {
    const id = filename.replace(/\.sql$/, "");
    const applied = await client<{ id: string }[]>`SELECT id FROM _e4f_migrations WHERE id = ${id}`;
    if (applied.length > 0) { console.log(`Migration ${id} has already been applied.`); continue; }
    const statements = readFileSync(resolve(migrationDirectory, filename), "utf8").split(";").map((statement) => statement.trim()).filter(Boolean);
    await client.begin(async (transaction) => {
      for (const statement of statements) await transaction.unsafe(statement);
      await transaction`INSERT INTO _e4f_migrations (id) VALUES (${id})`;
    });
    console.log(`Applied migration ${id}.`);
  }
}

migrate()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error(`Migration failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(() => client.end());
