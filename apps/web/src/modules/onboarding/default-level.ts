import { getRequestActor } from "@/modules/auth/request-actor";
import { findLearnerProfile } from "./repository";

/** The learner's CEFR level from onboarding, used to preselect level tabs; A1 when unknown. */
export async function defaultSkillLevel(): Promise<string> {
  try {
    const profile = await findLearnerProfile((await getRequestActor(false)).actor);
    return profile?.cefrLevel ?? "A1";
  } catch {
    return "A1";
  }
}
