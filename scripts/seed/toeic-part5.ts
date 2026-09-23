import { drizzle } from "drizzle-orm/postgres-js";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { contentBatches, examParts, exams, questions } from "../../apps/web/src/db/schema";
import { TOEIC_PART_5_CONTENT_BATCH_ID, TOEIC_PART_5_EXAM_ID, TOEIC_PART_5_EXAM_SLUG, TOEIC_PART_5_PART_ID, toeicPart5Questions } from "../../apps/web/src/modules/exams/toeic-part-5";

const envFiles = [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")];
for (const envFile of envFiles) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Create apps/web/.env.local from apps/web/.env.example and set DATABASE_URL to your Neon/PostgreSQL connection string.");
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function seed() {
  await db.insert(contentBatches).values({ id: TOEIC_PART_5_CONTENT_BATCH_ID, source: "https://english4free.local/content/toeic-part-5-starter", license: "English 4 Free original content", author: "English 4 Free", reviewedBy: "English 4 Free", importedAt: new Date("2026-09-21T00:00:00.000Z"), version: "1", status: "PUBLISHED" }).onConflictDoUpdate({ target: contentBatches.id, set: { status: "PUBLISHED", reviewedBy: "English 4 Free" } });
  await db.insert(exams).values({ id: TOEIC_PART_5_EXAM_ID, slug: TOEIC_PART_5_EXAM_SLUG, title: "TOEIC Part 5 Starter", type: "TOEIC", durationSeconds: 180, status: "PUBLISHED", contentBatchId: TOEIC_PART_5_CONTENT_BATCH_ID }).onConflictDoUpdate({ target: exams.id, set: { title: "TOEIC Part 5 Starter", status: "PUBLISHED", updatedAt: new Date() } });
  await db.insert(examParts).values({ id: TOEIC_PART_5_PART_ID, examId: TOEIC_PART_5_EXAM_ID, partNumber: 5, title: "Incomplete Sentences", sortOrder: 1, instructions: "Choose the best word or phrase to complete each sentence.", durationSeconds: 180 }).onConflictDoUpdate({ target: examParts.id, set: { title: "Incomplete Sentences", instructions: "Choose the best word or phrase to complete each sentence." } });
  for (const question of toeicPart5Questions) {
    await db.insert(questions).values({ id: question.id, examPartId: TOEIC_PART_5_PART_ID, schemaVersion: question.schemaVersion, type: question.type, content: question.content, answer: question.answer, explanation: question.explanation, tags: question.tags, status: "PUBLISHED", contentBatchId: TOEIC_PART_5_CONTENT_BATCH_ID }).onConflictDoUpdate({ target: questions.id, set: { content: question.content, answer: question.answer, explanation: question.explanation, tags: question.tags, status: "PUBLISHED", updatedAt: new Date() } });
  }
}

seed()
  .then(() => console.log("Seeded TOEIC Part 5 starter exam."))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error(`Seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(() => client.end());
