import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import type { AttemptActor } from "@/modules/attempts/types";

export const guestCookieName = "e4f_guest_id";

export async function getRequestActor(createGuest = false): Promise<{ actor: AttemptActor; createdGuestId: string | null }> {
  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(guestCookieName)?.value;
  const session = await auth();
  if (!existingGuestId && !session?.user?.id && !createGuest) throw new Error("Guest session not found");
  const guestId = existingGuestId ?? randomUUID();
  return { actor: { guestId, userId: session?.user?.id ?? null }, createdGuestId: existingGuestId ? null : guestId };
}
