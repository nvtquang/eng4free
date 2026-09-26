import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { createVocabularyMemory, scheduleVocabularyReview, type ReviewRating, type VocabularyMemory } from "@english4free/srs";
import { createDatabase } from "@/db/client";
import { vocabulary, vocabularyReviews } from "@/db/schema";
import { appendProgressEvent } from "@/modules/progress/repository";

type Actor = { userId: string | null; guestId: string };
type ReviewRow = typeof vocabularyReviews.$inferSelect;

export function vocabularyOwnerKey(actor: Actor): string {
  return actor.userId ? `user:${actor.userId}` : `guest:${actor.guestId}`;
}

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
  const rows = await db.select({ vocabularyId: vocabularyReviews.vocabularyId, dueAt: vocabularyReviews.dueAt }).from(vocabularyReviews).where(and(eq(vocabularyReviews.ownerKey, vocabularyOwnerKey(actor)), inArray(vocabularyReviews.vocabularyId, vocabularyIds)));
  return new Map(rows.map((row) => [row.vocabularyId, row.dueAt]));
}

/** Schedules the next review of a published word with FSRS, persists it and records progress events. */
export async function recordVocabularyReview(input: { actor: Actor; vocabularyId: string; rating: ReviewRating; eventId: string; now?: Date }): Promise<{ dueAt: Date } | null> {
  const db = createDatabase();
  if (!db) return null;
  const now = input.now ?? new Date();
  const [word] = await db.select({ headword: vocabulary.headword }).from(vocabulary).where(and(eq(vocabulary.id, input.vocabularyId), eq(vocabulary.status, "PUBLISHED"))).limit(1);
  if (!word) return null;
  const ownerKey = vocabularyOwnerKey(input.actor);
  const [existing] = await db.select().from(vocabularyReviews).where(and(eq(vocabularyReviews.ownerKey, ownerKey), eq(vocabularyReviews.vocabularyId, input.vocabularyId))).limit(1);
  const next = scheduleVocabularyReview(existing ? toMemory(existing) : createVocabularyMemory(now), input.rating, now);
  if (existing) await db.update(vocabularyReviews).set({ ...toColumns(next), updatedAt: now }).where(eq(vocabularyReviews.id, existing.id));
  else await db.insert(vocabularyReviews).values({ id: randomUUID(), ownerKey, userId: input.actor.userId, guestId: input.actor.guestId, vocabularyId: input.vocabularyId, ...toColumns(next), createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: [vocabularyReviews.ownerKey, vocabularyReviews.vocabularyId], set: { ...toColumns(next), updatedAt: now } });
  const sourceId = word.headword.toLowerCase();
  await appendProgressEvent({ userId: input.actor.userId, guestId: input.actor.guestId, type: "VOCAB_REVIEWED", skill: null, sourceType: "VOCABULARY", sourceId, idempotencyKey: `vocab-review:${ownerKey}:${input.eventId}`, metadata: { rating: input.rating } });
  if (input.rating === "GOOD" || input.rating === "EASY") await appendProgressEvent({ userId: input.actor.userId, guestId: input.actor.guestId, type: "VOCAB_LEARNED", skill: null, sourceType: "VOCABULARY", sourceId, idempotencyKey: `vocab-learned:${ownerKey}:${sourceId}`, metadata: {} });
  return { dueAt: next.dueAt };
}
