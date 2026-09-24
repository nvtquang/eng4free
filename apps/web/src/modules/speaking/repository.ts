import { randomUUID } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { SpeakingFeedbackSchema, type SpeakingFeedback, type SpeakingSessionInput } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { media, speakingSessions, speakingTurns } from "@/db/schema";
import { readLocalRecording, saveLocalRecording } from "@/modules/media/local-media-service";
import { appendProgressEvent } from "@/modules/progress/repository";

export type SpeakingActor = { userId: string | null; guestId: string };
function ownerCondition(actor: SpeakingActor) { return actor.userId ? or(eq(speakingSessions.userId, actor.userId), eq(speakingSessions.guestId, actor.guestId)) : eq(speakingSessions.guestId, actor.guestId); }

export async function createSpeakingSession(actor: SpeakingActor, input: SpeakingSessionInput) {
  const db = createDatabase(); if (!db) throw new Error("DATABASE_URL is required to save speaking sessions");
  const id = randomUUID();
  await db.insert(speakingSessions).values({ id, userId: actor.userId, guestId: actor.guestId, examType: input.examType ?? null, promptId: input.promptId, prompt: input.prompt, status: "IN_PROGRESS" });
  return { id };
}

export async function saveSpeakingRecording(actor: SpeakingActor, input: { sessionId: string; bytes: Uint8Array; contentType: string; durationMs: number }) {
  const db = createDatabase(); if (!db) throw new Error("DATABASE_URL is required to save speaking sessions");
  const [session] = await db.select().from(speakingSessions).where(and(eq(speakingSessions.id, input.sessionId), ownerCondition(actor)));
  if (!session) throw new Error("Speaking session not found");
  if (session.status !== "IN_PROGRESS") throw new Error("Speaking session is already completed");
  const stored = await saveLocalRecording({ bytes: input.bytes, contentType: input.contentType });
  const mediaId = randomUUID(); const turnId = randomUUID(); const completedAt = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(media).values({ id: mediaId, ownerUserId: actor.userId, ownerGuestId: actor.guestId, kind: "RECORDING", storageKey: stored.storageKey, contentType: input.contentType, byteSize: stored.byteSize, status: "READY" });
    await tx.insert(speakingTurns).values({ id: turnId, sessionId: session.id, turnOrder: 1, prompt: session.prompt, audioMediaId: mediaId, durationMs: input.durationMs });
    await tx.update(speakingSessions).set({ status: "COMPLETED", completedAt }).where(eq(speakingSessions.id, session.id));
  });
  await appendProgressEvent({ userId: actor.userId, guestId: actor.guestId, type: "SPEAKING_COMPLETED", skill: "SPEAKING", sourceType: "SPEAKING_SESSION", sourceId: session.id, idempotencyKey: `speaking:${session.id}:completed`, metadata: { durationMs: input.durationMs } });
  return { sessionId: session.id, turnId, mediaId, playbackUrl: `/api/media/${mediaId}` };
}

export async function listSpeakingHistory(actor: SpeakingActor) {
  const db = createDatabase(); if (!db) return [];
  const sessions = await db.select().from(speakingSessions).where(ownerCondition(actor)).orderBy(desc(speakingSessions.createdAt)).limit(30);
  return Promise.all(sessions.map(async (session) => ({
    ...session,
    turns: (await db.select({ id: speakingTurns.id, durationMs: speakingTurns.durationMs, audioMediaId: speakingTurns.audioMediaId, transcript: speakingTurns.transcript, feedback: speakingTurns.feedback, createdAt: speakingTurns.createdAt }).from(speakingTurns).where(eq(speakingTurns.sessionId, session.id))).map((turn) => {
      const parsed = SpeakingFeedbackSchema.safeParse(turn.feedback);
      return { ...turn, feedback: parsed.success ? parsed.data : null };
    })
  })));
}

export async function findOwnedMedia(actor: SpeakingActor, mediaId: string) {
  const db = createDatabase(); if (!db) return null;
  const owner = actor.userId ? or(eq(media.ownerUserId, actor.userId), eq(media.ownerGuestId, actor.guestId)) : eq(media.ownerGuestId, actor.guestId);
  const [item] = await db.select().from(media).where(and(eq(media.id, mediaId), owner, eq(media.status, "READY")));
  return item ?? null;
}

export async function loadSpeakingTurnAudio(actor: SpeakingActor, sessionId: string) {
  const db = createDatabase(); if (!db) throw new Error("DATABASE_URL is required to analyze speaking");
  const [session] = await db.select().from(speakingSessions).where(and(eq(speakingSessions.id, sessionId), ownerCondition(actor)));
  if (!session) return null;
  const [turn] = await db.select({ id: speakingTurns.id, prompt: speakingTurns.prompt, audioMediaId: speakingTurns.audioMediaId, transcript: speakingTurns.transcript, feedback: speakingTurns.feedback, storageKey: media.storageKey, contentType: media.contentType }).from(speakingTurns).innerJoin(media, eq(speakingTurns.audioMediaId, media.id)).where(eq(speakingTurns.sessionId, session.id)).orderBy(desc(speakingTurns.createdAt)).limit(1);
  if (!turn || !turn.storageKey.startsWith("local-recordings/")) return null;
  return { ...turn, prompt: turn.prompt ?? session.prompt, bytes: new Uint8Array(await readLocalRecording(turn.storageKey)) };
}

export async function saveSpeakingAnalysis(actor: SpeakingActor, input: { sessionId: string; turnId: string; transcript: string; feedback: SpeakingFeedback | null }) {
  const db = createDatabase(); if (!db) throw new Error("DATABASE_URL is required to save speaking feedback");
  const [session] = await db.select({ id: speakingSessions.id }).from(speakingSessions).where(and(eq(speakingSessions.id, input.sessionId), ownerCondition(actor)));
  if (!session) throw new Error("Speaking session not found");
  const [updated] = await db.update(speakingTurns).set({ transcript: input.transcript, feedback: input.feedback }).where(and(eq(speakingTurns.id, input.turnId), eq(speakingTurns.sessionId, session.id))).returning({ id: speakingTurns.id });
  if (!updated) throw new Error("Speaking turn not found");
  return updated.id;
}
