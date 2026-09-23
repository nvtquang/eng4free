import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { McqContentSchema } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { attemptAnswers, attempts, examParts, exams, passages, questions } from "@/db/schema";
import { appendProgressEvent } from "@/modules/progress/repository";
import type { AttemptActor, SavedAnswer } from "@/modules/attempts/types";

type PublicQuestion = { id: string; content: { prompt: string; options: Array<{ id: string; text: string }> }; passageId: string | null };
type PublicPart = { id: string; partNumber: number; title: string; instructions: string | null; skill: string | null; metadata: Record<string, unknown>; passages: Array<{ id: string; title: string | null; content: string }>; questions: PublicQuestion[] };
export type PublicExam = { id: string; slug: string; title: string; type: "TOEIC" | "IELTS"; mode: "PRACTICE" | "MINI_TEST" | "FULL_MOCK"; durationSeconds: number; parts: PublicPart[]; totalQuestions: number };
export type ExamAttemptResult = { attempt: { id: string; status: "SUBMITTED" | "EXPIRED"; rawScore: number; totalQuestions: number; submittedAt: Date | null }; results: Array<{ questionId: string; selectedOptionId: string | null; correctOptionId: string; correct: boolean; explanation: string | null }> };

function dbOrThrow() {
  const db = createDatabase();
  if (!db) throw new Error("DATABASE_URL is required for the shared exam engine");
  return db;
}

function owner(actor: AttemptActor) {
  return actor.userId
    ? or(eq(attempts.userId, actor.userId), eq(attempts.guestId, actor.guestId))
    : eq(attempts.guestId, actor.guestId);
}

export function isAttemptExpired(expiresAt: Date | null, now = new Date()) {
  return Boolean(expiresAt && expiresAt <= now);
}

export function scoreStoredAnswers(questionRows: Array<{ id: string; answer: unknown; explanation: string | null }>, saved: Array<{ questionId: string; selectedOptionId: string }>) {
  const answerMap = new Map(saved.map((item) => [item.questionId, item.selectedOptionId]));
  const results = questionRows.map((item) => {
    const correctOptionId = (item.answer as { correctOptionId: string }).correctOptionId;
    const selectedOptionId = answerMap.get(item.id) ?? null;
    return { questionId: item.id, selectedOptionId, correctOptionId, correct: selectedOptionId === correctOptionId, explanation: item.explanation };
  });
  return { rawScore: results.filter((item) => item.correct).length, results };
}

export async function getPublicExamBySlug(slug: string): Promise<PublicExam | null> {
  const db = dbOrThrow();
  const [exam] = await db.select().from(exams).where(and(eq(exams.slug, slug), eq(exams.status, "PUBLISHED")));
  if (!exam) return null;
  const partRows = await db.select().from(examParts).where(eq(examParts.examId, exam.id)).orderBy(asc(examParts.sortOrder));
  const parts = await Promise.all(partRows.map(async (part) => {
    const passageRows = await db.select().from(passages).where(eq(passages.examPartId, part.id)).orderBy(asc(passages.sortOrder));
    const questionRows = await db.select({ id: questions.id, content: questions.content, passageId: questions.passageId }).from(questions).where(and(eq(questions.examPartId, part.id), eq(questions.status, "PUBLISHED"))).orderBy(asc(questions.createdAt));
    return {
      id: part.id, partNumber: part.partNumber, title: part.title, instructions: part.instructions, skill: part.skill, metadata: part.metadata as Record<string, unknown>,
      passages: passageRows.map((item) => ({ id: item.id, title: item.title, content: item.content })),
      questions: questionRows.map((item) => ({ id: item.id, passageId: item.passageId, content: McqContentSchema.parse(item.content) }))
    };
  }));
  return { id: exam.id, slug: exam.slug, title: exam.title, type: exam.type, mode: exam.mode as PublicExam["mode"], durationSeconds: exam.durationSeconds, parts, totalQuestions: parts.reduce((sum, part) => sum + part.questions.length, 0) };
}

export async function listPublicExams(type: "TOEIC" | "IELTS") {
  const db = dbOrThrow();
  return db.select({ slug: exams.slug, title: exams.title, type: exams.type, mode: exams.mode, durationSeconds: exams.durationSeconds })
    .from(exams)
    .where(and(eq(exams.status, "PUBLISHED"), eq(exams.type, type)))
    .orderBy(asc(exams.createdAt));
}

async function getOwnedAttempt(attemptId: string, actor: AttemptActor) {
  const db = dbOrThrow();
  const [attempt] = await db.select().from(attempts).where(and(eq(attempts.id, attemptId), owner(actor)));
  if (!attempt) throw new Error("Attempt not found");
  return attempt;
}

async function getQuestionRows(examId: string) {
  const db = dbOrThrow();
  return db.select({ id: questions.id, answer: questions.answer, explanation: questions.explanation }).from(questions).innerJoin(examParts, eq(questions.examPartId, examParts.id)).where(and(eq(examParts.examId, examId), eq(questions.status, "PUBLISHED")));
}

async function getSavedAnswers(attemptId: string) {
  const db = dbOrThrow();
  return db.select({ questionId: attemptAnswers.questionId, selectedOptionId: attemptAnswers.selectedOptionId }).from(attemptAnswers).where(eq(attemptAnswers.attemptId, attemptId));
}

