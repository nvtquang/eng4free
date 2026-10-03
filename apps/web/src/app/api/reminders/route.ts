import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createDatabase } from "@/db/client";
import { captureEvent } from "@/lib/observability";
import { saveReminderPreference } from "@/modules/reminders/service";

const Schema = z.object({ enabled: z.boolean(), hour: z.number().int().min(5).max(22) });

/** Turns study reminder emails on or off for the signed-in account, at a local hour in Vietnam. */
export async function PUT(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose on or off and an hour between 5 and 22" }, { status: 400 });
  const session = await auth().catch(() => null);
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: "Sign in with an email address to get reminders" }, { status: 401 });
  const db = createDatabase();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  await saveReminderPreference(db, session.user.id, parsed.data);
  await captureEvent({ name: parsed.data.enabled ? "reminders_enabled" : "reminders_disabled", properties: { hour: parsed.data.hour } });
  return NextResponse.json({ saved: true, ...parsed.data });
}
