/** Where each skill is practised outside the path. Level-aware pages open at the given level. */
export type PracticeSkill = "LISTENING" | "READING" | "SPEAKING" | "WRITING" | "VOCABULARY" | "GRAMMAR";

export function practiceHref(skill: PracticeSkill, level?: string | null): string {
  const query = level ? `?level=${level}` : "";
  switch (skill) {
    case "LISTENING": return `/skills/listening${query}`;
    case "READING": return `/skills/reading${query}`;
    case "VOCABULARY": return `/vocabulary${query}`;
    case "SPEAKING": return "/skills/speaking";
    case "WRITING": return "/skills/writing";
    case "GRAMMAR": return "/grammar";
  }
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
/** Tie-break order when several skills share the lowest level: the four core skills first. */
const PRIORITY: PracticeSkill[] = ["LISTENING", "SPEAKING", "READING", "WRITING", "GRAMMAR", "VOCABULARY"];

/** The skill with the lowest placement level, or null without placement levels. */
export function weakestSkill(skillLevels: Record<string, string> | null | undefined): { skill: PracticeSkill; level: string } | null {
  if (!skillLevels) return null;
  let best: { skill: PracticeSkill; level: string } | null = null;
  for (const skill of PRIORITY) {
    const level = skillLevels[skill];
    if (!level || !LEVELS.includes(level)) continue;
    if (!best || LEVELS.indexOf(level) < LEVELS.indexOf(best.level)) best = { skill, level };
  }
  return best;
}
