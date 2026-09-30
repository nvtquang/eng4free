import { NextResponse } from "next/server";
import { z } from "zod";
import { TutorRequestSchema } from "@english4free/content-schemas";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { HttpTutorService } from "@/modules/ai-tutor/tutor-service";
import { findReviewableAttempt, loadTutorContext } from "@/modules/ai-tutor/context";
import { listTutorFeedback, saveTutorFeedback } from "@/modules/ai-tutor/repository";
import { AiRateLimitError } from "@/modules/ai-foundation/contracts";

export async function GET(request: Request) {
  const attemptId = z.string().uuid().safeParse(new URL(request.url).searchParams.get("attemptId"));
  if (!attemptId.success) return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
  try {
    const { learner } = await getRequestLearner();
    const attempt = await findReviewableAttempt(learner, attemptId.data);
    if (!attempt) return NextResponse.json({ error: "Submitted attempt not found" }, { status: 404 });
    return NextResponse.json({ feedback: await listTutorFeedback(learner, attempt.id) });
  } catch {
    return NextResponse.json({ error: "Submitted attempt not found" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const parsed = TutorRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tutor request" }, { status: 400 });
  try {
    const { learner } = await getRequestLearner();
    const context = await loadTutorContext(learner, parsed.data.attemptId, parsed.data.questionId);
    if (!context) return NextResponse.json({ error: "Question not found in this submitted attempt" }, { status: 404 });
    const feedback = await new HttpTutorService(learner).explain(context);
    const feedbackId = await saveTutorFeedback(learner, { attemptId: context.attemptId, questionId: context.questionId, learnerAnswer: context.learnerAnswer, feedback });
    return NextResponse.json({ ...feedback, feedbackId });
  } catch (error) {
    if (error instanceof AiRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ error: "Tutor service unavailable" }, { status: 503 });
  }
}
