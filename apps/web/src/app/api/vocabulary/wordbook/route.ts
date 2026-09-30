import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestLearner, guestCookieName } from "@/modules/auth/request-actor";
import { addToWordbook } from "@/modules/vocabulary/review-schedule";

const Schema = z.object({ vocabularyId: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid wordbook request" }, { status: 400 });
  const { learner: actor, createdGuestId } = await getRequestLearner(true);
  const result = await addToWordbook(actor, parsed.data.vocabularyId);
  if (!result) return NextResponse.json({ error: "Vocabulary not found" }, { status: 404 });
  const response = NextResponse.json({ saved: true, added: result.added });
  if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
