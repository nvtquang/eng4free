/**
 * Applies a batch of editor changes to the catalogue (`pnpm vocab:apply -- --in=changes.json`),
 * through the same rules and history as the CMS. The file is a transport file, not a source:
 *
 *   { "actor": "Claude (AI-drafted, reviewed)",
 *     "changes": [ { "key": "travel|verb", "senseChoice": [0], "example": "…", "markReviewed": true },
 *                  { "key": "angle|noun", "exclude": "Wiktionary only gives a wrong sense" } ] }
 *
 * A change is { key: "headword|pos" (or id), …CatalogPatch } or { key, exclude: reason }.
 * Changes that would break the rules are reported and skipped; the rest are saved.
 *   --dry-run   check every change without saving
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { and, eq, ne } from "drizzle-orm";
import { vocabulary } from "../../apps/web/src/db/schema";
import { applyPatch, excludeCatalogEntry, getCatalogEntry, updateCatalogEntry, VOCABULARY_BATCH_ID, type CatalogPatch } from "../../apps/web/src/modules/vocabulary/catalog";
import { connect } from "../content/d3/shared";

type Change = CatalogPatch & { key: string; exclude?: string };
const args = process.argv.slice(2);
const file = args.find((arg) => arg.startsWith("--in="))?.slice(5);
const DRY_RUN = args.includes("--dry-run");

async function main() {
  if (!file) throw new Error("Usage: pnpm vocab:apply -- --in=changes.json [--dry-run]");
  const input = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8")) as { actor?: string; changes: Change[] };
  if (!input.actor?.trim()) throw new Error("The file needs an \"actor\": who made these changes");
  const { client, db, databaseName } = connect();
  try {
    const rows = await db.select({ id: vocabulary.id, headword: vocabulary.headword, pos: vocabulary.partOfSpeech }).from(vocabulary).where(and(eq(vocabulary.contentBatchId, VOCABULARY_BATCH_ID), ne(vocabulary.status, "ARCHIVED")));
    const byKey = new Map(rows.map((row) => [`${row.headword}|${row.pos}`, row.id]));
    const ids = new Set(rows.map((row) => row.id));
    let saved = 0, excluded = 0;
    const problems: string[] = [];
    for (const change of input.changes) {
      const id = byKey.get(change.key) ?? (ids.has(change.key) ? change.key : undefined);
      if (!id) { problems.push(`${change.key}: not in the catalogue (or archived)`); continue; }
      const { key: _key, exclude, ...patch } = change;
      if (exclude !== undefined) {
        if (!DRY_RUN) await excludeCatalogEntry(db, id, exclude, input.actor);
        excluded += 1;
        continue;
      }
      if (DRY_RUN) {
        const found = await getCatalogEntry(db, id);
        const result = applyPatch(found!.entry, patch, input.actor);
        if (!result.ok) problems.push(`${change.key}: ${result.issues.map((issue) => issue.problem).join("; ")}`); else saved += 1;
        continue;
      }
      const result = await updateCatalogEntry(db, id, patch, input.actor);
      if (!result?.ok) problems.push(`${change.key}: ${result ? result.issues.map((issue) => issue.problem).join("; ") : "not found"}`); else saved += 1;
    }
    console.log(`${DRY_RUN ? "Dry run on" : "Applied to"} ${databaseName}: ${saved} saved, ${excluded} excluded, ${problems.length} rejected.`);
    for (const problem of problems) console.log(`  ✗ ${problem}`);
    if (problems.length) process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
