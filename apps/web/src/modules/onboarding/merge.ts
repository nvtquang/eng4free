import { and, eq, inArray, isNull } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { attempts, learnerProfiles, lessonCompletions, media, mistakes, progressEvents, speakingSessions, vocabularyReviews, writingSubmissions } from "@/db/schema";

/**
 * Reassigns a guest's data to their account the first time they sign in, so nothing
 * they did anonymously is lost. Tolerant tables (attempts, progress, writing, speaking,
 * media) just take the user id. The owner-keyed tables (vocabulary reviews, lesson
 * completions, learner profile) carry a unique key per owner, so where the account
 * already owns the same word/lesson/profile the account's row wins and the guest row
 * is dropped; otherwise the guest row is rekeyed to the account.
 */
export async function mergeGuestIntoUser(guestId: string, userId: string): Promise<void> {
  const db = createDatabase();
  if (!db || !guestId || !userId) return;
  const guestKey = `guest:${guestId}`;
  const userKey = `user:${userId}`;

  await db.update(attempts).set({ userId }).where(and(eq(attempts.guestId, guestId), isNull(attempts.userId)));
  await db.update(progressEvents).set({ userId }).where(and(eq(progressEvents.guestId, guestId), isNull(progressEvents.userId)));
  await db.update(writingSubmissions).set({ userId }).where(and(eq(writingSubmissions.guestId, guestId), isNull(writingSubmissions.userId)));
  await db.update(speakingSessions).set({ userId }).where(and(eq(speakingSessions.guestId, guestId), isNull(speakingSessions.userId)));
  await db.update(media).set({ ownerUserId: userId }).where(and(eq(media.ownerGuestId, guestId), isNull(media.ownerUserId)));

  const ownedVocab = await db.select({ vocabularyId: vocabularyReviews.vocabularyId }).from(vocabularyReviews).where(eq(vocabularyReviews.ownerKey, userKey));
  const ownedVocabIds = ownedVocab.map((row) => row.vocabularyId);
  if (ownedVocabIds.length > 0) await db.delete(vocabularyReviews).where(and(eq(vocabularyReviews.ownerKey, guestKey), inArray(vocabularyReviews.vocabularyId, ownedVocabIds)));
  await db.update(vocabularyReviews).set({ ownerKey: userKey, userId }).where(eq(vocabularyReviews.ownerKey, guestKey));

  const ownedLessons = await db.select({ lessonId: lessonCompletions.lessonId }).from(lessonCompletions).where(eq(lessonCompletions.ownerKey, userKey));
  const ownedLessonIds = ownedLessons.map((row) => row.lessonId);
  if (ownedLessonIds.length > 0) await db.delete(lessonCompletions).where(and(eq(lessonCompletions.ownerKey, guestKey), inArray(lessonCompletions.lessonId, ownedLessonIds)));
  await db.update(lessonCompletions).set({ ownerKey: userKey, userId }).where(eq(lessonCompletions.ownerKey, guestKey));

  const ownedMistakes = await db.select({ questionId: mistakes.questionId }).from(mistakes).where(eq(mistakes.ownerKey, userKey));
  const ownedQuestionIds = ownedMistakes.map((row) => row.questionId);
  if (ownedQuestionIds.length > 0) await db.delete(mistakes).where(and(eq(mistakes.ownerKey, guestKey), inArray(mistakes.questionId, ownedQuestionIds)));
  await db.update(mistakes).set({ ownerKey: userKey, userId }).where(eq(mistakes.ownerKey, guestKey));

  const [accountProfile] = await db.select({ id: learnerProfiles.id }).from(learnerProfiles).where(eq(learnerProfiles.ownerKey, userKey)).limit(1);
  if (accountProfile) await db.delete(learnerProfiles).where(eq(learnerProfiles.ownerKey, guestKey));
  else await db.update(learnerProfiles).set({ ownerKey: userKey, userId }).where(eq(learnerProfiles.ownerKey, guestKey));
}
