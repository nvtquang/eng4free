import { calculateIeltsBand } from "./ielts-band";
import { estimateToeicScaledScore } from "./toeic-scaled";

export type SkillTally = { correct: number; total: number };
export type AttemptSkillTallies = { listening: SkillTally; reading: SkillTally };

/**
 * A practice-only estimate for a shortened attempt: each skill's accuracy is
 * projected onto the full-length raw scale (100 TOEIC or 40 IELTS questions) and
 * then converted. A skill that the attempt does not cover is null.
 */
export type AttemptEstimate =
  | { exam: "TOEIC"; listening: number | null; reading: number | null; total: number | null }
  | { exam: "IELTS"; listening: number | null; reading: number | null };

/** Sums marks per skill; a blank or matched item counts as one mark, as in the real tests. */
export function tallyBySkill(questionSkills: ReadonlyMap<string, string | null>, results: ReadonlyArray<{ questionId: string; earnedPoints: number; availablePoints: number }>): AttemptSkillTallies {
  const tallies: AttemptSkillTallies = { listening: { correct: 0, total: 0 }, reading: { correct: 0, total: 0 } };
  for (const result of results) {
    const skill = questionSkills.get(result.questionId);
    const tally = skill === "LISTENING" ? tallies.listening : skill === "READING" ? tallies.reading : null;
    if (!tally) continue;
    tally.total += result.availablePoints;
    tally.correct += result.earnedPoints;
  }
  return tallies;
}

function project({ correct, total }: SkillTally, fullLength: number): number | null {
  return total === 0 ? null : Math.round((correct / total) * fullLength);
}

export function estimateAttempt(exam: "TOEIC" | "IELTS", tallies: AttemptSkillTallies): AttemptEstimate {
  if (exam === "IELTS") {
    const listening = project(tallies.listening, 40);
    const reading = project(tallies.reading, 40);
    return { exam, listening: listening === null ? null : calculateIeltsBand("LISTENING", listening), reading: reading === null ? null : calculateIeltsBand("ACADEMIC_READING", reading) };
  }
  const listening = project(tallies.listening, 100);
  const reading = project(tallies.reading, 100);
  const scaled = estimateToeicScaledScore(listening ?? 0, reading ?? 0);
  return { exam, listening: listening === null ? null : scaled.listening, reading: reading === null ? null : scaled.reading, total: listening === null || reading === null ? null : scaled.total };
}
