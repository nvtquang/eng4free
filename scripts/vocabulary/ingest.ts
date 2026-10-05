/**
 * Adds new words to the catalogue as unreviewed DRAFT rows (`pnpm vocab:ingest`), from the
 * candidates that `pnpm vocab:candidates` wrote to .cache/vocabulary/candidates.json.
 *
 *   --target=A1:500,A2:800,...   words wanted per level (catalogue words that are not archived count)
 *   --editor-meanings            also take candidates without a Wiktionary Vietnamese translation;
 *                                they arrive with an empty meaning for an editor to write
 *   --dry-run                    only print what would be added
 *
 * Within a level, candidates with a Wiktionary translation come first, each group by frequency.
 * A headword already in the catalogue (at any level or status) or excluded by a reviewer is skipped.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { vocabulary, vocabularyExclusions } from "../../apps/web/src/db/schema";
import { addDraftEntries, VOCABULARY_BATCH_ID, type DraftEntry } from "../../apps/web/src/modules/vocabulary/catalog";
import { LEVELS, type SenseGroup, type Source } from "../../apps/web/src/modules/vocabulary/catalog-rules";
import { connect } from "../content/d3/shared";

type Candidate = { headword: string; pos: string; level: string; zipf: number; ipa: string; ipaUs: string | null; ipaSource: Source | null; senseGroups: SenseGroup[]; gloss: string; levelSource: Source };
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const EDITOR_MEANINGS = args.includes("--editor-meanings");
const target = Object.fromEntries((args.find((arg) => arg.startsWith("--target="))?.slice(9) ?? "").split(",").filter(Boolean).map((pair) => { const [level, count] = pair.split(":"); return [level!, Number(count)]; }));

async function main() {
  if (!Object.keys(target).length || Object.entries(target).some(([level, count]) => !(LEVELS as readonly string[]).includes(level) || !Number.isInteger(count))) throw new Error("Pass --target=A1:500,A2:800,... (levels A1–C2)");
  const candidates = JSON.parse(readFileSync(resolve(process.cwd(), ".cache/vocabulary/candidates.json"), "utf8")) as Candidate[];
  const { client, db, databaseName } = connect();
  try {
    const catalogue = await db.select({ headword: vocabulary.headword, level: vocabulary.cefrLevel, status: vocabulary.status }).from(vocabulary).where(eq(vocabulary.contentBatchId, VOCABULARY_BATCH_ID));
    const excluded = new Set((await db.select({ headword: vocabularyExclusions.headword, pos: vocabularyExclusions.partOfSpeech }).from(vocabularyExclusions)).map((row) => `${row.headword}|${row.pos}`));
    const used = new Set(catalogue.map((row) => row.headword));
    const additions: DraftEntry[] = [];
    for (const [level, wanted] of Object.entries(target)) {
      let have = catalogue.filter((row) => row.level === level && row.status !== "ARCHIVED").length;
      const pool = candidates.filter((candidate) => candidate.level === level).sort((a, b) => Number(b.senseGroups.length > 0) - Number(a.senseGroups.length > 0) || b.zipf - a.zipf);
      let fromWiktionary = 0, forEditors = 0;
      for (const candidate of pool) {
        if (have >= wanted) break;
        if (used.has(candidate.headword) || excluded.has(`${candidate.headword}|${candidate.pos}`)) continue;
        if (!candidate.senseGroups.length && !EDITOR_MEANINGS) continue;
        additions.push({ headword: candidate.headword, partOfSpeech: candidate.pos, cefrLevel: level, ipa: candidate.ipa, ipaUs: candidate.ipaUs, ipaSource: candidate.ipaSource, senseGroups: candidate.senseGroups, gloss: candidate.gloss, levelSource: candidate.levelSource });
        used.add(candidate.headword);
        have += 1;
        if (candidate.senseGroups.length) fromWiktionary += 1; else forEditors += 1;
      }
      console.log(`${level}: +${fromWiktionary} with a Wiktionary meaning, +${forEditors} for editors to write → ${have}/${wanted}`);
    }
    if (DRY_RUN) { console.log(`Dry run: ${additions.length} words would be added to ${databaseName}.`); return; }
    const added = await addDraftEntries(db, additions, "vocab:ingest (Words-CEFR, Octanove, Wiktionary)");
    console.log(`Added ${added} DRAFT words to ${databaseName}; the vocabulary batch is in REVIEW.`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
