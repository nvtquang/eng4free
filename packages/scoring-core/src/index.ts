import type { McqQuestionWithAnswer } from "@english4free/content-schemas";

export type ScoreResult = {
  correct: boolean;
  earnedPoints: number;
  availablePoints: number;
};

export function scoreMcq(question: McqQuestionWithAnswer, selectedOptionId: string): ScoreResult {
  const correct = question.answer.correctOptionId === selectedOptionId;
  return { correct, earnedPoints: correct ? 1 : 0, availablePoints: 1 };
}
