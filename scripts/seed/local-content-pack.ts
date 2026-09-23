import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { LOCAL_CONTENT_BATCH_ID, localDemoLessons, localDemoVocabulary } from "../../content/seed/local-content-pack";
import { contentBatches, courseLevels, courseUnits, courses, lessonBlocks, lessons, vocabulary } from "../../apps/web/src/db/schema";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing. Set it in apps/web/.env.local before running this seed.");
const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);

async function seed() {
  await db.transaction(async (tx) => {
    await tx.insert(contentBatches).values({ id: LOCAL_CONTENT_BATCH_ID, source: "https://english4free.local/content/local-demo-pack-v1", license: "English 4 Free original content", author: "English 4 Free", reviewedBy: "English 4 Free", importedAt: new Date("2026-09-21T00:00:00.000Z"), version: "1", status: "PUBLISHED" }).onConflictDoUpdate({ target: contentBatches.id, set: { status: "PUBLISHED", reviewedBy: "English 4 Free", version: "1" } });
    for (const lesson of localDemoLessons) {
      await tx.insert(courses).values({ id: lesson.courseId, slug: lesson.courseSlug, title: lesson.courseTitle, description: "Original local English 4 Free demonstration content.", status: "PUBLISHED", contentBatchId: LOCAL_CONTENT_BATCH_ID }).onConflictDoUpdate({ target: courses.id, set: { title: lesson.courseTitle, status: "PUBLISHED", contentBatchId: LOCAL_CONTENT_BATCH_ID, updatedAt: new Date() } });
      await tx.insert(courseLevels).values({ id: lesson.levelId, courseId: lesson.courseId, cefrLevel: lesson.level, sortOrder: 1, title: lesson.level }).onConflictDoUpdate({ target: courseLevels.id, set: { title: lesson.level } });
      await tx.insert(courseUnits).values({ id: lesson.unitId, courseLevelId: lesson.levelId, slug: "demo-unit", title: lesson.unitTitle, sortOrder: 1 }).onConflictDoUpdate({ target: courseUnits.id, set: { title: lesson.unitTitle } });
      await tx.insert(lessons).values({ id: lesson.lessonId, unitId: lesson.unitId, slug: lesson.slug, title: lesson.title, skill: lesson.skill, estimatedMinutes: lesson.estimatedMinutes, status: "PUBLISHED", contentBatchId: LOCAL_CONTENT_BATCH_ID }).onConflictDoUpdate({ target: lessons.id, set: { title: lesson.title, skill: lesson.skill, estimatedMinutes: lesson.estimatedMinutes, status: "PUBLISHED", contentBatchId: LOCAL_CONTENT_BATCH_ID, updatedAt: new Date() } });
      for (const block of lesson.blocks) await tx.insert(lessonBlocks).values({ ...block, lessonId: lesson.lessonId, schemaVersion: 1 }).onConflictDoUpdate({ target: lessonBlocks.id, set: { type: block.type, sortOrder: block.sortOrder, content: block.content } });
    }
    for (const [headword, partOfSpeech, cefrLevel, ipa, meaning, example, tags] of localDemoVocabulary) {
      await tx.insert(vocabulary).values({ id: randomUUID(), headword, partOfSpeech, cefrLevel, ipa, meaning, example, tags: [...tags], status: "PUBLISHED", contentBatchId: LOCAL_CONTENT_BATCH_ID }).onConflictDoUpdate({ target: [vocabulary.headword, vocabulary.partOfSpeech, vocabulary.cefrLevel], set: { ipa, meaning, example, tags: [...tags], status: "PUBLISHED", contentBatchId: LOCAL_CONTENT_BATCH_ID, updatedAt: new Date() } });
    }
  });
}

seed().then(() => console.log("Seeded local A1–C2 lesson, grammar, vocabulary, reading and listening content pack.")).catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Seed failed"); process.exitCode = 1; }).finally(() => client.end());
