import words from "../../../../../content/cefr/imports/words-cefr.v1.json";
import type { CefrLevel } from "@/modules/courses/cefr-path";

type ImportedWord = { headword: string; partOfSpeech: string | null; cefrLevel: CefrLevel; tags: string[]; provenance: { source: string; license: string } };
const entries = words.entries as ImportedWord[];
export type VocabularyCard = Pick<ImportedWord, "headword" | "partOfSpeech" | "cefrLevel">;
export function getVocabulary(level?: string, take = 24): VocabularyCard[] { const valid = level && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(level.toUpperCase()) ? level.toUpperCase() : undefined; return entries.filter((entry) => !valid || entry.cefrLevel === valid).slice(0, take).map(({ headword, partOfSpeech, cefrLevel }) => ({ headword, partOfSpeech, cefrLevel })); }
export const vocabularyProvenance = entries[0]?.provenance;
