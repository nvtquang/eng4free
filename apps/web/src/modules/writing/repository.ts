import { randomUUID } from "crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { WritingFeedbackSchema, type WritingFeedback, type WritingPersistence } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { writingFeedback, writingRevisions, writingSubmissions } from "@/db/schema";
import { appendProgressEvent } from "@/modules/progress/repository";

export type WritingActor = { userId: string | null; guestId: string };
export function countWords(text: string) { const trimmed = text.trim(); return trimmed ? trimmed.split(/\s+/u).length : 0; }
function ownerCondition(actor: WritingActor) { return actor.userId ? or(eq(writingSubmissions.userId, actor.userId), eq(writingSubmissions.guestId, actor.guestId)) : eq(writingSubmissions.guestId, actor.guestId); }
export async function saveWritingSubmission(actor: WritingActor, input: WritingPersistence) {
  const db = createDatabase(); if (!db) throw new Error("DATABASE_URL is required to save writing"); const now = new Date(); const wordCount = countWords(input.text); const submittedAt = input.action === "SUBMIT" ? now : null;
  if (!input.submissionId) { const id = randomUUID(); await db.transaction(async (tx) => { await tx.insert(writingSubmissions).values({ id, userId: actor.userId, guestId: actor.guestId, examType: input.examType ?? null, promptId: input.promptId, taskType: input.taskType, prompt: { text: input.promptText }, text: input.text, wordCount, status: input.action === "SUBMIT" ? "SUBMITTED" : "DRAFT", createdAt: now, updatedAt: now, submittedAt }); await tx.insert(writingRevisions).values({ id: randomUUID(), submissionId: id, text: input.text, wordCount, createdAt: now }); }); if (input.action === "SUBMIT") await appendProgressEvent({ userId: actor.userId, guestId: actor.guestId, type: "WRITING_SUBMITTED", skill: "WRITING", sourceType: "WRITING_SUBMISSION", sourceId: id, idempotencyKey: `writing:${id}:submitted`, metadata: { wordCount, taskType: input.taskType } }); return { id, status: input.action === "SUBMIT" ? "SUBMITTED" as const : "DRAFT" as const, wordCount, updatedAt: now }; }
  const [existing] = await db.select().from(writingSubmissions).where(and(eq(writingSubmissions.id, input.submissionId), ownerCondition(actor)));
  if (!existing) throw new Error("Writing submission not found");
  await db.transaction(async (tx) => { if (existing.text !== input.text) await tx.insert(writingRevisions).values({ id: randomUUID(), submissionId: existing.id, text: input.text, wordCount, createdAt: now }); await tx.update(writingSubmissions).set({ text: input.text, wordCount, status: input.action === "SUBMIT" ? "SUBMITTED" : "DRAFT", updatedAt: now, submittedAt: submittedAt ?? existing.submittedAt }).where(eq(writingSubmissions.id, existing.id)); });
  if (input.action === "SUBMIT") await appendProgressEvent({ userId: actor.userId, guestId: actor.guestId, type: "WRITING_SUBMITTED", skill: "WRITING", sourceType: "WRITING_SUBMISSION", sourceId: existing.id, idempotencyKey: `writing:${existing.id}:submitted`, metadata: { wordCount, taskType: input.taskType } });
  return { id: existing.id, status: input.action === "SUBMIT" ? "SUBMITTED" as const : "DRAFT" as const, wordCount, updatedAt: now };
}

export async function findOwnedWritingSubmission(actor: WritingActor, submissionId: string) {
  const db = createDatabase();
  if (!db) throw new Error("DATABASE_URL is required to evaluate writing");
  const [submission] = await db.select().from(writingSubmissions).where(and(eq(writingSubmissions.id, submissionId), ownerCondition(actor)));
  if (!submission) return null;
  const [revision] = await db.select().from(writingRevisions).where(eq(writingRevisions.submissionId, submission.id)).orderBy(desc(writingRevisions.createdAt)).limit(1);
  return { ...submission, prompt: submission.prompt as { text?: string }, revision: revision ?? null };
}

/** One provider result per revision keeps retries idempotent while preserving revision history. */
export async function saveWritingFeedback(actor: WritingActor, input: { submissionId: string; feedback: WritingFeedback; provider: string; model: string | null }) {
  const db = createDatabase();
  if (!db) throw new Error("DATABASE_URL is required to save writing feedback");
  const submission = await findOwnedWritingSubmission(actor, input.submissionId);
  if (!submission) throw new Error("Writing submission not found");
  if (!submission.revision) throw new Error("Writing submission has no revision to evaluate");
  const [existing] = await db.select({ id: writingFeedback.id }).from(writingFeedback).where(and(eq(writingFeedback.revisionId, submission.revision.id), eq(writingFeedback.provider, input.provider))).limit(1);
  const now = new Date();
  if (existing) {
    await db.update(writingFeedback).set({ model: input.model, kind: "AI_PRACTICE", content: input.feedback }).where(eq(writingFeedback.id, existing.id));
  } else {
    await db.insert(writingFeedback).values({ id: randomUUID(), submissionId: submission.id, revisionId: submission.revision.id, provider: input.provider, model: input.model, kind: "AI_PRACTICE", content: input.feedback, createdAt: now });
  }
  await db.update(writingSubmissions).set({ status: "EVALUATED", updatedAt: now }).where(eq(writingSubmissions.id, submission.id));
  return { submissionId: submission.id, revisionId: submission.revision.id, savedAt: now };
}

export async function listWritingHistory(actor: WritingActor) {
  const db = createDatabase(); if (!db) return [];
  const submissions = await db.select().from(writingSubmissions).where(ownerCondition(actor)).orderBy(desc(writingSubmissions.updatedAt)).limit(30);
  return Promise.all(submissions.map(async (submission) => ({
    ...submission,
    prompt: submission.prompt as { text?: string },
    revisions: await db.select({ id: writingRevisions.id, text: writingRevisions.text, wordCount: writingRevisions.wordCount, createdAt: writingRevisions.createdAt }).from(writingRevisions).where(eq(writingRevisions.submissionId, submission.id)).orderBy(desc(writingRevisions.createdAt)),
    feedback: (await db.select({ id: writingFeedback.id, revisionId: writingFeedback.revisionId, provider: writingFeedback.provider, model: writingFeedback.model, content: writingFeedback.content, createdAt: writingFeedback.createdAt }).from(writingFeedback).where(eq(writingFeedback.submissionId, submission.id)).orderBy(desc(writingFeedback.createdAt))).flatMap((item) => {
      const content = WritingFeedbackSchema.safeParse(item.content);
      return content.success ? [{ ...item, content: content.data }] : [];
    })
  })));
}
