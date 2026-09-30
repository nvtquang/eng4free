import { randomUUID } from "crypto";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { mistakes } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";

type Actor = LearnerRef;
type Skill = "LISTENING" | "READING" | "GRAMMAR" | "SPEAKING" | "WRITING" | null;

export type MistakeOption = { id: string; text: string };
export type MistakeEntry = {
  sourceType: "LESSON" | "EXAM";
  sourceId: string;
  sourceTitle: string | null;
  questionId: string;
  skill: Skill;
  prompt: string;
  options: MistakeOption[];
  correctOptionId: string;
  explanation: string | null;
};
export type Mistake = MistakeEntry & { id: string; timesWrong: number; resolvedAt: Date | null; updatedAt: Date };

/** Upserts wrong answers into the notebook, incrementing the miss count and clearing any prior resolution. */
export async function recordMistakes(actor: Actor, entries: MistakeEntry[]): Promise<void> {
  const db = createDatabase();
  if (!db || entries.length === 0) return;
  const key = actor.learnerId;
  const now = new Date();
  for (const entry of entries) {
    const inserted = await db.insert(mistakes).values({ id: randomUUID(), learnerId: key, sourceType: entry.sourceType, sourceId: entry.sourceId, sourceTitle: entry.sourceTitle, questionId: entry.questionId, skill: entry.skill, prompt: entry.prompt, options: entry.options, correctOptionId: entry.correctOptionId, explanation: entry.explanation, timesWrong: 1, resolvedAt: null, createdAt: now, updatedAt: now }).onConflictDoNothing({ target: [mistakes.learnerId, mistakes.questionId] }).returning({ id: mistakes.id });
    if (inserted.length === 0) {
      const [existing] = await db.select({ timesWrong: mistakes.timesWrong }).from(mistakes).where(and(eq(mistakes.learnerId, key), eq(mistakes.questionId, entry.questionId))).limit(1);
      await db.update(mistakes).set({ timesWrong: (existing?.timesWrong ?? 1) + 1, resolvedAt: null, sourceTitle: entry.sourceTitle, prompt: entry.prompt, options: entry.options, correctOptionId: entry.correctOptionId, explanation: entry.explanation, updatedAt: now }).where(and(eq(mistakes.learnerId, key), eq(mistakes.questionId, entry.questionId)));
    }
  }
}

/** Marks the given questions as resolved for this owner (called when the learner answers them correctly). */
export async function resolveMistakes(actor: Actor, questionIds: string[]): Promise<void> {
  const db = createDatabase();
  if (!db || questionIds.length === 0) return;
  const key = actor.learnerId;
  const now = new Date();
  for (const questionId of questionIds) {
    await db.update(mistakes).set({ resolvedAt: now, updatedAt: now }).where(and(eq(mistakes.learnerId, key), eq(mistakes.questionId, questionId), isNull(mistakes.resolvedAt)));
  }
}

function mapRow(row: typeof mistakes.$inferSelect): Mistake {
  return { id: row.id, sourceType: row.sourceType as "LESSON" | "EXAM", sourceId: row.sourceId, sourceTitle: row.sourceTitle, questionId: row.questionId, skill: row.skill as Skill, prompt: row.prompt, options: (Array.isArray(row.options) ? row.options : []) as MistakeOption[], correctOptionId: row.correctOptionId, explanation: row.explanation, timesWrong: row.timesWrong, resolvedAt: row.resolvedAt, updatedAt: row.updatedAt };
}

export async function listOpenMistakes(actor: Actor, skill?: Skill): Promise<Mistake[]> {
  const db = createDatabase();
  if (!db) return [];
  const conditions = [eq(mistakes.learnerId, actor.learnerId), isNull(mistakes.resolvedAt)];
  if (skill) conditions.push(eq(mistakes.skill, skill));
  const rows = await db.select().from(mistakes).where(and(...conditions)).orderBy(desc(mistakes.updatedAt)).limit(100);
  return rows.map(mapRow);
}

export async function countOpenMistakes(actor: Actor, skill?: Skill): Promise<number> {
  const db = createDatabase();
  if (!db) return 0;
  const conditions = [eq(mistakes.learnerId, actor.learnerId), isNull(mistakes.resolvedAt)];
  if (skill) conditions.push(eq(mistakes.skill, skill));
  const [row] = await db.select({ total: count() }).from(mistakes).where(and(...conditions));
  return row?.total ?? 0;
}
