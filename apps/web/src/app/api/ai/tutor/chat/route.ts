import { NextResponse } from "next/server";
import { TutorChatRequestSchema } from "@english4free/content-schemas";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { HttpTutorService } from "@/modules/ai-tutor/tutor-service";
import { loadTutorContext } from "@/modules/ai-tutor/context";
import { AiRateLimitError } from "@/modules/ai-foundation/contracts";

export async function POST(request: Request) {
  const parsed = TutorChatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tutor chat request" }, { status: 400 });
  try {
    const { learner } = await getRequestLearner();
    const context = await loadTutorContext(learner, parsed.data.attemptId, parsed.data.questionId);
    if (!context) return NextResponse.json({ error: "Question not found in this submitted attempt" }, { status: 404 });
    return NextResponse.json(await new HttpTutorService(learner).chat(context, parsed.data.messages));
  } catch (error) {
    if (error instanceof AiRateLimitError) return NextResponse.json({ error: error.message, reason: error.reason }, { status: 429 });
    return NextResponse.json({ error: "Tutor service unavailable" }, { status: 503 });
  }
}
