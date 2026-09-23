import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { contentBatches, courseLevels, courseUnits, courses, lessonBlocks, lessons } from "../../apps/web/src/db/schema";

const ids = { batch: "1f7a0471-b3f5-4691-a5e5-38e82df4e4b4", course: "3db5bfb2-5bb0-41ba-bb8d-e3063a1ad4e8", level: "5b8db10b-a9db-4d11-93c4-226a53fefbab", unit: "8bb10b3e-3f18-4c83-8f66-aa1dc52ca1ee", lesson: "a2a87e74-5ddb-4a11-8764-9b620031a5d9", intro: "78bcce79-031c-4f26-9b6b-6c8bcbe7597f", language: "e8350c39-40b1-4c8b-81e1-793b93df8bbb", practice: "d80c4dc3-8049-44d2-bfa1-78ec2c0d0427" } as const;
const questions = [
  { id: "f40d445d-9f99-4cac-8c10-bf3e1652b1a9", prompt: "Which sentence is a natural way to introduce yourself?", options: [{ id: "a", text: "I am Mai. Nice to meet you." }, { id: "b", text: "I Mai nice." }, { id: "c", text: "My is Mai." }], correctOptionId: "a", explanation: "Use “I am + name” (or “I'm + name”) when you introduce yourself." },
  { id: "5fc5822f-465c-4a3a-bdb0-7e7a3f054b7b", prompt: "Complete the sentence: “___ name is Nam.”", options: [{ id: "a", text: "My" }, { id: "b", text: "I" }, { id: "c", text: "Me" }], correctOptionId: "a", explanation: "“My” is a possessive adjective. We say “My name is …”." },
  { id: "baa47f29-3019-4c0c-a525-7b7470a98a4b", prompt: "What can you say after someone says “Nice to meet you”?", options: [{ id: "a", text: "Nice to meet you, too." }, { id: "b", text: "I am fine." }, { id: "c", text: "Good night." }], correctOptionId: "a", explanation: "The natural reply is “Nice to meet you, too.”" }
];

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing. Set it in apps/web/.env.local before running this seed.");
const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);

async function seed() {
  await db.transaction(async (tx) => {
    await tx.insert(contentBatches).values({ id: ids.batch, source: "https://english4free.local/content/a1-introduce-yourself", license: "English 4 Free original content", author: "English 4 Free", reviewedBy: "English 4 Free", importedAt: new Date("2026-09-21T00:00:00.000Z"), version: "1", status: "PUBLISHED" }).onConflictDoUpdate({ target: contentBatches.id, set: { status: "PUBLISHED", reviewedBy: "English 4 Free" } });
    await tx.insert(courses).values({ id: ids.course, slug: "a1-foundations", title: "A1 Foundations", description: "A beginner course with original English 4 Free content.", status: "PUBLISHED", contentBatchId: ids.batch }).onConflictDoUpdate({ target: courses.id, set: { status: "PUBLISHED", updatedAt: new Date() } });
    await tx.insert(courseLevels).values({ id: ids.level, courseId: ids.course, cefrLevel: "A1", sortOrder: 1, title: "A1" }).onConflictDoUpdate({ target: courseLevels.id, set: { title: "A1" } });
    await tx.insert(courseUnits).values({ id: ids.unit, courseLevelId: ids.level, slug: "getting-started", title: "Getting started", sortOrder: 1 }).onConflictDoUpdate({ target: courseUnits.id, set: { title: "Getting started" } });
    await tx.insert(lessons).values({ id: ids.lesson, unitId: ids.unit, slug: "introduce-yourself", title: "Introduce yourself", skill: "SPEAKING", estimatedMinutes: 10, status: "PUBLISHED", contentBatchId: ids.batch }).onConflictDoUpdate({ target: lessons.id, set: { title: "Introduce yourself", status: "PUBLISHED", updatedAt: new Date() } });
    const blocks = [
      { id: ids.intro, lessonId: ids.lesson, type: "RICH_TEXT" as const, sortOrder: 1, schemaVersion: 1, content: { heading: "Say hello", body: "When you meet someone, you can say:\n\nHello. I’m Mai. Nice to meet you.\n\nUse “I’m” before your name. It is the short form of “I am”." } },
      { id: ids.language, lessonId: ids.lesson, type: "RICH_TEXT" as const, sortOrder: 2, schemaVersion: 1, content: { heading: "Useful language", body: "• Hello. / Hi.\n• I’m [your name].\n• My name is [your name].\n• Nice to meet you.\n• Nice to meet you, too." } },
      { id: ids.practice, lessonId: ids.lesson, type: "QUESTION_SET" as const, sortOrder: 3, schemaVersion: 1, content: { instruction: "Choose the best answer. Your result is checked securely when you finish.", questions } }
    ];
    for (const block of blocks) await tx.insert(lessonBlocks).values(block).onConflictDoUpdate({ target: lessonBlocks.id, set: { content: block.content, sortOrder: block.sortOrder } });
  });
}
seed().then(() => console.log("Seeded the published A1 ‘Introduce yourself’ lesson.")).catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Seed failed"); process.exitCode = 1; }).finally(() => client.end());
