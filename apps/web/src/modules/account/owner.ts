import { auth } from "@/auth";
import { getRequestLearner, LearnerNotFoundError } from "@/modules/auth/request-actor";
import type { DataOwner } from "./data";

/** The signed-in account (if any) and the learner this browser studies as (if any). */
export async function getRequestOwner(): Promise<DataOwner> {
  const userId = (await auth().catch(() => null))?.user?.id ?? null;
  try {
    return { learnerId: (await getRequestLearner(false)).learner.learnerId, userId };
  } catch (error) {
    if (error instanceof LearnerNotFoundError) return { learnerId: null, userId };
    throw error;
  }
}
