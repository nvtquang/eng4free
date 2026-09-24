import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { TutorFeedbackSchema, type TutorFeedback } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { tutorFeedback } from "@/db/schema";
import type { AttemptActor } from "@/modules/attempts/types";

export async function saveTutorFeedback(actor: AttemptActor, input: { attemptId: string; questionId: string; learnerAnswer: string; feedback: TutorFeedback }) {
  const db = createDatabase();
  if (!db) return null;
  const provider = input.feedback.providerUsed ? "gemini" : "official-explanation";
  const [existing] = await db.select({ id: tutorFeedback.id }).from(tutorFeedback).where(and(eq(tutorFeedback.attemptId, input.attemptId), eq(tutorFeedback.questionId, input.questionId), eq(tutorFeedback.learnerAnswer, input.learnerAnswer))).limit(1);
  if (existing) {
    await db.update(tutorFeedback).set({ provider, content: input.feedback }).where(eq(tutorFeedback.id, existing.id));
    return existing.id;
  }
  const id = randomUUID();
  await db.insert(tutorFeedback).values({ id, attemptId: input.attemptId, questionId: input.questionId, learnerAnswer: input.learnerAnswer, provider, content: input.feedback });
  return id;
}

export async function listTutorFeedback(actor: AttemptActor, attemptId: string) {
  const db = createDatabase();
  if (!db) return [];
  const rows = await db.select().from(tutorFeedback).where(eq(tutorFeedback.attemptId, attemptId)).orderBy(asc(tutorFeedback.createdAt));
  return rows.flatMap((row) => {
    const content = TutorFeedbackSchema.safeParse(row.content);
    return content.success ? [{ id: row.id, questionId: row.questionId, learnerAnswer: row.learnerAnswer, feedback: content.data, createdAt: row.createdAt }] : [];
  });
}
