import { NextResponse } from "next/server";
import { getRequestActor } from "@/modules/auth/request-actor";
import { ExamAnswersSchema, toExamAnswerInputs } from "@/modules/exams/answer-input";
import { submitExamAttempt } from "@/modules/exams/exam-engine";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { const parsed = ExamAnswersSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid submission" }, { status: 400 }); try { const { id } = await params; const { actor } = await getRequestActor(false); return NextResponse.json(await submitExamAttempt(id, actor, toExamAnswerInputs(parsed.data.answers))); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not submit exam" }, { status: 400 }); } }
