import { randomUUID } from "node:crypto";
import { and, count, eq, inArray, lte } from "drizzle-orm";
import { createVocabularyMemory, scheduleVocabularyReview, type ReviewRating, type VocabularyMemory } from "@english4free/srs";
import { createDatabase } from "@/db/client";
import { vocabulary, vocabularyReviews } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";
import { appendProgressEvent } from "@/modules/progress/repository";

type Actor = LearnerRef;
type ReviewRow = typeof vocabularyReviews.$inferSelect;

function toMemory(row: ReviewRow): VocabularyMemory {
  return { dueAt: row.dueAt, lastReview: row.lastReview, difficulty: row.difficulty, stability: row.stability, retrievability: row.retrievability, elapsedDays: row.elapsedDays, scheduledDays: row.scheduledDays, learningSteps: row.learningSteps, repetitions: row.repetitions, lapses: row.lapses, state: row.fsrsState };
}

function toColumns(memory: VocabularyMemory) {
  return { dueAt: memory.dueAt, lastReview: memory.lastReview, difficulty: memory.difficulty, stability: memory.stability, retrievability: memory.retrievability, elapsedDays: memory.elapsedDays, scheduledDays: memory.scheduledDays, learningSteps: memory.learningSteps, repetitions: memory.repetitions, lapses: memory.lapses, fsrsState: memory.state };
}

/** Next due time of each already-reviewed word, for the given owner. Words never reviewed are absent. */
export async function listVocabularyDueDates(actor: Actor, vocabularyIds: string[]): Promise<Map<string, Date>> {
  const db = createDatabase();
  if (!db || vocabularyIds.length === 0) return new Map();
  const rows = await db.select({ vocabularyId: vocabularyReviews.vocabularyId, dueAt: vocabularyReviews.dueAt }).from(vocabularyReviews).where(and(eq(vocabularyReviews.learnerId, actor.learnerId), inArray(vocabularyReviews.vocabularyId, vocabularyIds)));
  return new Map(rows.map((row) => [row.vocabularyId, row.dueAt]));
}

/** How many of the owner's scheduled words are due for review at or before `now`. */
export async function countDueVocabulary(actor: Actor, now = new Date()): Promise<number> {
  const db = createDatabase();
  if (!db) return 0;
  const [row] = await db.select({ due: count() }).from(vocabularyReviews).where(and(eq(vocabularyReviews.learnerId, actor.learnerId), lte(vocabularyReviews.dueAt, now)));
  return row?.due ?? 0;
}

/** Adds a published word to the review deck as due-now, unless it is already scheduled. Used to save words while studying. */
export async function addToWordbook(actor: Actor, vocabularyId: string, now = new Date()): Promise<{ added: boolean } | null> {
  const db = createDatabase();
  if (!db) return null;
  const [word] = await db.select({ headword: vocabulary.headword }).from(vocabulary).where(and(eq(vocabulary.id, vocabularyId), eq(vocabulary.status, "PUBLISHED"))).limit(1);
  if (!word) return null;
  const learnerId = actor.learnerId;
  const [existing] = await db.select({ id: vocabularyReviews.id }).from(vocabularyReviews).where(and(eq(vocabularyReviews.learnerId, learnerId), eq(vocabularyReviews.vocabularyId, vocabularyId))).limit(1);
  if (existing) return { added: false };
  const memory = createVocabularyMemory(now);
  await db.insert(vocabularyReviews).values({ id: randomUUID(), learnerId: actor.learnerId, vocabularyId, ...toColumns(memory), createdAt: now, updatedAt: now }).onConflictDoNothing({ target: [vocabularyReviews.learnerId, vocabularyReviews.vocabularyId] });
  return { added: true };
}

/** Schedules the next review of a published word with FSRS, persists it and records progress events. */
export async function recordVocabularyReview(input: { actor: Actor; vocabularyId: string; rating: ReviewRating; eventId: string; now?: Date }): Promise<{ dueAt: Date } | null> {
  const db = createDatabase();
  if (!db) return null;
  const now = input.now ?? new Date();
  const [word] = await db.select({ headword: vocabulary.headword }).from(vocabulary).where(and(eq(vocabulary.id, input.vocabularyId), eq(vocabulary.status, "PUBLISHED"))).limit(1);
  if (!word) return null;
  const learnerId = input.actor.learnerId;
  const [existing] = await db.select().from(vocabularyReviews).where(and(eq(vocabularyReviews.learnerId, learnerId), eq(vocabularyReviews.vocabularyId, input.vocabularyId))).limit(1);
  const next = scheduleVocabularyReview(existing ? toMemory(existing) : createVocabularyMemory(now), input.rating, now);
  if (existing) await db.update(vocabularyReviews).set({ ...toColumns(next), updatedAt: now }).where(eq(vocabularyReviews.id, existing.id));
  else await db.insert(vocabularyReviews).values({ id: randomUUID(), learnerId: input.actor.learnerId, vocabularyId: input.vocabularyId, ...toColumns(next), createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: [vocabularyReviews.learnerId, vocabularyReviews.vocabularyId], set: { ...toColumns(next), updatedAt: now } });
  const sourceId = word.headword.toLowerCase();
  await appendProgressEvent({ learnerId: input.actor.learnerId, type: "VOCAB_REVIEWED", skill: null, sourceType: "VOCABULARY", sourceId, idempotencyKey: `vocab-review:${learnerId}:${input.eventId}`, metadata: { rating: input.rating } });
  if (input.rating === "GOOD" || input.rating === "EASY") await appendProgressEvent({ learnerId: input.actor.learnerId, type: "VOCAB_LEARNED", skill: null, sourceType: "VOCABULARY", sourceId, idempotencyKey: `vocab-learned:${learnerId}:${sourceId}`, metadata: {} });
  return { dueAt: next.dueAt };
}
