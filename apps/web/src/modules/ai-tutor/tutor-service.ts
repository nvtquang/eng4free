import { TutorFeedbackSchema, type TutorFeedback } from "@english4free/content-schemas";
import type { AiActor } from "@/modules/ai-foundation/contracts";
import { isGeminiConfigured } from "@/modules/ai-foundation/gemini-provider";
import { executeStructuredAi } from "@/modules/ai-foundation/structured-ai-service";

export type TrustedTutorContext = { prompt: string; learnerAnswer: string; correctOptionId: string; officialExplanation: string; optionText: string | null };
const TutorModelFeedbackSchema = TutorFeedbackSchema.pick({ explanation: true, nextStep: true });
const tutorResponseJsonSchema = { type: "object", properties: { explanation: { type: "string", description: "Short explanation based only on the official explanation." }, nextStep: { type: "string", description: "One concise follow-up practice action." } }, required: ["explanation", "nextStep"], additionalProperties: false };

export interface TutorService { explain(context: TrustedTutorContext): Promise<TutorFeedback>; }

/** The provider receives explanation context, never the server's answer-key ID. */
export function buildTutorPrompt(context: TrustedTutorContext): string {
  return JSON.stringify({ question: context.prompt, learnerSelectedOptionId: context.learnerAnswer, learnerSelectedOptionText: context.optionText, answerIsCorrect: context.learnerAnswer === context.correctOptionId, officialExplanation: context.officialExplanation });
}

/** Reliable local fallback; the official answer remains the source of truth. */
export class OfficialExplanationTutor implements TutorService {
  async explain(context: TrustedTutorContext): Promise<TutorFeedback> {
    const correct = context.learnerAnswer === context.correctOptionId;
    return TutorFeedbackSchema.parse({ correct, explanation: context.officialExplanation, nextStep: correct ? "Review why the grammar pattern works, then apply it in a new sentence." : "Compare your selected option with the grammar pattern in the official explanation.", providerUsed: false });
  }
}

/** Gemini implementation that receives only trusted, server-built context. */
export class GeminiTutorService implements TutorService {
  constructor(private readonly actor: AiActor) {}
  async explain(context: TrustedTutorContext): Promise<TutorFeedback> {
    const modelFeedback = await executeStructuredAi({
      actor: this.actor, operation: "TUTOR_EXPLANATION", cacheInput: context,
      systemInstruction: "You are English 4 Free's tutor. Explain the learner's mistake only from the trusted official explanation supplied by the server. Never state, guess, invent, or reveal an answer key, score, or exam band. Reply in the learner's language when possible. Output JSON matching the required schema only.",
      prompt: buildTutorPrompt(context),
      responseSchema: tutorResponseJsonSchema, validator: TutorModelFeedbackSchema
    });
    return TutorFeedbackSchema.parse({ correct: context.learnerAnswer === context.correctOptionId, ...modelFeedback, providerUsed: true });
  }
}

/** Local fallback remains active until a server-only Gemini key is configured. */
export class HttpTutorService implements TutorService {
  constructor(private readonly actor?: AiActor) {}
  explain(context: TrustedTutorContext): Promise<TutorFeedback> {
    if (!this.actor || !isGeminiConfigured()) return new OfficialExplanationTutor().explain(context);
    return new GeminiTutorService(this.actor).explain(context);
  }
}
