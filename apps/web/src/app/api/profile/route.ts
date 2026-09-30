import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { findLearnerProfile, upsertLearnerProfile } from "@/modules/onboarding/repository";

const Schema = z.object({ goal: z.enum(["communication", "toeic", "ielts"]), minutesPerDay: z.number().int().min(5).max(240) });

/** Changes the goal and daily minutes; the level and placement results stay as they are. */
export async function PATCH(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile update" }, { status: 400 });
  try {
    const { learner } = await getRequestLearner(false);
    const current = await findLearnerProfile(learner);
    if (!current) return NextResponse.json({ error: "Finish onboarding first" }, { status: 404 });
    const profile = await upsertLearnerProfile(learner, { ...parsed.data, cefrLevel: current.cefrLevel, levelSource: current.levelSource, placementScore: current.placementScore, placementTotal: current.placementTotal, skillLevels: current.skillLevels });
    return NextResponse.json({ goal: profile.goal, minutesPerDay: profile.minutesPerDay });
  } catch {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
}
