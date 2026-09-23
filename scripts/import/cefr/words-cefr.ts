import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const sourcePath = resolve(process.cwd(), "CEFR/Words-CEFR-Dataset/datasets/word_list_cefr.csv");
const outputPath = resolve(process.cwd(), "content/cefr/imports/words-cefr.v1.json");

if (!existsSync(sourcePath)) throw new Error(`Dataset not found: ${sourcePath}`);

type ImportedVocabulary = { schemaVersion: 1; headword: string; partOfSpeech: string; cefrLevel: string; tags: string[]; provenance: { source: string; license: string; author: string; importedAt: string; version: string } };
const rows = readFileSync(sourcePath, "utf8").split(/\r?\n/).slice(1).filter(Boolean);
const importedAt = new Date().toISOString();
const entries: ImportedVocabulary[] = [];
for (const row of rows) {
  const [headword, partOfSpeech, cefrLevel] = row.split(";").map((value) => value.trim());
  if (!headword || !partOfSpeech || !cefrLevel || !levels.has(cefrLevel)) continue;
  entries.push({ schemaVersion: 1, headword, partOfSpeech, cefrLevel, tags: ["cefr", `cefr-${cefrLevel.toLowerCase()}`], provenance: { source: "https://github.com/Maximax67/Words-CEFR-Dataset", license: "MIT; retain upstream CEFR-J/Google Ngrams provenance", author: "Belikov Maxim", importedAt, version: "Words-CEFR-Dataset:word_list_cefr" } });
}

if (!process.argv.includes("--write")) {
  console.log(`Validated ${entries.length} CEFR vocabulary records. Re-run with --write to emit normalized content.`);
} else {
  mkdirSync(resolve(process.cwd(), "content/cefr/imports"), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`, "utf8");
  console.log(`Wrote ${entries.length} normalized CEFR vocabulary records to ${outputPath}.`);
}
