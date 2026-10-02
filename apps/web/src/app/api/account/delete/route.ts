import { captureEvent } from "@/lib/observability";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createDatabase } from "@/db/client";
import { guestCookieName } from "@/modules/auth/request-actor";
import { deleteOwnerData } from "@/modules/account/data";
import { getRequestOwner } from "@/modules/account/owner";
import { DELETE_CONFIRMATION } from "@/modules/account/confirmation";

const Schema = z.object({ confirm: z.literal(DELETE_CONFIRMATION) });

/** Permanently deletes this learner's data and, when signed in, the account; then clears the cookies. */
export async function POST(request: Request) {
  if (!Schema.safeParse(await request.json().catch(() => null)).success) return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  const db = createDatabase();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const owner = await getRequestOwner();
  if (!owner.learnerId && !owner.userId) return NextResponse.json({ deleted: false, recordings: 0 });
  const result = await deleteOwnerData(db, owner);
  await captureEvent({ name: "account_deleted", properties: { signedIn: Boolean(owner.userId), recordings: result.recordings } });
  const response = NextResponse.json({ deleted: true, recordings: result.recordings });
  for (const name of [guestCookieName, "authjs.session-token", "__Secure-authjs.session-token"]) response.cookies.delete(name);
  return response;
}
