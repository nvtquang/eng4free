import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor, guestCookieName } from "@/modules/auth/request-actor";
import { upsertLearnerProfile } from "@/modules/onboarding/repository";
import { scorePlacement } from "@/modules/placement/scoring";

const cefr = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
const Schema = z.object({
  goal: z.enum(["communication", "toeic", "ielts"]),
  minutesPerDay: z.number().int().min(5).max(240),
  selfLevel: cefr.optional(),
  placementAnswers: z.array(z.object({ questionId: z.string(), selectedIndex: z.number().int().min(0).max(2) })).optional()
}).refine((data) => data.selfLevel || (data.placementAnswers && data.placementAnswers.length > 0), { message: "Provide a self-assessed level or placement answers" });

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid onboarding submission" }, { status: 400 });
  const { goal, minutesPerDay, selfLevel, placementAnswers } = parsed.data;
  const { actor, createdGuestId } = await getRequestActor(true);

  let cefrLevel: string;
  let levelSource: "SELF" | "PLACEMENT";
  let placementScore: number | null = null;
  let placementTotal: number | null = null;
  if (placementAnswers && placementAnswers.length > 0) {
    const result = scorePlacement(placementAnswers);
    cefrLevel = result.cefrLevel;
    levelSource = "PLACEMENT";
    placementScore = result.score;
    placementTotal = result.total;
  } else {
    cefrLevel = selfLevel!;
    levelSource = "SELF";
  }

  const profile = await upsertLearnerProfile(actor, { goal, cefrLevel, levelSource, minutesPerDay, placementScore, placementTotal });
  const response = NextResponse.json({ saved: true, profile: { goal: profile.goal, cefrLevel: profile.cefrLevel, levelSource: profile.levelSource, minutesPerDay: profile.minutesPerDay, placementScore: profile.placementScore, placementTotal: profile.placementTotal } });
  if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
