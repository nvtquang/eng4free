import { questionPoints, toPublicQuestion, type AuthoredQuestion, type McqQuestionWithAnswer, type QuestionResponse } from "@english4free/content-schemas";

export type ScoreResult = {
  correct: boolean;
  earnedPoints: number;
  availablePoints: number;
};

export function scoreMcq(question: McqQuestionWithAnswer, selectedOptionId: string): ScoreResult {
  const correct = question.answer.correctOptionId === selectedOptionId;
  return { correct, earnedPoints: correct ? 1 : 0, availablePoints: 1 };
}

/**
 * Canonical form for typed short answers: Unicode-normalized, case-insensitive,
 * typographic quotes/dashes folded, whitespace collapsed and surrounding
 * punctuation ignored. "  The  Train. " and "the train" compare equal.
 */
export function normalizeShortAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’ʼ]/gu, "'")
    .replace(/[“”]/gu, "\"")
    .replace(/[–—]/gu, "-")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/^[\s"'.,;:!?()]+|[\s"'.,;:!?()]+$/gu, "");
}

/** Dictation additionally ignores all punctuation except apostrophes and hyphens inside words. */
export function normalizeDictation(value: string): string {
  return normalizeShortAnswer(value)
    .replace(/[^\p{L}\p{N}'\s-]/gu, " ")
    .replace(/(^|\s)['-]+|['-]+(?=\s|$)/gu, "$1")
    .replace(/\s+/gu, " ")
    .trim();
}

function matchesAny(value: string | undefined, accepted: string[], normalize = normalizeShortAnswer): boolean {
  if (!value) return false;
  const candidate = normalize(value);
  return candidate.length > 0 && accepted.some((answer) => normalize(answer) === candidate);
}

/** Points a question is worth: one per blank, matched item or required selection; otherwise one. */
export function availablePoints(question: AuthoredQuestion): number {
  return questionPoints(toPublicQuestion(question));
}

function result(earnedPoints: number, available: number): ScoreResult {
  return { correct: earnedPoints === available, earnedPoints, availablePoints: available };
}

/**
 * Deterministic server-side scoring for every gradable type. A missing response
 * scores zero. Partial credit follows IELTS/TOEIC conventions: each blank,
 * matched item and correct selection is one mark; ordering and dictation are
 * all-or-nothing.
 */
export function scoreQuestion(question: AuthoredQuestion, response: QuestionResponse | null | undefined): ScoreResult {
  const available = availablePoints(question);
  if (!response) return result(0, available);
  switch (question.type) {
    case "MCQ": return result((response as QuestionResponse<"MCQ">).optionId === question.answer.correctOptionId ? 1 : 0, available);
    case "MULTI_SELECT": {
      const correct = new Set(question.answer.correctOptionIds);
      const selected = [...new Set((response as QuestionResponse<"MULTI_SELECT">).optionIds)].slice(0, question.content.selectCount);
      return result(selected.filter((id) => correct.has(id)).length, available);
    }
    case "TRUE_FALSE": return result((response as QuestionResponse<"TRUE_FALSE">).value === question.answer.correct ? 1 : 0, available);
    case "FILL_BLANK": {
      const blanks = (response as QuestionResponse<"FILL_BLANK">).blanks;
      const limit = question.content.wordLimit;
      const earned = Object.entries(question.answer.blanks).filter(([id, accepted]) => {
        const value = blanks[id];
        if (limit && value && normalizeShortAnswer(value).split(" ").length > limit) return false;
        return matchesAny(value, accepted);
      }).length;
      return result(earned, available);
    }
    case "MATCHING": {
      const matches = (response as QuestionResponse<"MATCHING">).matches;
      return result(Object.entries(question.answer.matches).filter(([item, option]) => matches[item] === option).length, available);
    }
    case "ORDERING": {
      const order = (response as QuestionResponse<"ORDERING">).order;
      return result(order.length === question.answer.order.length && order.every((id, index) => id === question.answer.order[index]) ? 1 : 0, available);
    }
    case "DICTATION": return result(matchesAny((response as QuestionResponse<"DICTATION">).text, question.answer.accepted, normalizeDictation) ? 1 : 0, available);
  }
}
