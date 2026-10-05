import { NextResponse } from "next/server";
import { z } from "zod";
import { createDatabase } from "@/db/client";
import { getAdminActor } from "@/modules/auth/authorization";
import { excludeCatalogEntry } from "@/modules/vocabulary/catalog";

const ExcludeSchema = z.object({ reason: z.string().trim().min(3).max(500) });

/** Stops teaching a word: it is archived and never suggested again by the candidate script. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminActor();
  if (!actor.isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const db = createDatabase();
  if (!db) return NextResponse.json({ error: "DATABASE_URL is required" }, { status: 503 });
  const parsed = ExcludeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "A reason of at least 3 characters is required" }, { status: 400 });
  const done = await excludeCatalogEntry(db, (await params).id, parsed.data.reason, actor.email ?? "admin");
  return done ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Word not found" }, { status: 404 });
}
