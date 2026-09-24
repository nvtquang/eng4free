import { NextResponse } from "next/server";
import { TutorRequestSchema } from "@english4free/content-schemas";
import { getRequestActor } from "@/modules/auth/request-actor";
import { getAttemptRepository } from "@/modules/attempts/repository";
import { findToeicPart5Question } from "@/modules/exams/toeic-part-5";
import { HttpTutorService } from "@/modules/ai-tutor/tutor-service";
import { listTutorFeedback, saveTutorFeedback } from "@/modules/ai-tutor/repository";
import { AiRateLimitError } from "@/modules/ai-foundation/contracts";

async function findOwnedSubmittedAttempt(attemptId: string) {
  const { actor } = await getRequestActor();
  const attempt = await getAttemptRepository().findById(attemptId);
  if (!attempt || attempt.status !== "SUBMITTED" || (attempt.userId ? attempt.userId !== actor.userId : attempt.guestId !== actor.guestId)) return { actor, attempt: null };
  return { actor, attempt };
}

export async function GET(request: Request) {
  const attemptId = new URL(request.url).searchParams.get("attemptId");
  if (!attemptId) return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
  try {
    const { actor, attempt } = await findOwnedSubmittedAttempt(attemptId);
    if (!attempt) return NextResponse.json({ error: "Submitted attempt not found" }, { status: 404 });
    return NextResponse.json({ feedback: await listTutorFeedback(actor, attempt.id) });
  } catch {
    return NextResponse.json({ error: "Submitted attempt not found" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const parsed = TutorRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tutor request" }, { status: 400 });
  const { actor, attempt } = await findOwnedSubmittedAttempt(parsed.data.attemptId);
  if (!attempt) return NextResponse.json({ error: "Submitted attempt not found" }, { status: 404 });
  const question = findToeicPart5Question(parsed.data.questionId);
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });
  const optionText = question.content.options.find((option) => option.id === parsed.data.learnerAnswer)?.text ?? null;
  try {
    const feedback = await new HttpTutorService(actor).explain({ prompt: question.content.prompt, learnerAnswer: parsed.data.learnerAnswer, correctOptionId: question.answer.correctOptionId, officialExplanation: question.explanation ?? "Review the official answer.", optionText });
    const feedbackId = await saveTutorFeedback(actor, { attemptId: attempt.id, questionId: question.id, learnerAnswer: parsed.data.learnerAnswer, feedback });
    return NextResponse.json({ ...feedback, feedbackId });
  } catch (error) {
    if (error instanceof AiRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ error: "Tutor service unavailable" }, { status: 503 });
  }
}
