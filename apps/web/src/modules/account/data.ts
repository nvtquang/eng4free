import { and, asc, eq, inArray } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  attemptAnswers, attempts, exams, learnerProfiles, learners, lessonCompletions, lessons, media, mistakes, placementAttempts,
  progressEvents, reminderPreferences, speakingSessions, speakingTurns, users, verificationTokens, vocabulary, vocabularyReviews, writingFeedback,
  writingRevisions, writingSubmissions
} from "@/db/schema";
import { deleteRecording } from "@/modules/media/recording-storage";

/** Whose data a request is about: a guest has only a learner, a signed-in user may also have an account. */
export type DataOwner = { learnerId: string | null; userId: string | null };

/**
 * Everything stored about the owner, in a readable JSON shape for "download my data". Answer
 * keys and other learners' content are not included; recordings are listed with their links.
 */
export async function exportOwnerData(db: Database, owner: DataOwner) {
  const [user] = owner.userId ? await db.select({ name: users.name, email: users.email, createdVia: users.emailVerified }).from(users).where(eq(users.id, owner.userId)) : [];
  const [reminders] = owner.userId ? await db.select({ enabled: reminderPreferences.enabled, hour: reminderPreferences.hour, lastSentAt: reminderPreferences.lastSentAt }).from(reminderPreferences).where(eq(reminderPreferences.userId, owner.userId)) : [];
  const learnerId = owner.learnerId;
  if (!learnerId) return { exportedAt: new Date().toISOString(), account: user ? { ...user, reminders: reminders ?? null } : null, learning: null };

  const [learner] = await db.select({ createdAt: learners.createdAt, lastSeenAt: learners.lastSeenAt }).from(learners).where(eq(learners.id, learnerId));
  const [profile] = await db.select({ goal: learnerProfiles.goal, cefrLevel: learnerProfiles.cefrLevel, levelSource: learnerProfiles.levelSource, minutesPerDay: learnerProfiles.minutesPerDay, skillLevels: learnerProfiles.skillLevels, updatedAt: learnerProfiles.updatedAt }).from(learnerProfiles).where(eq(learnerProfiles.learnerId, learnerId));
  const placements = await db.select({ startedAt: placementAttempts.startedAt, completedAt: placementAttempts.completedAt, result: placementAttempts.result }).from(placementAttempts).where(eq(placementAttempts.learnerId, learnerId)).orderBy(asc(placementAttempts.startedAt));
  const activity = await db.select({ type: progressEvents.type, skill: progressEvents.skill, sourceType: progressEvents.sourceType, sourceId: progressEvents.sourceId, occurredAt: progressEvents.occurredAt }).from(progressEvents).where(eq(progressEvents.learnerId, learnerId)).orderBy(asc(progressEvents.occurredAt));
  const completedLessons = await db.select({ lesson: lessons.title, slug: lessons.slug, rawScore: lessonCompletions.rawScore, totalQuestions: lessonCompletions.totalQuestions, completedAt: lessonCompletions.completedAt }).from(lessonCompletions).innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id)).where(eq(lessonCompletions.learnerId, learnerId)).orderBy(asc(lessonCompletions.completedAt));
  const examAttempts = await db.select({ id: attempts.id, exam: exams.title, slug: exams.slug, status: attempts.status, rawScore: attempts.rawScore, totalPoints: attempts.totalQuestions, startedAt: attempts.startedAt, submittedAt: attempts.submittedAt }).from(attempts).innerJoin(exams, eq(attempts.examId, exams.id)).where(eq(attempts.learnerId, learnerId)).orderBy(asc(attempts.startedAt));
  const answers = examAttempts.length ? await db.select({ attemptId: attemptAnswers.attemptId, questionId: attemptAnswers.questionId, response: attemptAnswers.response }).from(attemptAnswers).where(inArray(attemptAnswers.attemptId, examAttempts.map((attempt) => attempt.id))) : [];
  const words = await db.select({ word: vocabulary.headword, level: vocabulary.cefrLevel, dueAt: vocabularyReviews.dueAt, lastReview: vocabularyReviews.lastReview, repetitions: vocabularyReviews.repetitions, lapses: vocabularyReviews.lapses }).from(vocabularyReviews).innerJoin(vocabulary, eq(vocabularyReviews.vocabularyId, vocabulary.id)).where(eq(vocabularyReviews.learnerId, learnerId)).orderBy(asc(vocabulary.headword));
  const mistakeNotebook = await db.select({ source: mistakes.sourceTitle, prompt: mistakes.prompt, timesWrong: mistakes.timesWrong, resolvedAt: mistakes.resolvedAt, createdAt: mistakes.createdAt }).from(mistakes).where(eq(mistakes.learnerId, learnerId)).orderBy(asc(mistakes.createdAt));
  const submissions = await db.select().from(writingSubmissions).where(eq(writingSubmissions.learnerId, learnerId)).orderBy(asc(writingSubmissions.createdAt));
  const writing = await Promise.all(submissions.map(async (submission) => ({
    prompt: (submission.prompt as { text?: string }).text ?? null, taskType: submission.taskType, status: submission.status, createdAt: submission.createdAt, submittedAt: submission.submittedAt,
    revisions: await db.select({ text: writingRevisions.text, wordCount: writingRevisions.wordCount, createdAt: writingRevisions.createdAt }).from(writingRevisions).where(eq(writingRevisions.submissionId, submission.id)).orderBy(asc(writingRevisions.createdAt)),
    feedback: await db.select({ provider: writingFeedback.provider, content: writingFeedback.content, createdAt: writingFeedback.createdAt }).from(writingFeedback).where(eq(writingFeedback.submissionId, submission.id)).orderBy(asc(writingFeedback.createdAt))
  })));
  const sessions = await db.select().from(speakingSessions).where(eq(speakingSessions.learnerId, learnerId)).orderBy(asc(speakingSessions.createdAt));
  const speaking = await Promise.all(sessions.map(async (session) => ({
    prompt: session.prompt, part: session.part, status: session.status, createdAt: session.createdAt,
    turns: (await db.select({ transcript: speakingTurns.transcript, durationMs: speakingTurns.durationMs, feedback: speakingTurns.feedback, audioMediaId: speakingTurns.audioMediaId }).from(speakingTurns).where(eq(speakingTurns.sessionId, session.id)).orderBy(asc(speakingTurns.turnOrder)))
      .map(({ audioMediaId, ...turn }) => ({ ...turn, recording: audioMediaId ? `/api/media/${audioMediaId}` : null }))
  })));

  return {
    exportedAt: new Date().toISOString(),
    account: user ? { ...user, reminders: reminders ?? null } : null,
    learning: {
      learner, profile: profile ?? null, placements, completedLessons,
      exams: examAttempts.map(({ id, ...attempt }) => ({ ...attempt, answers: answers.filter((answer) => answer.attemptId === id).map((answer) => ({ questionId: answer.questionId, response: answer.response })) })),
      vocabulary: words, mistakes: mistakeNotebook, writing, speaking, activity
    }
  };
}

