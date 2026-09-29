import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { learnerProfiles } from "@/db/schema";
import { vocabularyOwnerKey } from "@/modules/vocabulary/review-schedule";

type Actor = { userId: string | null; guestId: string };
type Goal = "communication" | "toeic" | "ielts";

export type LearnerProfile = {
  id: string;
  ownerKey: string;
  goal: Goal;
  cefrLevel: string;
  levelSource: "SELF" | "PLACEMENT";
  minutesPerDay: number;
  placementScore: number | null;
  placementTotal: number | null;
};

export async function findLearnerProfile(actor: Actor): Promise<LearnerProfile | null> {
  const db = createDatabase();
  if (!db) return null;
  const ownerKey = vocabularyOwnerKey(actor);
  const [row] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.ownerKey, ownerKey)).limit(1);
  if (!row) return null;
  return { id: row.id, ownerKey: row.ownerKey, goal: row.goal as Goal, cefrLevel: row.cefrLevel, levelSource: row.levelSource as "SELF" | "PLACEMENT", minutesPerDay: row.minutesPerDay, placementScore: row.placementScore, placementTotal: row.placementTotal };
}

export async function upsertLearnerProfile(actor: Actor, input: { goal: Goal; cefrLevel: string; levelSource: "SELF" | "PLACEMENT"; minutesPerDay: number; placementScore?: number | null; placementTotal?: number | null }): Promise<LearnerProfile> {
  const db = createDatabase();
  if (!db) throw new Error("Database unavailable");
  const ownerKey = vocabularyOwnerKey(actor);
  const now = new Date();
  const values = { id: randomUUID(), ownerKey, userId: actor.userId, guestId: actor.guestId, goal: input.goal, cefrLevel: input.cefrLevel, levelSource: input.levelSource, minutesPerDay: input.minutesPerDay, placementScore: input.placementScore ?? null, placementTotal: input.placementTotal ?? null, completedAt: now, updatedAt: now };
  const [row] = await db.insert(learnerProfiles).values(values).onConflictDoUpdate({ target: learnerProfiles.ownerKey, set: { goal: input.goal, cefrLevel: input.cefrLevel, levelSource: input.levelSource, minutesPerDay: input.minutesPerDay, placementScore: input.placementScore ?? null, placementTotal: input.placementTotal ?? null, userId: actor.userId, guestId: actor.guestId, updatedAt: now } }).returning();
  return { id: row.id, ownerKey: row.ownerKey, goal: row.goal as Goal, cefrLevel: row.cefrLevel, levelSource: row.levelSource as "SELF" | "PLACEMENT", minutesPerDay: row.minutesPerDay, placementScore: row.placementScore, placementTotal: row.placementTotal };
}
