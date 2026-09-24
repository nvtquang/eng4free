import { NextResponse } from "next/server";
import { z } from "zod";
import { SpeakingFeedbackSchema } from "@english4free/content-schemas";
import { getLocale } from "@/lib/i18n";
import { getRequestActor } from "@/modules/auth/request-actor";
import { AiRateLimitError } from "@/modules/ai-foundation/contracts";
import { isGeminiConfigured } from "@/modules/ai-foundation/gemini-provider";
import { createSpeakingFeedback, transcribeSpeakingAudio } from "@/modules/ai-speaking/speaking-service";
import { loadSpeakingTurnAudio, saveSpeakingAnalysis } from "@/modules/speaking/repository";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid speaking session" }, { status: 400 });
  try {
    const { actor } = await getRequestActor(false);
    const turn = await loadSpeakingTurnAudio(actor, id);
    if (!turn) return NextResponse.json({ error: "Speaking recording not found" }, { status: 404 });
    const existingFeedback = SpeakingFeedbackSchema.safeParse(turn.feedback);
    if (existingFeedback.success) return NextResponse.json({ providerConfigured: isGeminiConfigured(), transcript: existingFeedback.data.transcript, feedback: existingFeedback.data, cached: true });
    if (!isGeminiConfigured()) return NextResponse.json({ providerConfigured: false, transcript: turn.transcript, feedback: null, cached: false });

    const transcript = turn.transcript?.trim() || await transcribeSpeakingAudio(actor, { bytes: turn.bytes, mimeType: turn.contentType });
    await saveSpeakingAnalysis(actor, { sessionId: id, turnId: turn.id, transcript, feedback: null });
    const feedback = await createSpeakingFeedback(actor, { prompt: turn.prompt, transcript, feedbackLanguage: await getLocale() });
    await saveSpeakingAnalysis(actor, { sessionId: id, turnId: turn.id, transcript, feedback });
    return NextResponse.json({ providerConfigured: true, transcript, feedback, cached: false });
  } catch (error) {
    if (error instanceof AiRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ error: "Speaking transcription or feedback is temporarily unavailable" }, { status: 503 });
  }
}
