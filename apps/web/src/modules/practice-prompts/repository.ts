import { and, asc, eq, inArray } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { practicePrompts } from "@/db/schema";

export type PracticePromptKind = "IELTS_WRITING_TASK_1" | "IELTS_WRITING_TASK_2" | "IELTS_SPEAKING";
export type PracticePrompt = {
  slug: string; kind: PracticePromptKind; title: string;
  content: {
    instructions: string; prompt: string; image?: { src: string; alt: string; credit?: string }; minWords?: number; minutes?: number;
    part1?: string[]; cueCard?: { topic: string; points: string[]; closing: string }; part3?: string[];
  };
};

/** Published IELTS Writing/Speaking tasks in their authored order; an empty list when the database is unavailable. */
export async function listPublishedPrompts(kinds: PracticePromptKind[]): Promise<PracticePrompt[]> {
  const db = createDatabase();
  if (!db) return [];
  const rows = await db.select({ slug: practicePrompts.slug, kind: practicePrompts.kind, title: practicePrompts.title, content: practicePrompts.content })
    .from(practicePrompts)
    .where(and(eq(practicePrompts.status, "PUBLISHED"), inArray(practicePrompts.kind, kinds)))
    .orderBy(asc(practicePrompts.sortOrder), asc(practicePrompts.createdAt))
    .catch(() => []);
  return rows.map((row) => ({ ...row, kind: row.kind as PracticePromptKind, content: row.content as PracticePrompt["content"] }));
}
