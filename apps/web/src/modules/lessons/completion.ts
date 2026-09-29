import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { lessonCompletions } from "@/db/schema";
import { appendProgressEvent } from "@/modules/progress/repository";
import { xpByEvent, type ProgressEvent } from "@/modules/progress/progress";
import { recordMistakes, resolveMistakes, type MistakeEntry } from "@/modules/mistakes/repository";
import { getLessonQuestionSetForScoring } from "./repository";

const notebookSkills = new Set(["LISTENING", "READING", "GRAMMAR", "SPEAKING", "WRITING"]);

export async function completeLesson(input: { lessonId: string; actor: { userId: string | null; guestId: string }; answers: Array<{ questionId: string; selectedOptionId: string }> }) {
  const scoringData = await getLessonQuestionSetForScoring(input.lessonId);
  if (!scoringData) throw new Error("Published lesson not found");
  const answers = new Map(input.answers.map((answer) => [answer.questionId, answer.selectedOptionId]));
  const reviewedQuestions = scoringData.questions.map((question) => ({ questionId: question.id, correct: answers.get(question.id) === question.correctOptionId, correctOptionId: question.correctOptionId, explanation: question.explanation }));
  const notebookSkill = notebookSkills.has(scoringData.lesson.skill ?? "") ? (scoringData.lesson.skill as MistakeEntry["skill"]) : null;
  const questionById = new Map(scoringData.questions.map((question) => [question.id, question]));
  const wrongEntries: MistakeEntry[] = reviewedQuestions.filter((question) => !question.correct && answers.has(question.questionId)).map((question) => { const source = questionById.get(question.questionId)!; return { sourceType: "LESSON", sourceId: input.lessonId, sourceTitle: scoringData.lesson.title, questionId: question.questionId, skill: notebookSkill, prompt: source.prompt, options: source.options, correctOptionId: source.correctOptionId, explanation: source.explanation }; });
  const correctIds = reviewedQuestions.filter((question) => question.correct).map((question) => question.questionId);
  await recordMistakes(input.actor, wrongEntries);
  await resolveMistakes(input.actor, correctIds);
  const rawScore = reviewedQuestions.filter((question) => question.correct).length;
  const totalQuestions = reviewedQuestions.length;
  const db = createDatabase();
  if (!db) throw new Error("DATABASE_URL is required to save lesson completion");
  const ownerKey = input.actor.userId ? `user:${input.actor.userId}` : `guest:${input.actor.guestId}`;
  const inserted = await db.insert(lessonCompletions).values({ id: randomUUID(), lessonId: input.lessonId, ownerKey, userId: input.actor.userId, guestId: input.actor.guestId, rawScore, totalQuestions, completedAt: new Date(), updatedAt: new Date() }).onConflictDoNothing().returning({ id: lessonCompletions.id });
  if (inserted.length === 0) await db.update(lessonCompletions).set({ rawScore, totalQuestions, updatedAt: new Date() }).where(and(eq(lessonCompletions.lessonId, input.lessonId), eq(lessonCompletions.ownerKey, ownerKey)));
  const skill = ["LISTENING", "SPEAKING", "READING", "WRITING"].includes(scoringData.lesson.skill ?? "") ? scoringData.lesson.skill as ProgressEvent["skill"] : null;
  let xpEarned = 0;
  if (inserted.length > 0) {
    await appendProgressEvent({ userId: input.actor.userId, guestId: input.actor.guestId, type: "LESSON_COMPLETED", skill, sourceType: "LESSON", sourceId: input.lessonId, idempotencyKey: `lesson:${input.lessonId}:${ownerKey}:completed`, metadata: { lessonId: input.lessonId, rawScore, totalQuestions } });
    xpEarned += xpByEvent.LESSON_COMPLETED;
    if (skill === "LISTENING" || skill === "READING") { await appendProgressEvent({ userId: input.actor.userId, guestId: input.actor.guestId, type: skill === "LISTENING" ? "LISTENING_COMPLETED" : "READING_COMPLETED", skill, sourceType: "LESSON", sourceId: input.lessonId, idempotencyKey: `lesson:${input.lessonId}:${ownerKey}:${skill.toLowerCase()}`, metadata: { lessonId: input.lessonId, rawScore, totalQuestions } }); xpEarned += xpByEvent[skill === "LISTENING" ? "LISTENING_COMPLETED" : "READING_COMPLETED"]; }
  }
  return { rawScore, totalQuestions, alreadyCompleted: inserted.length === 0, xpEarned, questions: reviewedQuestions };
}
