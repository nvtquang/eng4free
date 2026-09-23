import { and, asc, eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { vocabulary } from "@/db/schema";

export type PublishedVocabularyCard = { headword: string; partOfSpeech: string | null; cefrLevel: string | null; ipa: string | null; meaning: string | null; example: string | null; tags: string[] };

export async function listPublishedVocabulary(level: string, take = 24): Promise<PublishedVocabularyCard[] | null> {
  const db = createDatabase();
  if (!db) return null;
  const rows = await db.select({ headword: vocabulary.headword, partOfSpeech: vocabulary.partOfSpeech, cefrLevel: vocabulary.cefrLevel, ipa: vocabulary.ipa, meaning: vocabulary.meaning, example: vocabulary.example, tags: vocabulary.tags }).from(vocabulary).where(and(eq(vocabulary.status, "PUBLISHED"), eq(vocabulary.cefrLevel, level))).orderBy(asc(vocabulary.headword)).limit(take);
  return rows.map((row) => ({ ...row, tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [] }));
}
