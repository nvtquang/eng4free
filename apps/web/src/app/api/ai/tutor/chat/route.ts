import { NextResponse } from "next/server";
import { TutorChatRequestSchema } from "@english4free/content-schemas";
import { getRequestActor } from "@/modules/auth/request-actor";
import { getAttemptRepository } from "@/modules/attempts/repository";
import { findToeicPart5Question } from "@/modules/exams/toeic-part-5";
import { HttpTutorService } from "@/modules/ai-tutor/tutor-service";
import { AiRateLimitError } from "@/modules/ai-foundation/contracts";

export async function POST(request: Request) {
  const parsed = TutorChatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tutor chat request" }, { status: 400 });
  const { actor } = await getRequestActor();
  const attempt = await getAttemptRepository().findById(parsed.data.attemptId);
  if (!attempt || attempt.status !== "SUBMITTED" || (attempt.userId ? attempt.userId !== actor.userId : attempt.guestId !== actor.guestId)) return NextResponse.json({ error: "Submitted attempt not found" }, { status: 404 });
  const question = findToeicPart5Question(parsed.data.questionId);
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });
  const optionText = question.content.options.find((option) => option.id === parsed.data.learnerAnswer)?.text ?? null;
  try {
    const reply = await new HttpTutorService(actor).chat(
      { prompt: question.content.prompt, learnerAnswer: parsed.data.learnerAnswer, correctOptionId: question.answer.correctOptionId, officialExplanation: question.explanation ?? "Review the official answer.", optionText },
      parsed.data.messages
    );
    return NextResponse.json(reply);
  } catch (error) {
    if (error instanceof AiRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ error: "Tutor service unavailable" }, { status: 503 });
  }
}