/** Deletes recording files and their media rows by id; turns keep their transcript and feedback. Returns the files removed. */
export async function deleteRecordings(db: Database, mediaIds: string[]): Promise<number> {
  if (!mediaIds.length) return 0;
  const rows = await db.select({ id: media.id, storageKey: media.storageKey }).from(media).where(and(inArray(media.id, mediaIds), eq(media.kind, "RECORDING")));
  if (!rows.length) return 0;
  let removed = 0;
  for (const row of rows) if (await deleteRecording(row.storageKey)) removed += 1;
  const ids = rows.map((row) => row.id);
  await db.update(speakingTurns).set({ audioMediaId: null }).where(inArray(speakingTurns.audioMediaId, ids));
  await db.delete(media).where(inArray(media.id, ids));
  return removed;
}

/** Deletes every recording of these learners. */
export async function deleteLearnerRecordings(db: Database, learnerIds: string[]): Promise<number> {
  if (!learnerIds.length) return 0;
  const rows = await db.select({ id: media.id }).from(media).where(and(inArray(media.learnerId, learnerIds), eq(media.kind, "RECORDING")));
  return deleteRecordings(db, rows.map((row) => row.id));
}

/**
 * Permanently deletes the owner's learning data, recordings and (when signed in) the account
 * with its sign-in links and sessions. Database cascades remove everything owned by the learner.
 */
export async function deleteOwnerData(db: Database, owner: DataOwner): Promise<{ recordings: number }> {
  const recordings = owner.learnerId ? await deleteLearnerRecordings(db, [owner.learnerId]) : 0;
  if (owner.learnerId) await db.delete(learners).where(eq(learners.id, owner.learnerId));
  if (owner.userId) {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, owner.userId));
    if (user?.email) await db.delete(verificationTokens).where(eq(verificationTokens.identifier, user.email));
    await db.delete(users).where(eq(users.id, owner.userId));
  }
  return { recordings };
}
