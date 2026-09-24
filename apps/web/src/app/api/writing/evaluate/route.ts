import { WritingEvaluationRequestSchema } from "@english4free/content-schemas";
import { HttpWritingService } from "@/modules/ai-writing/writing-service";
import { AiRateLimitError } from "@/modules/ai-foundation/contracts";
import { getRequestActor } from "@/modules/auth/request-actor";
import { findOwnedWritingSubmission, saveWritingFeedback } from "@/modules/writing/repository";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = WritingEvaluationRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid writing evaluation request", details: parsed.error.flatten() }, { status: 400 });
  try {
    const { actor } = await getRequestActor(false);
    const submission = await findOwnedWritingSubmission(actor, parsed.data.submissionId);
    if (!submission || !submission.submittedAt) return NextResponse.json({ error: "Submitted writing was not found" }, { status: 404 });
    const taskType = submission.taskType === "IELTS_TASK_1" || submission.taskType === "IELTS_TASK_2" ? submission.taskType : "GENERAL";
    const evaluation = await new HttpWritingService(actor).evaluate({ promptId: submission.promptId, taskType, text: submission.text, language: "en", expectedMinimumWords: taskType === "IELTS_TASK_2" ? 250 : taskType === "IELTS_TASK_1" ? 150 : undefined });
    const saved = evaluation.feedback ? await saveWritingFeedback(actor, { submissionId: submission.id, feedback: evaluation.feedback, provider: "gemini", model: process.env.GEMINI_MODEL?.trim() || null }) : null;
    return NextResponse.json({ submissionId: submission.id, ...evaluation, savedAt: saved?.savedAt ?? null });
  } catch (error) {
    if (error instanceof AiRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ error: "Writing service unavailable" }, { status: 503 });
  }
}
