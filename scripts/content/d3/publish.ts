/**
 * Publishes reviewed D3 batches (`pnpm content:d3:publish -- --batch=toeic`).
 *
 * A batch is published only after a reviewer moved it to APPROVED in the CMS
 * (/admin → content batches). Publishing releases the batch's DRAFT items (archived items
 * stay archived), records the published hash of every item so later edits show up in the
 * review sheet, and archives the older demo content that the batch replaces.
 *
 *   --batch=a,b   batches to publish (default: every APPROVED D3 batch)
 *   --test-db     skip the approval check; only allowed on *_e2e / *_qa / *_test databases
 */
import { and, eq, inArray, like, ne, or, sql } from "drizzle-orm";
import { contentBatches, contentItemHashes, courses, exams, lessons, placementItems, pronunciationItems, questions, topicCategories, topics, vocabulary } from "../../../apps/web/src/db/schema";
import { d3Batches, d3Retires } from "../../../content/packs/d3";
import type { BatchKey } from "../../../content/packs/d3/types";
import { batchId, connect, D3_COURSE_ID, isTestDatabase } from "./shared";

const ALL = Object.keys(d3Batches) as BatchKey[];
const args = process.argv.slice(2);
const TEST_DB = args.includes("--test-db");
const requested = args.find((arg) => arg.startsWith("--batch="))?.slice(8).split(",") as BatchKey[] | undefined;

async function main() {
  const { client, db, databaseName } = connect();
  if (TEST_DB && !isTestDatabase(databaseName)) throw new Error(`--test-db publishes without review and is refused on "${databaseName}"`);
  try {
    const rows = await db.select({ id: contentBatches.id, status: contentBatches.status }).from(contentBatches).where(inArray(contentBatches.id, ALL.map(batchId)));
    const statusOf = new Map(rows.map((row) => [row.id, row.status]));
    const targets = (requested ?? ALL).filter((key) => {
      const status = statusOf.get(batchId(key));
      if (!status) { console.log(`  ${key}: not imported yet`); return false; }
      if (status === "PUBLISHED") { console.log(`  ${key}: already published`); return false; }
      if (status !== "APPROVED" && !TEST_DB) { console.log(`  ${key}: ${status} — approve it in the CMS after review, then publish`); return false; }
      return true;
    });
    await db.transaction(async (tx) => {
      for (const key of targets) {
        const id = batchId(key);
        await tx.update(contentBatches).set({ status: "PUBLISHED", reviewedBy: TEST_DB ? "automated test publish" : "spot review (see docs/content/d3-review-sample.md)" }).where(eq(contentBatches.id, id));
        await tx.update(lessons).set({ status: "PUBLISHED" }).where(and(eq(lessons.contentBatchId, id), ne(lessons.status, "ARCHIVED")));
        if (key === "lessons" || key === "grammar") await tx.update(courses).set({ status: "PUBLISHED" }).where(eq(courses.id, D3_COURSE_ID));
        await tx.update(exams).set({ status: "PUBLISHED" }).where(and(eq(exams.contentBatchId, id), ne(exams.status, "ARCHIVED")));
        await tx.update(questions).set({ status: "PUBLISHED" }).where(and(eq(questions.contentBatchId, id), ne(questions.status, "ARCHIVED")));
        await tx.update(vocabulary).set({ status: "PUBLISHED" }).where(and(eq(vocabulary.contentBatchId, id), ne(vocabulary.status, "ARCHIVED")));
        await tx.update(topics).set({ status: "PUBLISHED" }).where(and(eq(topics.contentBatchId, id), ne(topics.status, "ARCHIVED")));
        await tx.update(topicCategories).set({ status: "PUBLISHED" }).where(and(eq(topicCategories.contentBatchId, id), ne(topicCategories.status, "ARCHIVED")));
        await tx.update(pronunciationItems).set({ status: "PUBLISHED" }).where(and(eq(pronunciationItems.contentBatchId, id), ne(pronunciationItems.status, "ARCHIVED")));
        await tx.update(placementItems).set({ status: "PUBLISHED" }).where(and(eq(placementItems.contentBatchId, id), ne(placementItems.status, "ARCHIVED")));
        await tx.update(contentItemHashes).set({ publishedHash: sql`${contentItemHashes.hash}` }).where(eq(contentItemHashes.batchId, id));

        const retire = d3Retires[key];
        if (retire.examSlugs?.length) await tx.update(exams).set({ status: "ARCHIVED" }).where(inArray(exams.slug, retire.examSlugs));
        if (retire.lessonBatchVersions?.length) {
          const old = await tx.select({ id: contentBatches.id }).from(contentBatches).where(inArray(contentBatches.version, retire.lessonBatchVersions));
          if (old.length) await tx.update(lessons).set({ status: "ARCHIVED" }).where(and(inArray(lessons.contentBatchId, old.map((row) => row.id)), eq(lessons.skill, "GRAMMAR")));
        }
        if (retire.courseSlugPrefixes?.length) await tx.update(courses).set({ status: "ARCHIVED" }).where(or(...retire.courseSlugPrefixes.map((prefix) => like(courses.slug, `${prefix}%`))));
        if (retire.vocabularyOutsideBatch) await tx.update(vocabulary).set({ status: "ARCHIVED" }).where(ne(vocabulary.contentBatchId, id));
        console.log(`  ${key}: published`);
      }
    });
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
