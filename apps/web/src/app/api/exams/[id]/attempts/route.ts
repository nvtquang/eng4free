import { NextResponse } from "next/server";
import { TOEIC_PART_5_EXAM_ID } from "@/modules/exams/toeic-part-5";
import { getAttemptRepository } from "@/modules/attempts/repository";
import { startToeicPart5Attempt } from "@/modules/attempts/use-cases";
import { getRequestActor, guestCookieName } from "@/modules/auth/request-actor";

type Context = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: Context) {
  const { id } = await context.params;
  if (id !== TOEIC_PART_5_EXAM_ID) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const { actor, createdGuestId } = await getRequestActor(true);
  const started = await startToeicPart5Attempt(getAttemptRepository(), actor);
  const response = NextResponse.json(started, { status: 201 });
  if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
