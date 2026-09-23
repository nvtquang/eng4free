import { NextResponse } from "next/server";
import { z } from "zod";
import { guestCookieName, getRequestActor } from "@/modules/auth/request-actor";
import { completeLesson } from "@/modules/lessons/completion";

const CompletionSchema = z.object({ answers: z.array(z.object({ questionId: z.string().uuid(), selectedOptionId: z.string().min(1).max(64) })).max(100) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lessonId = z.string().uuid().safeParse(id);
  const body = CompletionSchema.safeParse(await request.json().catch(() => null));
  if (!lessonId.success || !body.success) return NextResponse.json({ error: "Invalid lesson completion payload" }, { status: 400 });
  try {
    const { actor, createdGuestId } = await getRequestActor(true);
    const result = await completeLesson({ lessonId: lessonId.data, actor, answers: body.data.answers });
    const response = NextResponse.json(result);
    if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not complete lesson" }, { status: 400 });
  }
}
