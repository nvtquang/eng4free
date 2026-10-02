import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { createDatabase } from "@/db/client";
import { createLinkedLearner, findLinkedLearner, linkAccountOnSignIn, touchLearner } from "@/modules/learners/repository";
import type { LearnerRef } from "@/modules/learners/types";

export const guestCookieName = "e4f_guest_id";

export class LearnerNotFoundError extends Error {
  constructor() { super("Learner not found"); this.name = "LearnerNotFoundError"; }
}

/**
 * Resolves the learner behind this request: the signed-in account's learner, otherwise the
 * learner linked to the anonymous guest cookie. With `create`, a first-time guest gets a
 * cookie and a learner; without it, a visitor with no learner yet throws LearnerNotFoundError.
 */
export async function getRequestLearner(create = false): Promise<{ learner: LearnerRef; createdGuestId: string | null }> {
  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(guestCookieName)?.value ?? null;
  const userId = (await auth())?.user?.id ?? null;
  if (!existingGuestId && !userId && !create) throw new LearnerNotFoundError();
  const createdGuestId = !existingGuestId && !userId ? randomUUID() : null;
  const guestId = existingGuestId ?? createdGuestId;

  const db = createDatabase();
  if (!db) return { learner: { learnerId: userId ?? guestId! }, createdGuestId };

  if (userId) {
    const learnerId = await findLinkedLearner(db, "USER", userId) ?? await linkAccountOnSignIn(userId, existingGuestId);
    if (learnerId) await touchLearner(db, learnerId).catch(() => undefined);
    return { learner: { learnerId: learnerId! }, createdGuestId };
  }
  const learnerId = await findLinkedLearner(db, "GUEST", guestId!);
  if (learnerId) { await touchLearner(db, learnerId).catch(() => undefined); return { learner: { learnerId }, createdGuestId }; }
  if (!create) throw new LearnerNotFoundError();
  return { learner: { learnerId: await createLinkedLearner(db, "GUEST", guestId!) }, createdGuestId };
}
