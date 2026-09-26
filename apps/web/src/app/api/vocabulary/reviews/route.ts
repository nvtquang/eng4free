import { NextResponse } from "next/server";
import { z } from "zod";
import { REVIEW_RATINGS } from "@english4free/srs";
import { getRequestActor, guestCookieName } from "@/modules/auth/request-actor";
import { recordVocabularyReview } from "@/modules/vocabulary/review-schedule";

const Schema = z.object({ vocabularyId: z.string().uuid(), rating: z.enum(REVIEW_RATINGS), eventId: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid vocabulary review" }, { status: 400 });
  const { actor, createdGuestId } = await getRequestActor(true);
  const result = await recordVocabularyReview({ actor, ...parsed.data });
  if (!result) return NextResponse.json({ error: "Vocabulary not found" }, { status: 404 });
  const response = NextResponse.json({ saved: true, dueAt: result.dueAt.toISOString() });
  if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
