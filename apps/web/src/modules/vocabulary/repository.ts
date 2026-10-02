import { and, asc, count, eq, lte } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { vocabulary, vocabularyReviews } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";

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

const cardColumns = { id: vocabulary.id, headword: vocabulary.headword, partOfSpeech: vocabulary.partOfSpeech, cefrLevel: vocabulary.cefrLevel, ipa: vocabulary.ipa, meaning: vocabulary.meaning, example: vocabulary.example, tags: vocabulary.tags, attribution: vocabulary.attribution };
function toCard(row: Omit<PublishedVocabularyCard, "attribution" | "tags"> & { attribution: unknown; tags: unknown }): PublishedVocabularyCard {
  return { ...row, attribution: (row.attribution ?? {}) as VocabularyAttribution, tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [] };
}

export async function listPublishedVocabulary(level: string, take = 24, skip = 0): Promise<PublishedVocabularyCard[] | null> {
  const db = createDatabase();
  if (!db) return null;
  const rows = await db.select(cardColumns).from(vocabulary).where(and(eq(vocabulary.status, "PUBLISHED"), eq(vocabulary.cefrLevel, level))).orderBy(asc(vocabulary.headword)).offset(skip).limit(take);
  return rows.map(toCard);
}

/** The learner's saved words that are due for review now, from every level, oldest due first. */
export async function listDueVocabulary(learner: LearnerRef, now = new Date(), take = 50): Promise<PublishedVocabularyCard[]> {
  const db = createDatabase();
  if (!db) return [];
  const rows = await db.select(cardColumns).from(vocabularyReviews).innerJoin(vocabulary, eq(vocabularyReviews.vocabularyId, vocabulary.id))
    .where(and(eq(vocabularyReviews.learnerId, learner.learnerId), lte(vocabularyReviews.dueAt, now), eq(vocabulary.status, "PUBLISHED")))
    .orderBy(asc(vocabularyReviews.dueAt), asc(vocabulary.headword)).limit(take);
  return rows.map(toCard);
}
