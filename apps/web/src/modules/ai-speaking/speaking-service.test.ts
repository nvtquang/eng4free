import { afterEach, describe, expect, it } from "vitest";
import { SpeakingFeedbackSchema } from "@english4free/content-schemas";
import type { StructuredAiProvider } from "@/modules/ai-foundation/contracts";
import { resetAiRateLimitForTests } from "@/modules/ai-foundation/rate-limit";
import { resetAiCacheForTests } from "@/modules/ai-foundation/repository";
import type { SpeechToTextProvider } from "./gemini-transcription-provider";
import { createSpeakingFeedback, transcribeSpeakingAudio } from "./speaking-service";

const originalInMemorySetting = process.env.E4F_USE_IN_MEMORY;

afterEach(() => {
  resetAiRateLimitForTests();
  resetAiCacheForTests();
  if (originalInMemorySetting === undefined) delete process.env.E4F_USE_IN_MEMORY;
  else process.env.E4F_USE_IN_MEMORY = originalInMemorySetting;
});

describe("AI speaking service", () => {
  it("caches a transcript by audio hash without sending the audio twice", async () => {
    process.env.E4F_USE_IN_MEMORY = "true";
    let calls = 0;
    const provider: SpeechToTextProvider = {
      name: "gemini",
      model: "transcribe-test",
      async transcribe() {
        calls += 1;
        return { transcript: "I learned public speaking.", usage: { promptTokens: 4, responseTokens: 5 } };
      }
    };
    const actor = { userId: null, guestId: "speaking-test" };
    const input = { bytes: new Uint8Array([10, 20, 30]), mimeType: "audio/webm" };

    await expect(transcribeSpeakingAudio(actor, input, provider)).resolves.toBe("I learned public speaking.");
    await expect(transcribeSpeakingAudio(actor, input, provider)).resolves.toBe("I learned public speaking.");
    expect(calls).toBe(1);
  });

  it("creates descriptive transcript-based feedback without a numeric score", async () => {
    process.env.E4F_USE_IN_MEMORY = "true";
    const provider: StructuredAiProvider = {
      name: "gemini",
      model: "feedback-test",
      async generateJson() {
        return {
          value: {
            summary: "You answered the prompt clearly.",
            rubric: {
              taskResponse: { level: "SECURE", feedback: "The answer stays on topic." },
              fluency: { level: "DEVELOPING", feedback: "Connect the final two ideas more clearly." },
              grammar: { level: "DEVELOPING", feedback: "Review past-tense consistency." },
              vocabulary: { level: "SECURE", feedback: "The vocabulary is appropriate." }
            },
            corrections: [],
            strengths: ["Clear main idea"],
            nextSteps: ["Retell the answer with one more supporting detail"]
          },
          usage: { promptTokens: 12, responseTokens: 18 }
        };
      }
    };

    const feedback = await createSpeakingFeedback(
      { userId: null, guestId: "feedback-test" },
      { prompt: "Describe a useful skill.", transcript: "I learn cooking last year and it was useful.", feedbackLanguage: "en" },
      provider
    );

    expect(feedback.transcript).toContain("cooking");
    expect(feedback.disclaimer).toContain("not an official speaking score");
    expect(SpeakingFeedbackSchema.safeParse(feedback).success).toBe(true);
    expect(SpeakingFeedbackSchema.safeParse({ ...feedback, rubric: { ...feedback.rubric, taskResponse: 7 } }).success).toBe(false);
  });
});
