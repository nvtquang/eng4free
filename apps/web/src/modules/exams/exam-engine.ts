import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { isResponseAnswered, parseAuthoredQuestion, parseLearnerResponse, parsePublicQuestion, questionPoints, type GradableQuestionType, type PublicQuestion as PublicQuestionDefinition, type QuestionAnswer, type QuestionResponse } from "@english4free/content-schemas";
import { scoreQuestion } from "@english4free/scoring-core";
import { createDatabase } from "@/db/client";
import { attemptAnswers, attempts, examParts, exams, passages, questions } from "@/db/schema";
import { demoAudioUrl } from "@/modules/media/demo-audio";
import { appendProgressEvent } from "@/modules/progress/repository";
import type { AttemptActor } from "@/modules/attempts/types";

type PublicQuestion = PublicQuestionDefinition & { id: string; passageId: string | null; points: number };
/** A learner response for one question, validated against that question's type before it is stored. */
export type ExamAnswerInput = { questionId: string; response: unknown };
export type StoredExamAnswer = { questionId: string; response: QuestionResponse | null };
export type QuestionResult = { questionId: string; type: GradableQuestionType; response: QuestionResponse | null; answer: QuestionAnswer; correct: boolean; earnedPoints: number; availablePoints: number; explanation: string | null };
type PublicPart = { id: string; partNumber: number; title: string; instructions: string | null; skill: string | null; metadata: Record<string, unknown>; passages: Array<{ id: string; title: string | null; content: string }>; questions: PublicQuestion[] };
/** totalPoints is the number of marks (a blank or matched item is one mark); attempts store it as totalQuestions. */
export type PublicExam = { id: string; slug: string; title: string; type: "TOEIC" | "IELTS"; mode: "PRACTICE" | "MINI_TEST" | "FULL_MOCK"; durationSeconds: number; parts: PublicPart[]; totalQuestions: number; totalPoints: number };
export type ExamAttemptResult = { attempt: { id: string; status: "SUBMITTED" | "EXPIRED"; rawScore: number; totalQuestions: number; submittedAt: Date | null }; results: QuestionResult[] };

function dbOrThrow() {
  const db = createDatabase();
  if (!db) throw new Error("DATABASE_URL is required for the shared exam engine");
  return db;
}

/**
 * Listening scripts are answer material: while an attempt is running the learner only
 * gets the generated recording. The script itself is sent only when no recording exists
 * (browser speech fallback) or for the post-submit review (`transcript`).
 */
const generationOnlyKeys = new Set(["playbackText", "audioVoices", "audioVoice", "audioPauseMs"]);
export function publicPartMetadata(metadata: Record<string, unknown>, options: { includeTranscript?: boolean } = {}) {
  const rest = Object.fromEntries(Object.entries(metadata).filter(([key]) => !generationOnlyKeys.has(key)));
  const playbackText = metadata.playbackText;
  if (typeof playbackText !== "string" || !playbackText.trim()) return rest;
  const audioUrl = demoAudioUrl(playbackText);
  return { ...rest, ...(audioUrl ? { audioUrl } : { playbackText }), ...(options.includeTranscript ? { transcript: playbackText } : {}) };
}

export function withGeneratedAudio(question: PublicQuestionDefinition): PublicQuestionDefinition {
  if (question.type !== "DICTATION" || question.content.mediaId || !question.content.playbackText) return question;
  const audioUrl = demoAudioUrl(question.content.playbackText);
  if (!audioUrl) return question;
  return { ...question, content: { ...question.content, playbackText: undefined, audioUrl } };
}

function owner(actor: AttemptActor) {
  return actor.userId
    ? or(eq(attempts.userId, actor.userId), eq(attempts.guestId, actor.guestId))
    : eq(attempts.guestId, actor.guestId);
}

export function isAttemptExpired(expiresAt: Date | null, now = new Date()) {
  return Boolean(expiresAt && expiresAt <= now);
}

export function scoreStoredAnswers(questionRows: Array<{ id: string; type: string; content: unknown; answer: unknown; explanation: string | null }>, saved: StoredExamAnswer[]) {
  const answerMap = new Map(saved.map((item) => [item.questionId, item.response]));
  const results = questionRows.map((item): QuestionResult => {
    const question = parseAuthoredQuestion(item);
    const response = answerMap.get(item.id) ?? null;
    return { questionId: item.id, type: question.type, response, answer: question.answer, ...scoreQuestion(question, response), explanation: item.explanation };
  });
  return { rawScore: results.reduce((sum, item) => sum + item.earnedPoints, 0), results };
}

/** Rows written before structured answers only have the MCQ option. */
function storedResponse(row: { response: unknown; selectedOptionId: string | null }): QuestionResponse | null {
  return (row.response as QuestionResponse | null) ?? (row.selectedOptionId ? { optionId: row.selectedOptionId } : null);
}

