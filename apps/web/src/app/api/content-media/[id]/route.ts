import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { createDatabase } from "@/db/client";
import { media } from "@/db/schema";
import { readLocalContentMedia } from "@/modules/media/local-media-service";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Media not found" }, { status: 404 }); const db = createDatabase(); if (!db) return NextResponse.json({ error: "Media not found" }, { status: 404 }); const [item] = await db.select().from(media).where(and(eq(media.id, id), eq(media.status, "READY"), isNull(media.ownerUserId), isNull(media.ownerGuestId))); if (!item || !item.storageKey.startsWith("local-uploads/")) return NextResponse.json({ error: "Media not found" }, { status: 404 }); try { const bytes = await readLocalContentMedia(item.storageKey); return new Response(bytes, { headers: { "content-type": item.contentType, "content-length": String(bytes.byteLength), "cache-control": "private, max-age=60" } }); } catch { return NextResponse.json({ error: "Media not found" }, { status: 404 }); } }
