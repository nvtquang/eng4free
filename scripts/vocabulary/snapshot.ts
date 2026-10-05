/**
 * Moves the vocabulary catalogue between databases. PostgreSQL stays its only home: a snapshot
 * is a transport file (kept under .cache/, never committed), for example to fill the E2E
 * database, to carry the catalogue through `pnpm demo:prepare`, or to load a new production database.
 *
 *   pnpm vocab:snapshot export [--out=file]   catalogue words, their history, exclusions and the batch row
 *   pnpm vocab:snapshot import --in=file      upserts by id: learners' review schedules are kept
 *
 * Import also archives vocabulary outside the catalogue batch (older demo words that seeds
 * recreate). It refuses non-local databases unless --allow-remote is given.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { and, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { contentBatches, vocabulary, vocabularyExclusions, vocabularyReviews, vocabularyRevisions } from "../../apps/web/src/db/schema";
import { ensureVocabularyBatch, VOCABULARY_BATCH_ID } from "../../apps/web/src/modules/vocabulary/catalog";
import { connect } from "../content/d3/shared";

type Snapshot = { format: "e4f-vocabulary-1"; exportedAt: string; database: string; batchStatus: string; words: Record<string, unknown>[]; revisions: Record<string, unknown>[]; exclusions: Record<string, unknown>[] };
const args = process.argv.slice(2);
const option = (name: string) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const DATES = new Set(["createdAt", "updatedAt", "reviewedAt", "changedAt", "decidedAt"]);
const revive = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, DATES.has(key) && typeof value === "string" ? new Date(value) : value]));
const chunks = <T>(items: T[], size = 500) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));

export async function exportSnapshot(out?: string) {
  const { client, db, databaseName } = connect();
  try {
    const [batch] = await db.select({ status: contentBatches.status }).from(contentBatches).where(eq(contentBatches.id, VOCABULARY_BATCH_ID));
    const words = await db.select().from(vocabulary).where(eq(vocabulary.contentBatchId, VOCABULARY_BATCH_ID));
    const ids = words.map((word) => word.id);
    const revisions = (await Promise.all(chunks(ids).map((chunk) => db.select().from(vocabularyRevisions).where(inArray(vocabularyRevisions.vocabularyId, chunk))))).flat();
    const exclusions = await db.select().from(vocabularyExclusions);
    const snapshot: Snapshot = { format: "e4f-vocabulary-1", exportedAt: new Date().toISOString(), database: databaseName, batchStatus: batch?.status ?? "DRAFT", words, revisions, exclusions };
    const file = resolve(process.cwd(), out ?? `.cache/vocabulary/snapshot-${databaseName}-${new Date().toISOString().replace(/[:.]/gu, "-")}.json`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(snapshot));
    console.log(`Exported ${words.length} words, ${revisions.length} revisions and ${exclusions.length} exclusions from ${databaseName} to ${file}`);
    return { file, words: words.length };
  } finally {
    await client.end();
  }
}

export async function importSnapshot(file: string, options: { allowRemote?: boolean } = {}) {
  const snapshot = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8")) as Snapshot;
  if (snapshot.format !== "e4f-vocabulary-1") throw new Error(`${file} is not a vocabulary snapshot`);
  const { client, db, databaseName } = connect();
  const host = new URL(process.env.DATABASE_URL!).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(host) && !options.allowRemote) throw new Error(`Refusing to import into ${host}/${databaseName} without --allow-remote`);
  try {
    await ensureVocabularyBatch(db);
    await db.transaction(async (tx) => {
      await tx.update(contentBatches).set({ status: snapshot.batchStatus as "DRAFT" }).where(eq(contentBatches.id, VOCABULARY_BATCH_ID));
      // Seeds may recreate an older demo word under another id with the same headword, part of speech
      // and level. The catalogue row wins; the seed's copy is removed unless a learner reviews it.
      const snapshotIds = new Set(snapshot.words.map((word) => word.id as string));
      const snapshotKeys = new Set(snapshot.words.map((word) => `${word.headword}|${word.partOfSpeech}|${word.cefrLevel}`));
      const clashes = (await tx.select({ id: vocabulary.id, headword: vocabulary.headword, partOfSpeech: vocabulary.partOfSpeech, cefrLevel: vocabulary.cefrLevel }).from(vocabulary))
        .filter((row) => !snapshotIds.has(row.id) && snapshotKeys.has(`${row.headword}|${row.partOfSpeech}|${row.cefrLevel}`));
      if (clashes.length) {
        const reviewed = await tx.select({ id: vocabularyReviews.vocabularyId }).from(vocabularyReviews).where(inArray(vocabularyReviews.vocabularyId, clashes.map((row) => row.id))).limit(1);
        if (reviewed.length) throw new Error(`${clashes.length} existing words clash with the snapshot and learners review some of them; resolve them by hand first`);
        await tx.delete(vocabulary).where(inArray(vocabulary.id, clashes.map((row) => row.id)));
        console.log(`Replaced ${clashes.length} seeded copies of catalogue words.`);
      }
      for (const chunk of chunks(snapshot.words.map(revive))) {
        await tx.insert(vocabulary).values(chunk as (typeof vocabulary.$inferInsert)[]).onConflictDoUpdate({
          target: vocabulary.id,
          set: Object.fromEntries(["headword", "partOfSpeech", "cefrLevel", "ipa", "meaning", "example", "tags", "attribution", "senseGroups", "senseChoice", "reviewedBy", "reviewedAt", "status", "contentBatchId", "updatedAt"].map((field) => [field, sql.raw(`excluded."${(vocabulary as unknown as Record<string, { name: string }>)[field]!.name}"`)]))
        });
      }
      for (const chunk of chunks(snapshot.revisions.map(revive))) await tx.insert(vocabularyRevisions).values(chunk as (typeof vocabularyRevisions.$inferInsert)[]).onConflictDoNothing();
      for (const chunk of chunks(snapshot.exclusions.map(revive))) await tx.insert(vocabularyExclusions).values(chunk as (typeof vocabularyExclusions.$inferInsert)[]).onConflictDoNothing();
      // Older demo words outside the catalogue must not show up next to it.
      await tx.update(vocabulary).set({ status: "ARCHIVED" }).where(and(or(ne(vocabulary.contentBatchId, VOCABULARY_BATCH_ID), isNull(vocabulary.contentBatchId)), ne(vocabulary.status, "ARCHIVED")));
    });
    console.log(`Imported ${snapshot.words.length} words (${snapshot.database}, ${snapshot.exportedAt}) into ${databaseName}.`);
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.replace(/\\/gu, "/").endsWith("scripts/vocabulary/snapshot.ts")) {
  const command = args[0];
  const run = command === "export" ? exportSnapshot(option("out")) : command === "import" && option("in") ? importSnapshot(option("in")!, { allowRemote: args.includes("--allow-remote") }) : Promise.reject(new Error("Usage: pnpm vocab:snapshot export [--out=file] | import --in=file [--allow-remote]"));
  run.catch((error: unknown) => { console.error(error instanceof Error ? `${error.message.slice(0, 300)}${error.cause ? `\nCause: ${String(error.cause)}` : ""}` : error); process.exitCode = 1; });
}
