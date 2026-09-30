import { getRequestLearner } from "@/modules/auth/request-actor";
import { findLearnerProfile } from "./repository";

/**
 * The learner's level for preselecting level tabs: the placement level of that skill when
 * there is one, otherwise the overall onboarding level, and A1 when unknown.
 */
export async function defaultSkillLevel(skill?: string): Promise<string> {
  try {
    const profile = await findLearnerProfile((await getRequestLearner(false)).learner);
    return (skill && profile?.skillLevels?.[skill]) || profile?.cefrLevel || "A1";
  } catch {
    return "A1";
  }
}
