import { NextResponse } from "next/server";
import { z } from "zod";
import { createDatabase } from "@/db/client";
import { getAdminActor } from "@/modules/auth/authorization";
import { updateCatalogEntry } from "@/modules/vocabulary/catalog";

const PatchSchema = z.object({
  senseChoice: z.array(z.union([z.number().int().min(0), z.string().regex(/^\d+(?:\.\d+)?$/u)])).min(1).optional(),
  meaningText: z.string().max(500).optional(),
  example: z.string().max(500).optional(),
  ipa: z.string().max(255).optional(),
  ipaUs: z.string().max(255).nullable().optional(),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  markReviewed: z.boolean().optional()
}).strict();

/** Edits one catalogue word. 422 with the rule issues when the result would not pass. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminActor();
  if (!actor.isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const db = createDatabase();
  if (!db) return NextResponse.json({ error: "DATABASE_URL is required" }, { status: 503 });
  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid change", details: parsed.error.flatten() }, { status: 400 });
  const result = await updateCatalogEntry(db, (await params).id, parsed.data, actor.email ?? "admin");
  if (!result) return NextResponse.json({ error: "Word not found" }, { status: 404 });
  if (!result.ok) return NextResponse.json({ error: "The word would not pass the rules", issues: result.issues }, { status: 422 });
  return NextResponse.json({ entry: result.entry });
}
