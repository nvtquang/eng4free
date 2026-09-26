import { existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

/**
 * Removes content that E2E runs published into a local database (courses,
 * lessons, exams and imports whose content batch source is an E2E/import token),
 * together with attempts made on those exams. All other learner data is kept.
 */
for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const target = new URL(process.env.DATABASE_URL); const database = target.pathname.replace(/^\//u, ""); const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
if (!localHosts.has(target.hostname) || !/^english4free(?:[_-].+)?$/u.test(database)) throw new Error(`Refusing to clean non-local or unexpected database: ${target.hostname}/${database}`);

const testSourcePattern = "^https://english4free\\.local/(e2e|e2e-exam|import)/[0-9]+$";
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function clean() {
  const summary = await sql.begin(async (tx) => {
    const batches = await tx<{ id: string }[]>`SELECT id FROM content_batches WHERE source ~ ${testSourcePattern}`;
    const batchIds = batches.map((batch) => batch.id);
    if (batchIds.length === 0) return null;
    const exams = await tx<{ id: string }[]>`SELECT id FROM exams WHERE content_batch_id = ANY(${batchIds}) OR slug ~ '^(e2e-exam|csv-import)-[0-9]+$'`;
    const examIds = exams.map((exam) => exam.id);
    const questions = await tx<{ id: string }[]>`SELECT q.id FROM questions q LEFT JOIN exam_parts p ON p.id = q.exam_part_id WHERE q.content_batch_id = ANY(${batchIds}) OR p.exam_id = ANY(${examIds})`;
    const questionIds = questions.map((question) => question.id);
    const attempts = await tx`DELETE FROM attempts WHERE exam_id = ANY(${examIds})`;
    await tx`DELETE FROM attempt_answers WHERE question_id = ANY(${questionIds})`;
    await tx`DELETE FROM questions WHERE id = ANY(${questionIds})`;
    const deletedExams = await tx`DELETE FROM exams WHERE id = ANY(${examIds})`;
    const lessons = await tx`DELETE FROM lessons WHERE content_batch_id = ANY(${batchIds}) OR slug ~ '^e2e-lesson-[0-9]+$'`;
    const courses = await tx`DELETE FROM courses WHERE content_batch_id = ANY(${batchIds}) OR slug ~ '^e2e-course-[0-9]+$'`;
    await tx`DELETE FROM vocabulary WHERE content_batch_id = ANY(${batchIds})`;
    const deletedBatches = await tx`DELETE FROM content_batches WHERE id = ANY(${batchIds})`;
    return { batches: deletedBatches.count, courses: courses.count, lessons: lessons.count, exams: deletedExams.count, attempts: attempts.count };
  });
  console.log(summary ? `Removed E2E content from ${database}: ${JSON.stringify(summary)}` : `No E2E content found in ${database}.`);
}

clean().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => sql.end());
