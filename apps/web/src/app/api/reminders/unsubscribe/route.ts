import { NextResponse } from "next/server";
import { createDatabase } from "@/db/client";
import { captureEvent } from "@/lib/observability";
import { disableReminders } from "@/modules/reminders/service";
import { isValidUnsubscribeToken } from "@/modules/reminders/unsubscribe";

/** One-click unsubscribe (RFC 8058): mail apps POST here from the List-Unsubscribe header. */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("u") ?? "";
  const token = url.searchParams.get("t") ?? "";
  if (!userId || !token || !isValidUnsubscribeToken(userId, token)) return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  const db = createDatabase();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  await disableReminders(db, userId);
  await captureEvent({ name: "reminders_unsubscribed", properties: { via: "one-click" } });
  return NextResponse.json({ unsubscribed: true });
}
