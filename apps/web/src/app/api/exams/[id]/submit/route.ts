import { NextResponse } from "next/server";
import { SubmitAttemptSchema } from "@english4free/content-schemas";
import { TOEIC_PART_5_EXAM_ID } from "@/modules/exams/toeic-part-5";
import { getAttemptRepository } from "@/modules/attempts/repository";
import { submitToeicPart5Attempt } from "@/modules/attempts/use-cases";
import { getRequestActor } from "@/modules/auth/request-actor";
import { appendProgressEvent } from "@/modules/progress/repository";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id: examId } = await context.params;
  const parsed = SubmitAttemptSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (examId !== TOEIC_PART_5_EXAM_ID) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  try {
    // The server loads private question keys; clients send selected option IDs only.
    const { actor } = await getRequestActor();
    const result = await submitToeicPart5Attempt(getAttemptRepository(), parsed.data.attemptId, actor, parsed.data.answers);
    await appendProgressEvent({ userId: actor.userId, guestId: actor.guestId, type: "EXAM_COMPLETED", skill: "READING", sourceType: "EXAM_ATTEMPT", sourceId: result.attempt.id, idempotencyKey: `exam:${result.attempt.id}:completed`, metadata: { examId, attemptId: result.attempt.id, rawScore: result.attempt.rawScore } });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not submit attempt" }, { status: 400 });
  }
}
