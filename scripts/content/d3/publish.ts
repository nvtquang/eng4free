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
 *   --from-record publish batches whose items all match the hashes recorded when they were last
 *                 approved (content/packs/d3/qa/approved.json); used after `pnpm demo:prepare`
 *                 rebuilds the database. A batch with any new or changed item stays in review.
 *
 * Every publish on a real (non-test) database rewrites that record from the PUBLISHED batches.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { and, eq, inArray, like, ne, or, sql } from "drizzle-orm";
import { contentBatches, contentItemHashes, courses, exams, lessons, placementItems, pronunciationItems, questions, topicCategories, topics } from "../../../apps/web/src/db/schema";
import { d3Batches, d3Retires } from "../../../content/packs/d3";
import type { BatchKey } from "../../../content/packs/d3/types";
import { batchId, connect, D3_COURSE_ID, isTestDatabase } from "./shared";

const ALL = Object.keys(d3Batches) as BatchKey[];
const args = process.argv.slice(2);
const TEST_DB = args.includes("--test-db");
const FROM_RECORD = args.includes("--from-record");
const requested = args.find((arg) => arg.startsWith("--batch="))?.slice(8).split(",") as BatchKey[] | undefined;
const RECORD_PATH = resolve(process.cwd(), "content/packs/d3/qa/approved.json");

/** Item hashes of each batch as it was approved and published: batch → item key → hash. */
type ApprovalRecord = { note: string; batches: Partial<Record<BatchKey, Record<string, string>>> };
const readRecord = (): ApprovalRecord => existsSync(RECORD_PATH) ? JSON.parse(readFileSync(RECORD_PATH, "utf8")) as ApprovalRecord : { note: "", batches: {} };
const sortedObject = (entries: Array<[string, string]>) => Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));

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
      if (status !== "APPROVED" && !TEST_DB && !FROM_RECORD) { console.log(`  ${key}: ${status} — approve it in the CMS after review, then publish`); return false; }
      return true;
    });
    const fromRecord = new Set<BatchKey>();
    if (FROM_RECORD) {
      const record = readRecord();
      for (const key of [...targets]) {
        if (statusOf.get(batchId(key)) === "APPROVED") continue;
        const approved = record.batches[key] ?? {};
        const current = await db.select({ itemKey: contentItemHashes.itemKey, hash: contentItemHashes.hash }).from(contentItemHashes).where(eq(contentItemHashes.batchId, batchId(key)));
        const changed = current.filter((item) => approved[item.itemKey] !== item.hash).length;
        const currentKeys = new Set(current.map((item) => item.itemKey));
        const removed = Object.keys(approved).filter((itemKey) => !currentKeys.has(itemKey)).length;
        if (current.length === 0 || changed > 0 || removed > 0) {
          console.log(`  ${key}: ${changed} new or changed and ${removed} removed item(s) since approval — review the batch, approve it in the CMS, then publish`);
          targets.splice(targets.indexOf(key), 1);
        } else fromRecord.add(key);
      }
    }
    await db.transaction(async (tx) => {
      for (const key of targets) {
        const id = batchId(key);
        await tx.update(contentBatches).set({ status: "PUBLISHED", reviewedBy: TEST_DB ? "automated test publish" : fromRecord.has(key) ? "approved earlier, unchanged since (content/packs/d3/qa/approved.json)" : "spot review (see docs/content/d3-review-sample.md)" }).where(eq(contentBatches.id, id));
        await tx.update(lessons).set({ status: "PUBLISHED" }).where(and(eq(lessons.contentBatchId, id), ne(lessons.status, "ARCHIVED")));
        if (key === "lessons" || key === "grammar") await tx.update(courses).set({ status: "PUBLISHED" }).where(eq(courses.id, D3_COURSE_ID));
        await tx.update(exams).set({ status: "PUBLISHED" }).where(and(eq(exams.contentBatchId, id), ne(exams.status, "ARCHIVED")));
        await tx.update(questions).set({ status: "PUBLISHED" }).where(and(eq(questions.contentBatchId, id), ne(questions.status, "ARCHIVED")));
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
        console.log(`  ${key}: published${fromRecord.has(key) ? " (matches the approval record)" : ""}`);
      }
    });
    if (!isTestDatabase(databaseName)) await writeApprovalRecord(db);
  } finally {
    await client.end();
  }
}

/** Records the item hashes of every PUBLISHED batch so a rebuilt database can republish exactly what was approved. */
async function writeApprovalRecord(db: ReturnType<typeof connect>["db"]) {
  const record = readRecord();
  const published = await db.select({ id: contentBatches.id }).from(contentBatches).where(and(inArray(contentBatches.id, ALL.map(batchId)), eq(contentBatches.status, "PUBLISHED")));
  const publishedIds = new Set(published.map((row) => row.id));
  for (const key of ALL) {
    if (!publishedIds.has(batchId(key))) continue;
    const items = await db.select({ itemKey: contentItemHashes.itemKey, publishedHash: contentItemHashes.publishedHash }).from(contentItemHashes).where(eq(contentItemHashes.batchId, batchId(key)));
    record.batches[key] = sortedObject(items.flatMap((item) => item.publishedHash ? [[item.itemKey, item.publishedHash] as [string, string]] : []));
  }
  record.note = "Item hashes of each D3 batch as approved and published. Written by `pnpm content:d3:publish`; read by `--from-record` (pnpm demo:prepare).";
  record.batches = Object.fromEntries(Object.entries(record.batches).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(RECORD_PATH, JSON.stringify(record, null, 2) + "\n");
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
