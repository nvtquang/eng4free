import { z } from "zod";
import type { ExamAnswerInput } from "./exam-engine";

/** Accepts structured responses and the legacy `{ selectedOptionId }` MCQ shape. */
const AnswerSchema = z.union([
  z.object({ questionId: z.string().uuid(), response: z.unknown().refine((value) => value !== undefined, "response is required") }),
  z.object({ questionId: z.string().uuid(), selectedOptionId: z.string().min(1).max(128) })
]);

export const ExamAnswersSchema = z.object({ answers: z.array(AnswerSchema).max(250) });

export function toExamAnswerInputs(answers: z.infer<typeof ExamAnswersSchema>["answers"]): ExamAnswerInput[] {
  return answers.map((answer) => "response" in answer ? { questionId: answer.questionId, response: answer.response } : { questionId: answer.questionId, response: { optionId: answer.selectedOptionId } });
}
