import { randomUUID } from "crypto";
import { and, desc, eq, or } from "drizzle-orm";
import type { WritingPersistence } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { writingRevisions, writingSubmissions } from "@/db/schema";
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
export async function listWritingHistory(actor: WritingActor) { const db = createDatabase(); if (!db) return []; const submissions = await db.select().from(writingSubmissions).where(ownerCondition(actor)).orderBy(desc(writingSubmissions.updatedAt)).limit(30); return Promise.all(submissions.map(async (submission) => ({ ...submission, prompt: submission.prompt as { text?: string }, revisions: await db.select({ id: writingRevisions.id, text: writingRevisions.text, wordCount: writingRevisions.wordCount, createdAt: writingRevisions.createdAt }).from(writingRevisions).where(eq(writingRevisions.submissionId, submission.id)).orderBy(desc(writingRevisions.createdAt)) })));
}
