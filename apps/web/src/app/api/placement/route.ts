import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestLearner, guestCookieName } from "@/modules/auth/request-actor";
import { CEFR_ORDER } from "@/modules/placement/adaptive";
import { PlacementNotFoundError, startPlacement } from "@/modules/placement/service";

const StartSchema = z.object({ startLevel: z.enum(CEFR_ORDER).optional() });

/** Starts a placement run; the first question comes back without its answer key. */
export async function POST(request: Request) {
  const parsed = StartSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid start level" }, { status: 400 });
  try {
    const { learner, createdGuestId } = await getRequestLearner(true);
    const response = NextResponse.json(await startPlacement(learner, parsed.data.startLevel));
    if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    if (error instanceof PlacementNotFoundError) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ error: "Could not start the placement test" }, { status: 503 });
  }
}
