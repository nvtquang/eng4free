import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";

export const REVIEW_RATINGS = ["AGAIN", "HARD", "GOOD", "EASY"] as const;
export type ReviewRating = (typeof REVIEW_RATINGS)[number];

export type VocabularyMemory = { dueAt: Date; lastReview: Date | null; difficulty: number; stability: number; retrievability: number; elapsedDays: number; scheduledDays: number; learningSteps: number; repetitions: number; lapses: number; state: Card["state"] };
const ratingMap: Record<ReviewRating, Grade> = { AGAIN: Rating.Again, HARD: Rating.Hard, GOOD: Rating.Good, EASY: Rating.Easy };
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });

function toCard(memory: VocabularyMemory): Card {
  return { due: memory.dueAt, last_review: memory.lastReview ?? undefined, difficulty: memory.difficulty, stability: memory.stability, elapsed_days: memory.elapsedDays, scheduled_days: memory.scheduledDays, learning_steps: memory.learningSteps, reps: memory.repetitions, lapses: memory.lapses, state: memory.state };
}
function fromCard(card: Card, now: Date): VocabularyMemory {
  return { dueAt: card.due, lastReview: card.last_review ?? null, difficulty: card.difficulty, stability: card.stability, retrievability: scheduler.get_retrievability(card, now, false), elapsedDays: card.elapsed_days, scheduledDays: card.scheduled_days, learningSteps: card.learning_steps, repetitions: card.reps, lapses: card.lapses, state: card.state };
}
export function createVocabularyMemory(now = new Date()): VocabularyMemory { return fromCard(createEmptyCard(now), now); }
export function scheduleVocabularyReview(memory: VocabularyMemory, rating: ReviewRating, now = new Date()): VocabularyMemory { return fromCard(scheduler.next(toCard(memory), now, ratingMap[rating]).card, now); }
