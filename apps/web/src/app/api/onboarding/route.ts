import { captureEvent } from "@/lib/observability";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestLearner, guestCookieName } from "@/modules/auth/request-actor";
import { upsertLearnerProfile } from "@/modules/onboarding/repository";
import { CEFR_ORDER } from "@/modules/placement/adaptive";
import { findCompletedPlacement } from "@/modules/placement/service";

const Schema = z.object({
  goal: z.enum(["communication", "toeic", "ielts"]),
  minutesPerDay: z.number().int().min(5).max(240),
  selfLevel: z.enum(CEFR_ORDER).optional(),
  placementAttemptId: z.string().uuid().optional()
}).refine((data) => data.selfLevel || data.placementAttemptId, { message: "Provide a self-assessed level or a completed placement test" });

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid onboarding submission" }, { status: 400 });
  const { goal, minutesPerDay, selfLevel, placementAttemptId } = parsed.data;
  const { learner, createdGuestId } = await getRequestLearner(true);

  let fields: { cefrLevel: string; levelSource: "SELF" | "PLACEMENT"; placementScore: number | null; placementTotal: number | null; skillLevels: Record<string, string> | null };
  if (placementAttemptId) {
    // The level always comes from the stored result of this learner's own run, never from the request.
    const result = await findCompletedPlacement(learner, placementAttemptId);
    if (!result) return NextResponse.json({ error: "Finish the placement test first" }, { status: 409 });
    fields = { cefrLevel: result.overall, levelSource: "PLACEMENT", placementScore: result.correct, placementTotal: result.total, skillLevels: { ...result.skills, ...result.selfAssessed } };
  } else {
    fields = { cefrLevel: selfLevel!, levelSource: "SELF", placementScore: null, placementTotal: null, skillLevels: null };
  }

  const profile = await upsertLearnerProfile(learner, { goal, minutesPerDay, ...fields });
  await captureEvent({ name: "onboarding_completed", properties: { goal, minutesPerDay, level: fields.cefrLevel, levelSource: fields.levelSource } });
  const response = NextResponse.json({ saved: true, profile: { goal: profile.goal, cefrLevel: profile.cefrLevel, levelSource: profile.levelSource, minutesPerDay: profile.minutesPerDay, placementScore: profile.placementScore, placementTotal: profile.placementTotal, skillLevels: profile.skillLevels } });
  if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
