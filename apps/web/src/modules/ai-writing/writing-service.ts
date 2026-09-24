import { WritingDiagnosticsSchema, WritingFeedbackSchema, WritingSubmissionSchema, type WritingDiagnostics, type WritingFeedback, type WritingSubmission } from "@english4free/content-schemas";
import type { AiActor } from "@/modules/ai-foundation/contracts";
import { isGeminiConfigured } from "@/modules/ai-foundation/gemini-provider";
import { executeStructuredAi } from "@/modules/ai-foundation/structured-ai-service";

export type WritingEvaluation = { diagnostics: WritingDiagnostics; feedback: WritingFeedback | null; providerConfigured: boolean };
export interface WritingEvaluationService { evaluate(input: WritingSubmission): Promise<WritingEvaluation>; }
const issueSchema = { type: "object", properties: { message: { type: "string" }, start: { type: "integer", minimum: 0 }, end: { type: "integer", minimum: 0 }, suggestion: { type: "string" } }, required: ["message", "start", "end"], additionalProperties: false };
const rubricCriterionSchema = { type: "object", properties: { level: { type: "string", enum: ["NEEDS_WORK", "DEVELOPING", "SECURE"] }, feedback: { type: "string" } }, required: ["level", "feedback"], additionalProperties: false };
const writingFeedbackJsonSchema = { type: "object", properties: { summary: { type: "string" }, rubric: { type: "object", properties: { taskResponse: rubricCriterionSchema, coherenceAndCohesion: rubricCriterionSchema, lexicalResource: rubricCriterionSchema, grammaticalRangeAndAccuracy: rubricCriterionSchema }, required: ["taskResponse", "coherenceAndCohesion", "lexicalResource", "grammaticalRangeAndAccuracy"], additionalProperties: false }, grammarIssues: { type: "array", items: issueSchema }, vocabularyIssues: { type: "array", items: issueSchema }, coherenceIssues: { type: "array", items: { type: "string" } }, revisionSuggestions: { type: "array", items: { type: "string" } }, }, required: ["summary", "rubric", "grammarIssues", "vocabularyIssues", "coherenceIssues", "revisionSuggestions"], additionalProperties: false };
const WritingModelFeedbackSchema = WritingFeedbackSchema.omit({ rubricDisclaimer: true });
const rubricDisclaimer = "Practice feedback only — not an official IELTS band score.";
export function createWritingDiagnostics(input: WritingSubmission): WritingDiagnostics { const text = input.text.trim(); const wordCount = text ? text.split(/\s+/u).length : 0; const paragraphCount = text ? text.split(/\n\s*\n/u).filter(Boolean).length : 0; const meetsExpectedWordCount = input.expectedMinimumWords ? wordCount >= input.expectedMinimumWords : null; const notices = [ ...(meetsExpectedWordCount === false ? [`Writing is below the expected ${input.expectedMinimumWords} words.`] : []), ...(paragraphCount < 2 ? ["Use clear paragraph breaks to make your structure easier to review."] : []) ]; return WritingDiagnosticsSchema.parse({ wordCount, paragraphCount, meetsExpectedWordCount, notices }); }
export class UnconfiguredWritingService implements WritingEvaluationService { async evaluate(raw: WritingSubmission): Promise<WritingEvaluation> { const input = WritingSubmissionSchema.parse(raw); return { diagnostics: createWritingDiagnostics(input), feedback: null, providerConfigured: false }; } }
export class GeminiWritingService implements WritingEvaluationService {
  constructor(private readonly actor: AiActor) {}
  async evaluate(raw: WritingSubmission): Promise<WritingEvaluation> {
    const input = WritingSubmissionSchema.parse(raw);
    const validator = WritingModelFeedbackSchema.superRefine((feedback, context) => {
      for (const [group, issues] of [["grammarIssues", feedback.grammarIssues], ["vocabularyIssues", feedback.vocabularyIssues]] as const) {
        issues.forEach((issue, index) => {
          if (issue.start > issue.end || issue.end > input.text.length) context.addIssue({ code: "custom", path: [group, index], message: "Issue range must refer to the submitted writing." });
        });
      }
    });
    const modelFeedback = await executeStructuredAi({
      actor: this.actor, operation: "WRITING_FEEDBACK", cacheInput: input,
      systemInstruction: "You are an English writing feedback assistant. Give constructive practice feedback only. Never state, predict, invent, or imply an official IELTS band score. For each rubric criterion, use NEEDS_WORK, DEVELOPING, or SECURE with evidence-based feedback. Return valid JSON only. Every issue range must refer to character offsets in the submitted text, with start less than or equal to end.",
      prompt: JSON.stringify({ promptId: input.promptId, taskType: input.taskType, expectedMinimumWords: input.expectedMinimumWords ?? null, text: input.text }),
      responseSchema: writingFeedbackJsonSchema, validator, cacheTtlSeconds: 60 * 60 * 24
    });
    const feedback = WritingFeedbackSchema.parse({ ...modelFeedback, rubricDisclaimer });
    return { diagnostics: createWritingDiagnostics(input), feedback, providerConfigured: true };
  }
}
/** Diagnostics still work locally before a server-only Gemini key is configured. */
export class HttpWritingService implements WritingEvaluationService { constructor(private readonly actor?: AiActor) {} evaluate(input: WritingSubmission): Promise<WritingEvaluation> { if (!this.actor || !isGeminiConfigured()) return new UnconfiguredWritingService().evaluate(input); return new GeminiWritingService(this.actor).evaluate(input); } }
