import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor, guestCookieName } from "@/modules/auth/request-actor";
import { resolveMistakes } from "@/modules/mistakes/repository";

const Schema = z.object({ questionId: z.string().min(1).max(128) });

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid resolve request" }, { status: 400 });
  const { actor, createdGuestId } = await getRequestActor(true);
  await resolveMistakes(actor, [parsed.data.questionId]);
  const response = NextResponse.json({ resolved: true });
  if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