async function validateAndPersistAnswers(attemptId: string, examId: string, answers: SavedAnswer[]) {
  const db = dbOrThrow();
  const allowedRows = await db.select({ id: questions.id, content: questions.content }).from(questions).innerJoin(examParts, eq(questions.examPartId, examParts.id)).where(and(eq(examParts.examId, examId), eq(questions.status, "PUBLISHED")));
  const allowed = new Map(allowedRows.map((row) => [row.id, McqContentSchema.parse(row.content)]));
  for (const answer of answers) {
    const content = allowed.get(answer.questionId);
    if (!content?.options.some((option) => option.id === answer.selectedOptionId)) throw new Error("Invalid answer for this exam");
    await db.insert(attemptAnswers).values({ attemptId, questionId: answer.questionId, selectedOptionId: answer.selectedOptionId }).onConflictDoUpdate({ target: [attemptAnswers.attemptId, attemptAnswers.questionId], set: { selectedOptionId: answer.selectedOptionId, updatedAt: new Date() } });
  }
}

async function completeExamAttempt(attemptId: string, actor: AttemptActor, expired: boolean): Promise<ExamAttemptResult> {
  const db = dbOrThrow();
  const current = await getOwnedAttempt(attemptId, actor);
  const questionRows = await getQuestionRows(current.examId);
  const saved = await getSavedAnswers(attemptId);
  const scored = scoreStoredAnswers(questionRows, saved);
  const completedAt = new Date();
  if (current.status === "IN_PROGRESS") {
    await db.update(attempts).set({ status: expired ? "EXPIRED" : "SUBMITTED", rawScore: scored.rawScore, submittedAt: completedAt, updatedAt: completedAt }).where(and(eq(attempts.id, attemptId), eq(attempts.status, "IN_PROGRESS")));
  }
  const attempt = await getOwnedAttempt(attemptId, actor);
  const [exam] = await db.select({ mode: exams.mode }).from(exams).where(eq(exams.id, attempt.examId));
  await appendProgressEvent({
    userId: actor.userId, guestId: actor.guestId, type: "EXAM_COMPLETED", skill: null, sourceType: "EXAM_ATTEMPT", sourceId: attempt.id,
    idempotencyKey: "exam:" + attempt.id + ":completed",
    metadata: { examId: attempt.examId, rawScore: attempt.rawScore ?? scored.rawScore, mode: exam?.mode, expired: attempt.status === "EXPIRED" }
  });
  return { attempt: { id: attempt.id, status: attempt.status as "SUBMITTED" | "EXPIRED", rawScore: attempt.rawScore ?? scored.rawScore, totalQuestions: attempt.totalQuestions, submittedAt: attempt.submittedAt }, results: scored.results };
}

export async function startOrResumeExam(slug: string, actor: AttemptActor) {
  const db = dbOrThrow();
  const exam = await getPublicExamBySlug(slug);
  if (!exam) throw new Error("Exam not found");
  const [active] = await db.select().from(attempts).where(and(eq(attempts.examId, exam.id), eq(attempts.status, "IN_PROGRESS"), owner(actor))).orderBy(desc(attempts.startedAt)).limit(1);
  const now = new Date();
  if (active && !isAttemptExpired(active.expiresAt, now)) {
    const answers = await getSavedAnswers(active.id);
    return { attempt: { ...active, answers }, exam, resumed: true };
  }
  if (active) await completeExamAttempt(active.id, actor, true);
  const id = randomUUID();
  const expiresAt = new Date(now.getTime() + exam.durationSeconds * 1000);
  await db.insert(attempts).values({ id, examId: exam.id, userId: actor.userId, guestId: actor.guestId, status: "IN_PROGRESS", startedAt: now, expiresAt, totalQuestions: exam.totalQuestions });
  await appendProgressEvent({
    userId: actor.userId, guestId: actor.guestId, type: "EXAM_STARTED", skill: null, sourceType: "EXAM_ATTEMPT", sourceId: id,
    idempotencyKey: "exam:" + id + ":started",
    metadata: { examId: exam.id, mode: exam.mode }
  });
  return { attempt: { id, examId: exam.id, userId: actor.userId, guestId: actor.guestId, status: "IN_PROGRESS" as const, startedAt: now, expiresAt, submittedAt: null, rawScore: null, totalQuestions: exam.totalQuestions, answers: [] }, exam, resumed: false };
}

export async function saveExamAnswers(attemptId: string, actor: AttemptActor, answers: SavedAnswer[]) {
  const attempt = await getOwnedAttempt(attemptId, actor);
  if (attempt.status !== "IN_PROGRESS") throw new Error("Attempt is not editable");
  if (isAttemptExpired(attempt.expiresAt)) {
    await completeExamAttempt(attemptId, actor, true);
    throw new Error("Attempt has expired");
  }
  await validateAndPersistAnswers(attemptId, attempt.examId, answers);
  return { attemptId, savedAnswers: (await getSavedAnswers(attemptId)).length };
}

export async function submitExamAttempt(attemptId: string, actor: AttemptActor, submittedAnswers: SavedAnswer[]) {
  const attempt = await getOwnedAttempt(attemptId, actor);
  if (attempt.status === "IN_PROGRESS" && !isAttemptExpired(attempt.expiresAt)) await validateAndPersistAnswers(attemptId, attempt.examId, submittedAnswers);
  return completeExamAttempt(attemptId, actor, isAttemptExpired(attempt.expiresAt));
}

export async function getExamAttemptReview(slug: string, attemptId: string, actor: AttemptActor) {
  const exam = await getPublicExamBySlug(slug);
  if (!exam) return null;
  let attempt = await getOwnedAttempt(attemptId, actor);
  if (attempt.examId !== exam.id) return null;
  if (attempt.status === "IN_PROGRESS") {
    if (!isAttemptExpired(attempt.expiresAt)) return null;
    await completeExamAttempt(attemptId, actor, true);
    attempt = await getOwnedAttempt(attemptId, actor);
  }
  const result = await completeExamAttempt(attemptId, actor, attempt.status === "EXPIRED");
  return { exam, ...result };
}
