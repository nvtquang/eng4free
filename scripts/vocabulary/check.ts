/**
 * Checks the catalogue against the rules (`pnpm vocab:check`) and lists words for review.
 *
 *   (no options)          counts per level and status; fails if a published or reviewed word breaks a rule
 *   --list=unreviewed     one line per unreviewed draft: key, level, meaning, sense groups, example
 *   --list=failing        the same for every word that breaks a rule
 *   --level=B1            limit the listing to one level
 */
import { checkCatalog } from "../../apps/web/src/modules/vocabulary/catalog";
import { LEVELS } from "../../apps/web/src/modules/vocabulary/catalog-rules";
import { connect } from "../content/d3/shared";

const args = process.argv.slice(2);
const list = args.find((arg) => arg.startsWith("--list="))?.slice(7);
const level = args.find((arg) => arg.startsWith("--level="))?.slice(8);

async function main() {
  const { client, db, databaseName } = connect();
  try {
    const results = await checkCatalog(db);
    if (list) {
      const rows = results.filter(({ row, issues }) => (!level || row.cefrLevel === level) && (list === "failing" ? issues.length > 0 : row.status === "DRAFT" && !row.reviewedAt));
      for (const { row } of rows) {
        const groups = row.senseGroups.length > 1 ? row.senseGroups.map((group, index) => `${index}:${group.sense.slice(0, 40)}=${group.words.join("/")}`).join(" ‖ ") : row.senseGroups.length ? "(one group)" : `(no Wiktionary meaning) sense: ${row.attribution.sense ?? ""}`;
        console.log(`${row.headword}|${row.partOfSpeech} [${row.cefrLevel}] → ${row.meaning ?? "—"} :: ${groups} :: ${row.example ?? "(no example)"}`);
      }
      console.error(`${rows.length} words listed.`);
      return;
    }
    const total = results.length;
    console.log(`Vocabulary catalogue in ${databaseName}: ${total} words that are not archived`);
    for (const value of LEVELS) {
      const atLevel = results.filter(({ row }) => row.cefrLevel === value);
      const published = atLevel.filter(({ row }) => row.status === "PUBLISHED").length;
      const reviewed = atLevel.filter(({ row }) => row.status === "DRAFT" && row.reviewedAt).length;
      const waiting = atLevel.filter(({ row }) => row.status === "DRAFT" && !row.reviewedAt).length;
      console.log(`  ${value}: ${atLevel.length} (published ${published}, reviewed drafts ${reviewed}, unreviewed drafts ${waiting})`);
    }
    const blocking = results.filter(({ row, issues }) => issues.length && (row.status === "PUBLISHED" || row.reviewedAt));
    const unfinished = results.filter(({ row, issues }) => issues.length && row.status === "DRAFT" && !row.reviewedAt).length;
    if (unfinished) console.log(`${unfinished} unreviewed drafts still break a rule (missing meaning or example); they cannot be published yet.`);
    for (const { issues } of blocking.slice(0, 80)) for (const issue of issues) console.log(`  ✗ ${issue.item}: ${issue.problem}`);
    console.log(blocking.length ? `Rules: ${blocking.length} published or reviewed words fail` : "Rules: passed");
    if (blocking.length) process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
