import { and, asc, eq, inArray } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { topicCategories, topics } from "@/db/schema";
import type { Locale } from "@/lib/i18n";

type Localized = { vi: string; en: string };
type FreeTopicContent = { title: Localized; prompt: Localized; suggestions: string[]; advanced: string[] };

/** A free speaking/writing topic in the interface language. */
export type FreeTopic = { id: string; slug: string; title: string; prompt: string; suggestions: string[]; advanced: string[] };
export type TopicCategory = { id: string; slug: string; title: string; note?: string; topics: FreeTopic[] };

export type IeltsTopicKind = "IELTS_WRITING_TASK_1" | "IELTS_WRITING_TASK_2" | "IELTS_SPEAKING";
/** An IELTS Writing task or Speaking set (English content). */
export type IeltsTopic = {
  id: string; slug: string; kind: IeltsTopicKind; title: string;
  content: {
    instructions: string; prompt: string; image?: { src: string; alt: string; credit?: string }; minWords?: number; minutes?: number;
    part1?: string[]; cueCard?: { topic: string; points: string[]; closing: string }; part3?: string[];
  };
};

/** Published free topics of one kind, grouped by their published categories in authored order. */
export async function listTopicCategories(kind: "FREE_SPEAKING" | "FREE_WRITING", locale: Locale): Promise<TopicCategory[]> {
  const db = createDatabase();
  if (!db) return [];
  const categories = await db.select().from(topicCategories).where(and(eq(topicCategories.kind, kind), eq(topicCategories.status, "PUBLISHED"))).orderBy(asc(topicCategories.sortOrder));
  if (!categories.length) return [];
  const rows = await db.select({ id: topics.id, slug: topics.slug, categoryId: topics.categoryId, content: topics.content }).from(topics).where(and(eq(topics.kind, kind), eq(topics.status, "PUBLISHED"), inArray(topics.categoryId, categories.map((category) => category.id)))).orderBy(asc(topics.sortOrder));
  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: (category.title as Localized)[locale],
    note: category.note ? (category.note as Localized)[locale] : undefined,
    topics: rows.filter((row) => row.categoryId === category.id).map((row) => {
      const content = row.content as FreeTopicContent;
      return { id: row.id, slug: row.slug, title: content.title[locale], prompt: content.prompt[locale], suggestions: content.suggestions, advanced: content.advanced };
    })
  })).filter((category) => category.topics.length > 0);
}

/** Published IELTS Writing/Speaking tasks in authored order. */
export async function listIeltsTopics(kinds: IeltsTopicKind[]): Promise<IeltsTopic[]> {
  const db = createDatabase();
  if (!db) return [];
  const rows = await db.select({ id: topics.id, slug: topics.slug, kind: topics.kind, title: topics.title, content: topics.content }).from(topics).where(and(eq(topics.status, "PUBLISHED"), inArray(topics.kind, kinds))).orderBy(asc(topics.sortOrder), asc(topics.createdAt));
  return rows.map((row) => ({ ...row, kind: row.kind as IeltsTopicKind, content: row.content as IeltsTopic["content"] }));
}
