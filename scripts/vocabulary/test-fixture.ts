/**
 * Fills a throwaway test database with a synthetic vocabulary catalogue
 * (`tsx scripts/vocabulary/test-fixture.ts`), for CI, where there is no local catalogue to copy.
 * The words are clearly fake ("fixture-word-b1-001") and carry the same attribution shape as
 * real ones, so pages, paging and the review schedule can be tested. Refused on any database
 * that is not *_e2e / *_qa / *_test.
 */
import { and, eq, isNull, ne, or } from "drizzle-orm";
import { contentBatches, vocabulary } from "../../apps/web/src/db/schema";
import { ensureVocabularyBatch, VOCABULARY_BATCH_ID, wordId } from "../../apps/web/src/modules/vocabulary/catalog";
import { EXAMPLE_SOURCE, LEVELS, wiktionarySource } from "../../apps/web/src/modules/vocabulary/catalog-rules";
import { connect, isTestDatabase } from "../content/d3/shared";

const PER_LEVEL = 120;

async function main() {
  const { client, db, databaseName } = connect();
  try {
    if (!isTestDatabase(databaseName)) throw new Error(`The synthetic vocabulary is only for test databases, not "${databaseName}"`);
    await ensureVocabularyBatch(db);
    const now = new Date();
    const rows = LEVELS.flatMap((level) => Array.from({ length: PER_LEVEL }, (_, index) => {
      const headword = `fixture-word-${level.toLowerCase()}-${String(index + 1).padStart(3, "0")}`;
      return {
        id: wordId(headword, "noun", level), headword, partOfSpeech: "noun", cefrLevel: level, ipa: "/ˈfɪkstʃə wɜːd/", meaning: `từ kiểm thử ${level} số ${index + 1}`,
        example: `The test suite reads ${headword} from the database.`, tags: ["d3", level.toLowerCase(), "noun", "test-fixture"],
        attribution: { ipaUs: null, sense: "synthetic word for automated tests", sources: { level: { name: "English 4 Free test fixture", url: "https://github.com/nvtquang/eng4free", license: "English 4 Free original content" }, meaning: wiktionarySource("fixture", "meaning"), ipa: wiktionarySource("fixture", "ipa"), example: EXAMPLE_SOURCE } },
        senseGroups: [], senseChoice: [], reviewedBy: "test fixture", reviewedAt: now, status: "PUBLISHED" as const, contentBatchId: VOCABULARY_BATCH_ID, createdAt: now, updatedAt: now
      };
    }));
    await db.transaction(async (tx) => {
      for (let start = 0; start < rows.length; start += 500) await tx.insert(vocabulary).values(rows.slice(start, start + 500)).onConflictDoNothing();
      await tx.update(contentBatches).set({ status: "PUBLISHED" }).where(eq(contentBatches.id, VOCABULARY_BATCH_ID));
      await tx.update(vocabulary).set({ status: "ARCHIVED" }).where(and(or(ne(vocabulary.contentBatchId, VOCABULARY_BATCH_ID), isNull(vocabulary.contentBatchId)), ne(vocabulary.status, "ARCHIVED")));
    });
    console.log(`${databaseName}: ${rows.length} synthetic test words published.`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
