import { describe, expect, it } from "vitest";
import { SpeakingFeedbackSchema, WritingFeedbackSchema, WritingSubmissionSchema } from "@english4free/content-schemas";
import { offlineSpeakingFeedback, offlineWritingFeedback } from "./demo-fallback";
import { createWritingDiagnostics } from "@/modules/ai-writing/writing-service";

const forbidden = /\bband\s*\d|\b\d(\.\d)?\s*\/\s*9\b|\bscore\s*(of|:)?\s*\d/i;

describe("offline writing fallback", () => {
  const input = WritingSubmissionSchema.parse({ promptId: "p", taskType: "IELTS_TASK_2", text: "I agree with this idea. Public transport is good because it carry many people. However some people prefer cars. In conclusion i think public transport is better.", language: "en", expectedMinimumWords: 250 });

  it("produces schema-valid writing feedback with the offline disclaimer", () => {
    const diagnostics = createWritingDiagnostics(input);
    const feedback = { ...offlineWritingFeedback(input, diagnostics), rubricDisclaimer: "Offline practice feedback (AI reviewer unreachable) — a structural review of your text, not an official band score." };
    expect(WritingFeedbackSchema.safeParse(feedback).success).toBe(true);
  });

  it("never mentions a band or numeric score", () => {
    const diagnostics = createWritingDiagnostics(input);
    expect(forbidden.test(JSON.stringify(offlineWritingFeedback(input, diagnostics)))).toBe(false);
  });

  it("flags writing below the expected length as needing work on task response", () => {
    const diagnostics = createWritingDiagnostics(input);
    expect(diagnostics.meetsExpectedWordCount).toBe(false);
    expect(offlineWritingFeedback(input, diagnostics).rubric.taskResponse.level).toBe("NEEDS_WORK");
  });
});

describe("offline speaking fallback", () => {
  it("produces schema-valid speaking feedback and notices fillers", () => {
    const input = { prompt: "Describe your hometown.", transcript: "Um, my hometown is nice. Um, like, the people are friendly and, you know, the food is good. Um, I like it." };
    const feedback = SpeakingFeedbackSchema.safeParse({ transcript: input.transcript, ...offlineSpeakingFeedback(input), disclaimer: "Offline practice feedback (AI reviewer unreachable) — a review of your transcript only, not pronunciation or an official score." });
    expect(feedback.success).toBe(true);
    expect(offlineSpeakingFeedback(input).rubric.fluency.feedback.toLowerCase()).toContain("filler");
  });

  it("never invents a band or numeric score", () => {
    const input = { prompt: "Talk about food.", transcript: "I like hot pot with my family in winter. We talk a lot and it is warm and fun." };
    expect(forbidden.test(JSON.stringify(offlineSpeakingFeedback(input)))).toBe(false);
  });
});
