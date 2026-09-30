import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { learnerProfiles } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";

type Goal = "communication" | "toeic" | "ielts";

export type LearnerProfile = {
  id: string;
  goal: Goal;
  cefrLevel: string;
  levelSource: "SELF" | "PLACEMENT";
  minutesPerDay: number;
  placementScore: number | null;
  placementTotal: number | null;
  /** Per-skill levels from the placement test (GRAMMAR, VOCABULARY, READING, LISTENING, SPEAKING, WRITING). */
  skillLevels: Record<string, string> | null;
};

function toProfile(row: typeof learnerProfiles.$inferSelect): LearnerProfile {
  return { id: row.id, goal: row.goal as Goal, cefrLevel: row.cefrLevel, levelSource: row.levelSource as "SELF" | "PLACEMENT", minutesPerDay: row.minutesPerDay, placementScore: row.placementScore, placementTotal: row.placementTotal, skillLevels: (row.skillLevels as Record<string, string> | null) ?? null };
}

export async function findLearnerProfile(learner: LearnerRef): Promise<LearnerProfile | null> {
  const db = createDatabase();
  if (!db) return null;
  const [row] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.learnerId, learner.learnerId)).limit(1);
  return row ? toProfile(row) : null;
}

export async function upsertLearnerProfile(learner: LearnerRef, input: { goal: Goal; cefrLevel: string; levelSource: "SELF" | "PLACEMENT"; minutesPerDay: number; placementScore?: number | null; placementTotal?: number | null; skillLevels?: Record<string, string> | null }): Promise<LearnerProfile> {
  const db = createDatabase();
  if (!db) throw new Error("Database unavailable");
  const now = new Date();
  const fields = { goal: input.goal, cefrLevel: input.cefrLevel, levelSource: input.levelSource, minutesPerDay: input.minutesPerDay, placementScore: input.placementScore ?? null, placementTotal: input.placementTotal ?? null, skillLevels: input.skillLevels ?? null, updatedAt: now };
  const [row] = await db.insert(learnerProfiles).values({ id: randomUUID(), learnerId: learner.learnerId, ...fields, completedAt: now }).onConflictDoUpdate({ target: learnerProfiles.learnerId, set: fields }).returning();
  return toProfile(row);
}
