/**
 * Publishes the reviewed DRAFT words of the catalogue (`pnpm vocab:publish`). The vocabulary
 * batch must be APPROVED in the CMS first; words that are unreviewed or break a rule stay DRAFT.
 *   --test-db   skip the approval check (only on *_e2e / *_qa / *_test databases)
 */
import { publishReviewed } from "../../apps/web/src/modules/vocabulary/catalog";
import { connect, isTestDatabase } from "../content/d3/shared";

async function main() {
  const testDb = process.argv.includes("--test-db");
  const { client, db, databaseName } = connect();
  try {
    if (testDb && !isTestDatabase(databaseName)) throw new Error(`--test-db publishes without approval and is refused on "${databaseName}"`);
    const result = await publishReviewed(db, testDb ? "automated test publish" : "vocab:publish (batch approved in the CMS)", { skipApproval: testDb });
    if (result.refused) { console.log(`Vocabulary batch is ${result.batchStatus}: approve it in the CMS after review, then publish.`); process.exitCode = 1; return; }
    console.log(`${databaseName}: published ${result.published} words; ${result.waiting} drafts are not reviewed or break a rule (batch: ${result.batchStatus}).`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
