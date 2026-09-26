import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, notInArray } from "drizzle-orm";
import postgres from "postgres";
import { buildQuestionFromAuthoring } from "@english4free/content-schemas";
import { ieltsPracticeExams } from "../../content/seed/ielts-practice-test";
import { contentBatches, examParts, exams, passages, questions } from "../../apps/web/src/db/schema";

const batchId = "91000000-0000-4000-8000-000000000999";
for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);

// Build every question first so an authoring mistake fails before anything is written.
const built = ieltsPracticeExams.map((exam) => ({ exam, parts: exam.parts.map((part) => ({ part, questions: part.questions.map((question) => {
  const result = buildQuestionFromAuthoring(question.authoring);
  if (!result.success) throw new Error(`${exam.slug} / ${question.id}: ${result.error}`);
  return { ...question, stored: result.data };
}) })) }));

async function seed() {
  await db.transaction(async (tx) => {
    await tx.insert(contentBatches).values({ id: batchId, source: "https://english4free.local/content/ielts-practice-test-v1", license: "English 4 Free original content", author: "English 4 Free", reviewedBy: "English 4 Free", importedAt: new Date("2026-09-26T00:00:00.000Z"), version: "1", status: "PUBLISHED" }).onConflictDoUpdate({ target: contentBatches.id, set: { status: "PUBLISHED" } });
    for (const { exam, parts } of built) {
      await tx.insert(exams).values({ id: exam.id, slug: exam.slug, title: exam.title, type: "IELTS", mode: exam.mode, durationSeconds: exam.durationSeconds, metadata: { originalDemo: true }, status: "PUBLISHED", contentBatchId: batchId }).onConflictDoUpdate({ target: exams.id, set: { title: exam.title, mode: exam.mode, durationSeconds: exam.durationSeconds, status: "PUBLISHED", updatedAt: new Date() } });
      for (const [partIndex, { part, questions: partQuestions }] of parts.entries()) {
        await tx.insert(examParts).values({ id: part.id, examId: exam.id, partNumber: part.partNumber, title: part.title, sortOrder: partIndex + 1, instructions: part.instructions, skill: part.skill, metadata: part.metadata }).onConflictDoUpdate({ target: examParts.id, set: { title: part.title, instructions: part.instructions, skill: part.skill, metadata: part.metadata } });
        if (part.passage) await tx.insert(passages).values({ id: part.passage.id, examPartId: part.id, title: part.passage.title, content: part.passage.content, sortOrder: 1 }).onConflictDoUpdate({ target: passages.id, set: { title: part.passage.title, content: part.passage.content } });
        for (const [index, question] of partQuestions.entries()) {
          const values = { passageId: part.passage?.id ?? null, type: question.stored.type, content: question.stored.content, answer: question.stored.answer, explanation: question.explanation, status: "PUBLISHED" as const, updatedAt: new Date() };
          // createdAt orders questions inside a part.
          await tx.insert(questions).values({ id: question.id, examPartId: part.id, schemaVersion: 1, tags: ["ielts", part.skill.toLowerCase(), question.stored.type.toLowerCase()], contentBatchId: batchId, createdAt: new Date(Date.UTC(2026, 8, 26, 0, 0, index)), ...values }).onConflictDoUpdate({ target: questions.id, set: values });
        }
        await tx.delete(questions).where(and(eq(questions.examPartId, part.id), notInArray(questions.id, partQuestions.map((question) => question.id))));
      }
    }
  });
}

seed().then(() => console.log(`Seeded ${ieltsPracticeExams.length} IELTS practice exams covering every question type.`)).catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => client.end());
