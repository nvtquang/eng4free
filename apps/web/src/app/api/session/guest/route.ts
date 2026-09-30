import { NextResponse } from "next/server";
import { getRequestLearner, guestCookieName } from "@/modules/auth/request-actor";

export async function POST() {
  const { createdGuestId } = await getRequestLearner(true);
  const response = NextResponse.json({ ready: true });
  if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}
