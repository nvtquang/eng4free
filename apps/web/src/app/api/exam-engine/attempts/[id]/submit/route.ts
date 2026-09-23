import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor } from "@/modules/auth/request-actor";
import { submitExamAttempt } from "@/modules/exams/exam-engine";
const Schema = z.object({ answers: z.array(z.object({ questionId: z.string().uuid(), selectedOptionId: z.string().min(1).max(128) })).max(250) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { const parsed = Schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid submission" }, { status: 400 }); try { const { id } = await params; const { actor } = await getRequestActor(false); return NextResponse.json(await submitExamAttempt(id, actor, parsed.data.answers)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not submit exam" }, { status: 400 }); } }
