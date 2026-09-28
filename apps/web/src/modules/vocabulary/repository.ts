import { and, asc, count, eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { vocabulary } from "@/db/schema";

type Source = { name: string; url: string; license: string };
export type VocabularyAttribution = { ipaUs?: string | null; sense?: string; sources?: Partial<Record<"level" | "meaning" | "ipa" | "example", Source>> };
export type PublishedVocabularyCard = { id: string; headword: string; partOfSpeech: string | null; cefrLevel: string | null; ipa: string | null; meaning: string | null; example: string | null; tags: string[]; attribution: VocabularyAttribution };

/** Number of published words at a level, for paging. */
export async function countPublishedVocabulary(level: string): Promise<number> {
  const db = createDatabase();
  if (!db) return 0;
  const [row] = await db.select({ total: count() }).from(vocabulary).where(and(eq(vocabulary.status, "PUBLISHED"), eq(vocabulary.cefrLevel, level)));
  return row?.total ?? 0;
}

export async function listPublishedVocabulary(level: string, take = 24, skip = 0): Promise<PublishedVocabularyCard[] | null> {
  const db = createDatabase();
  if (!db) return null;
  const rows = await db.select({ id: vocabulary.id, headword: vocabulary.headword, partOfSpeech: vocabulary.partOfSpeech, cefrLevel: vocabulary.cefrLevel, ipa: vocabulary.ipa, meaning: vocabulary.meaning, example: vocabulary.example, tags: vocabulary.tags, attribution: vocabulary.attribution }).from(vocabulary).where(and(eq(vocabulary.status, "PUBLISHED"), eq(vocabulary.cefrLevel, level))).orderBy(asc(vocabulary.headword)).offset(skip).limit(take);
  return rows.map((row) => ({ ...row, attribution: (row.attribution ?? {}) as VocabularyAttribution, tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [] }));
}
