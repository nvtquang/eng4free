import { and, eq, inArray, lt, notExists, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { learnerLinks, learners, media, progressEvents, rateLimitCounters, telemetryEvents } from "@/db/schema";
import { deleteLearnerRecordings, deleteRecordings } from "./data";

/** How long data is kept; the privacy page states the same numbers. */
export type RetentionPolicy = { recordingDays: number; guestDays: number; emptyGuestDays: number; telemetryDays: number };

function days(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function retentionPolicyFromEnv(env: Record<string, string | undefined> = process.env): RetentionPolicy {
  return {
    recordingDays: days(env.RECORDING_RETENTION_DAYS, 180),
    guestDays: days(env.GUEST_RETENTION_DAYS, 365),
    emptyGuestDays: days(env.EMPTY_GUEST_RETENTION_DAYS, 30),
    telemetryDays: days(env.TELEMETRY_RETENTION_DAYS, 90)
  };
}

const daysBefore = (now: Date, count: number) => new Date(now.getTime() - count * 24 * 60 * 60 * 1000);

export type RetentionPlan = { recordingIds: string[]; inactiveGuestIds: string[]; emptyGuestIds: string[] };

/**
 * What the policy removes now: speaking recordings older than `recordingDays` (transcripts and
 * feedback stay), guest learners not seen for `guestDays`, and guest learners who never did
 * anything and have not been seen for `emptyGuestDays`. Learners linked to an account are kept.
 */
export async function planRetention(db: Database, policy: RetentionPolicy, now = new Date()): Promise<RetentionPlan> {
  const hasAccount = db.select({ one: sql`1` }).from(learnerLinks).where(and(eq(learnerLinks.learnerId, learners.id), eq(learnerLinks.kind, "USER")));
  const hasActivity = db.select({ one: sql`1` }).from(progressEvents).where(eq(progressEvents.learnerId, learners.id));
  const recordings = await db.select({ id: media.id }).from(media).where(and(eq(media.kind, "RECORDING"), lt(media.createdAt, daysBefore(now, policy.recordingDays))));
  const inactive = await db.select({ id: learners.id }).from(learners).where(and(notExists(hasAccount), lt(learners.lastSeenAt, daysBefore(now, policy.guestDays))));
  const empty = await db.select({ id: learners.id }).from(learners).where(and(notExists(hasAccount), notExists(hasActivity), lt(learners.lastSeenAt, daysBefore(now, policy.emptyGuestDays))));
  const inactiveIds = new Set(inactive.map((row) => row.id));
  return { recordingIds: recordings.map((row) => row.id), inactiveGuestIds: [...inactiveIds], emptyGuestIds: empty.map((row) => row.id).filter((id) => !inactiveIds.has(id)) };
}

/** Carries out a plan by the exact ids it lists. Returns how many recording files were removed. */
export async function applyRetention(db: Database, plan: RetentionPlan): Promise<{ recordingFiles: number; learners: number }> {
  const guestIds = [...plan.inactiveGuestIds, ...plan.emptyGuestIds];
  const recordingFiles = await deleteLearnerRecordings(db, guestIds) + await deleteRecordings(db, plan.recordingIds);
  if (guestIds.length) await db.delete(learners).where(inArray(learners.id, guestIds));
  return { recordingFiles, learners: guestIds.length };
}

/** Removes rate-limit windows that have ended and telemetry older than `telemetryDays`; neither holds learner data. */
export async function pruneOperationalData(db: Database, policy: RetentionPolicy, now = new Date()): Promise<{ counters: number; telemetry: number }> {
  const counters = await db.delete(rateLimitCounters).where(lt(rateLimitCounters.expiresAt, now)).returning({ key: rateLimitCounters.key });
  const telemetry = await db.delete(telemetryEvents).where(lt(telemetryEvents.createdAt, daysBefore(now, policy.telemetryDays))).returning({ id: telemetryEvents.id });
  return { counters: counters.length, telemetry: telemetry.length };
}
