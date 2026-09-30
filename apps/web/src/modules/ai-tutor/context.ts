import { and, eq, inArray } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { attemptAnswers, attempts, examParts, questions } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";
import type { TrustedTutorContext } from "./tutor-service";

/** A finished (submitted or expired) attempt owned by this learner, or null. */
export async function findReviewableAttempt(learner: LearnerRef, attemptId: string): Promise<{ id: string; examId: string } | null> {
  const db = createDatabase();
  if (!db) return null;
  const [attempt] = await db.select({ id: attempts.id, examId: attempts.examId }).from(attempts).where(and(eq(attempts.id, attemptId), eq(attempts.learnerId, learner.learnerId), inArray(attempts.status, ["SUBMITTED", "EXPIRED"])));
  return attempt ?? null;
}

/**
 * Server-built tutor context for one multiple-choice question of a finished attempt: the
 * question must belong to the attempt's exam, and the learner's answer is the one stored
 * with the attempt (never taken from the request). Returns null when any of that fails.
 */
export async function loadTutorContext(learner: LearnerRef, attemptId: string, questionId: string): Promise<(TrustedTutorContext & { attemptId: string; questionId: string }) | null> {
  const db = createDatabase();
  if (!db) return null;
  const attempt = await findReviewableAttempt(learner, attemptId);
  if (!attempt) return null;
  const [question] = await db.select({ id: questions.id, type: questions.type, content: questions.content, answer: questions.answer, explanation: questions.explanation })
    .from(questions).innerJoin(examParts, eq(questions.examPartId, examParts.id))
    .where(and(eq(questions.id, questionId), eq(examParts.examId, attempt.examId)));
  if (!question || question.type !== "MCQ") return null;
  const [saved] = await db.select({ selectedOptionId: attemptAnswers.selectedOptionId }).from(attemptAnswers).where(and(eq(attemptAnswers.attemptId, attempt.id), eq(attemptAnswers.questionId, question.id)));
  if (!saved?.selectedOptionId) return null;
  const content = question.content as { prompt?: string; options?: Array<{ id: string; text: string }> };
  const answer = question.answer as { correctOptionId?: string };
  if (!answer.correctOptionId) return null;
  return {
    attemptId: attempt.id,
    questionId: question.id,
    prompt: content.prompt ?? "",
    learnerAnswer: saved.selectedOptionId,
    correctOptionId: answer.correctOptionId,
    officialExplanation: question.explanation ?? "Review the official answer.",
    optionText: content.options?.find((option) => option.id === saved.selectedOptionId)?.text ?? null
  };
}
