import "server-only";
import { z } from "zod";
import { SpeakingFeedbackSchema, type SpeakingFeedback } from "@english4free/content-schemas";
import { AiProviderUnavailableError, AiRateLimitError, sha256, sha256Bytes, type AiActor, type StructuredAiProvider } from "@/modules/ai-foundation/contracts";
import { executeStructuredAi } from "@/modules/ai-foundation/structured-ai-service";
import { checkAiRequest, consumeAiBudget } from "@/modules/ai-foundation/rate-limit";
import { getCachedAiResponse, putCachedAiResponse, recordAiUsage } from "@/modules/ai-foundation/repository";
import { offlineSpeakingFeedback } from "@/modules/ai-foundation/demo-fallback";
import { captureEvent } from "@/lib/observability";
import { getGeminiTranscriptionProvider, type SpeechToTextProvider } from "./gemini-transcription-provider";

const TranscriptSchema = z.object({ transcript: z.string().min(1).max(20_000) });
const SpeakingModelFeedbackSchema = SpeakingFeedbackSchema.omit({ transcript: true, disclaimer: true });
const criterionSchema = { type: "object", properties: { level: { type: "string", enum: ["NEEDS_WORK", "DEVELOPING", "SECURE"] }, feedback: { type: "string" } }, required: ["level", "feedback"], additionalProperties: false };
const speakingFeedbackJsonSchema = { type: "object", properties: { summary: { type: "string" }, rubric: { type: "object", properties: { taskResponse: criterionSchema, fluency: criterionSchema, grammar: criterionSchema, vocabulary: criterionSchema }, required: ["taskResponse", "fluency", "grammar", "vocabulary"], additionalProperties: false }, corrections: { type: "array", items: { type: "object", properties: { original: { type: "string" }, correction: { type: "string" }, explanation: { type: "string" } }, required: ["original", "correction", "explanation"], additionalProperties: false } }, strengths: { type: "array", items: { type: "string" } }, nextSteps: { type: "array", items: { type: "string" } } }, required: ["summary", "rubric", "corrections", "strengths", "nextSteps"], additionalProperties: false };
const disclaimer = "Transcript-based practice feedback only. It is not an official speaking score and does not assess phoneme-level pronunciation.";
const offlineDisclaimer = "Offline practice feedback (AI reviewer unreachable) — a review of your transcript only, not pronunciation or an official score.";

function ttlSeconds(): number {
  const configured = Number(process.env.AI_CACHE_TTL_SECONDS);
  return Number.isInteger(configured) && configured > 0 ? configured : 900;
}

export async function transcribeSpeakingAudio(actor: AiActor, input: { bytes: Uint8Array; mimeType: string }, injectedProvider?: SpeechToTextProvider): Promise<string> {
  const provider = injectedProvider ?? getGeminiTranscriptionProvider();
  if (!provider) throw new AiProviderUnavailableError("Gemini speech transcription is not configured");
  const audioHash = sha256Bytes(input.bytes);
  const refused = await checkAiRequest({ operation: "SPEECH_TRANSCRIPTION", learnerId: actor.learnerId });
  if (refused) {
    await recordAiUsage({ actor, operation: "SPEECH_TRANSCRIPTION", provider: provider.name, model: provider.model, inputHash: audioHash, cacheHit: false, status: "RATE_LIMITED" });
    await captureEvent({ name: "ai_limited", properties: { operation: "SPEECH_TRANSCRIPTION", reason: refused } });
    throw new AiRateLimitError(refused);
  }
  const cacheKey = sha256({ operation: "SPEECH_TRANSCRIPTION", provider: provider.name, model: provider.model, audioHash, mimeType: input.mimeType });
  const cached = TranscriptSchema.safeParse(await getCachedAiResponse(cacheKey));
  if (cached.success) {
    await recordAiUsage({ actor, operation: "SPEECH_TRANSCRIPTION", provider: provider.name, model: provider.model, inputHash: audioHash, cacheHit: true, status: "CACHE_HIT" });
    return cached.data.transcript;
  }
  if (!await consumeAiBudget("TRANSCRIPTION")) {
    await recordAiUsage({ actor, operation: "SPEECH_TRANSCRIPTION", provider: provider.name, model: provider.model, inputHash: audioHash, cacheHit: false, status: "BUDGET_EXHAUSTED" });
    await captureEvent({ name: "ai_limited", properties: { operation: "SPEECH_TRANSCRIPTION", reason: "DAILY_BUDGET" } });
    throw new AiRateLimitError("DAILY_BUDGET");
  }
  const startedAt = Date.now();
  try {
    const result = await provider.transcribe(input);
    const transcript = TranscriptSchema.parse({ transcript: result.transcript }).transcript;
    await putCachedAiResponse({ cacheKey, operation: "SPEECH_TRANSCRIPTION", provider: provider.name, model: provider.model, value: { transcript }, ttlSeconds: ttlSeconds() });
    await recordAiUsage({ actor, operation: "SPEECH_TRANSCRIPTION", provider: provider.name, model: provider.model, inputHash: audioHash, cacheHit: false, status: "SUCCESS", latencyMs: Date.now() - startedAt, promptTokens: result.usage.promptTokens, responseTokens: result.usage.responseTokens });
    return transcript;
  } catch (error) {
    await recordAiUsage({ actor, operation: "SPEECH_TRANSCRIPTION", provider: provider.name, model: provider.model, inputHash: audioHash, cacheHit: false, status: "PROVIDER_UNAVAILABLE", latencyMs: Date.now() - startedAt });
    if (error instanceof AiProviderUnavailableError) throw error;
    throw new AiProviderUnavailableError("Speech transcription provider is unavailable");
  }
}

export async function createSpeakingFeedback(actor: AiActor, input: { prompt: string; transcript: string; feedbackLanguage: "vi" | "en" }, provider?: StructuredAiProvider): Promise<SpeakingFeedback> {
  const languageInstruction = input.feedbackLanguage === "vi"
    ? "Write all learner-facing feedback and explanations in Vietnamese. Keep quoted English corrections in English."
    : "Write all learner-facing feedback and explanations in English.";
  try {
    const modelFeedback = await executeStructuredAi({
      actor, operation: "SPEAKING_FEEDBACK", cacheInput: input,
      systemInstruction: `You are an English speaking coach. Evaluate only the supplied verbatim transcript against the prompt. Never invent an official IELTS band, numeric score, pronunciation score, acoustic observation, or words that are not in the transcript. Use only NEEDS_WORK, DEVELOPING, or SECURE. Fluency feedback must be limited to organization, fillers, repetitions, and false starts visible in the verbatim transcript. ${languageInstruction} Return JSON only.`,
      prompt: JSON.stringify(input), responseSchema: speakingFeedbackJsonSchema, validator: SpeakingModelFeedbackSchema,
      cacheTtlSeconds: 60 * 60 * 24,
      provider
    });
    return SpeakingFeedbackSchema.parse({ transcript: input.transcript, ...modelFeedback, disclaimer });
  } catch (error) {
    // Network loss mid-demo: fall back to deterministic offline feedback from the transcript.
    if (error instanceof AiProviderUnavailableError) {
      return SpeakingFeedbackSchema.parse({ transcript: input.transcript, ...offlineSpeakingFeedback(input), disclaimer: offlineDisclaimer });
    }
    throw error;
  }
}