export async function getPublicExamBySlug(slug: string, options: { includeTranscripts?: boolean } = {}): Promise<PublicExam | null> {
  const db = dbOrThrow();
  const [exam] = await db.select().from(exams).where(and(eq(exams.slug, slug), eq(exams.status, "PUBLISHED")));
  if (!exam) return null;
  const partRows = await db.select().from(examParts).where(eq(examParts.examId, exam.id)).orderBy(asc(examParts.sortOrder));
  const parts = await Promise.all(partRows.map(async (part) => {
    const passageRows = await db.select().from(passages).where(eq(passages.examPartId, part.id)).orderBy(asc(passages.sortOrder));
    const questionRows = await db.select({ id: questions.id, type: questions.type, content: questions.content, passageId: questions.passageId }).from(questions).where(and(eq(questions.examPartId, part.id), eq(questions.status, "PUBLISHED"))).orderBy(asc(questions.createdAt));
    return {
      id: part.id, partNumber: part.partNumber, title: part.title, instructions: part.instructions, skill: part.skill, metadata: publicPartMetadata(part.metadata as Record<string, unknown>, { includeTranscript: options.includeTranscripts }),
      passages: passageRows.map((item) => ({ id: item.id, title: item.title, content: item.content })),
      questions: questionRows.map((item): PublicQuestion => { const question = withGeneratedAudio(parsePublicQuestion(item)); return { ...question, id: item.id, passageId: item.passageId, points: questionPoints(question) }; })
    };
  }));
  const allQuestions = parts.flatMap((part) => part.questions);
  return { id: exam.id, slug: exam.slug, title: exam.title, type: exam.type, mode: exam.mode as PublicExam["mode"], durationSeconds: exam.durationSeconds, parts, totalQuestions: allQuestions.length, totalPoints: allQuestions.reduce((sum, question) => sum + question.points, 0) };
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
  return db.select({ id: questions.id, type: questions.type, content: questions.content, answer: questions.answer, explanation: questions.explanation }).from(questions).innerJoin(examParts, eq(questions.examPartId, examParts.id)).where(and(eq(examParts.examId, examId), eq(questions.status, "PUBLISHED")));
}

async function getSavedAnswers(attemptId: string): Promise<StoredExamAnswer[]> {
  const db = dbOrThrow();
  const rows = await db.select({ questionId: attemptAnswers.questionId, selectedOptionId: attemptAnswers.selectedOptionId, response: attemptAnswers.response }).from(attemptAnswers).where(eq(attemptAnswers.attemptId, attemptId));
  return rows.map((row) => ({ questionId: row.questionId, response: storedResponse(row) }));
}

async function validateAndPersistAnswers(attemptId: string, examId: string, answers: ExamAnswerInput[]) {
  const db = dbOrThrow();
  const allowedRows = await db.select({ id: questions.id, type: questions.type, content: questions.content }).from(questions).innerJoin(examParts, eq(questions.examPartId, examParts.id)).where(and(eq(examParts.examId, examId), eq(questions.status, "PUBLISHED")));
  const allowed = new Map(allowedRows.map((row) => [row.id, parsePublicQuestion(row)]));
  const validated = answers.map((answer) => {
    const question = allowed.get(answer.questionId);
    const response = question ? parseLearnerResponse(question, answer.response) : null;
    if (!question || !response) throw new Error("Invalid answer for this exam");
    return { questionId: answer.questionId, response, answered: isResponseAnswered(question.type, response), selectedOptionId: question.type === "MCQ" ? (response as QuestionResponse<"MCQ">).optionId : null };
  });
  for (const answer of validated) {
    // Clearing every blank or selection removes the stored answer instead of saving an empty one.
    if (!answer.answered) { await db.delete(attemptAnswers).where(and(eq(attemptAnswers.attemptId, attemptId), eq(attemptAnswers.questionId, answer.questionId))); continue; }
    await db.insert(attemptAnswers).values({ attemptId, questionId: answer.questionId, selectedOptionId: answer.selectedOptionId, response: answer.response }).onConflictDoUpdate({ target: [attemptAnswers.attemptId, attemptAnswers.questionId], set: { selectedOptionId: answer.selectedOptionId, response: answer.response, updatedAt: new Date() } });
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
  await db.insert(attempts).values({ id, examId: exam.id, userId: actor.userId, guestId: actor.guestId, status: "IN_PROGRESS", startedAt: now, expiresAt, totalQuestions: exam.totalPoints });
  await appendProgressEvent({
    userId: actor.userId, guestId: actor.guestId, type: "EXAM_STARTED", skill: null, sourceType: "EXAM_ATTEMPT", sourceId: id,
    idempotencyKey: "exam:" + id + ":started",
    metadata: { examId: exam.id, mode: exam.mode }
  });
  return { attempt: { id, examId: exam.id, userId: actor.userId, guestId: actor.guestId, status: "IN_PROGRESS" as const, startedAt: now, expiresAt, submittedAt: null, rawScore: null, totalQuestions: exam.totalPoints, answers: [] as StoredExamAnswer[] }, exam, resumed: false };
}

export async function saveExamAnswers(attemptId: string, actor: AttemptActor, answers: ExamAnswerInput[]) {
  const attempt = await getOwnedAttempt(attemptId, actor);
  if (attempt.status !== "IN_PROGRESS") throw new Error("Attempt is not editable");
  if (isAttemptExpired(attempt.expiresAt)) {
    await completeExamAttempt(attemptId, actor, true);
    throw new Error("Attempt has expired");
  }
  await validateAndPersistAnswers(attemptId, attempt.examId, answers);
  return { attemptId, savedAnswers: (await getSavedAnswers(attemptId)).length };
}

export async function submitExamAttempt(attemptId: string, actor: AttemptActor, submittedAnswers: ExamAnswerInput[]) {
  const attempt = await getOwnedAttempt(attemptId, actor);
  if (attempt.status === "IN_PROGRESS" && !isAttemptExpired(attempt.expiresAt)) await validateAndPersistAnswers(attemptId, attempt.examId, submittedAnswers);
  return completeExamAttempt(attemptId, actor, isAttemptExpired(attempt.expiresAt));
}

export async function getExamAttemptReview(slug: string, attemptId: string, actor: AttemptActor) {
  const exam = await getPublicExamBySlug(slug, { includeTranscripts: true });
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
