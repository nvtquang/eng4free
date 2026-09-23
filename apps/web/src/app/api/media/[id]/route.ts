import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor } from "@/modules/auth/request-actor";
import { readLocalRecording } from "@/modules/media/local-media-service";
import { findOwnedMedia } from "@/modules/speaking/repository";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Media not found" }, { status: 404 }); try { const { actor } = await getRequestActor(false); const item = await findOwnedMedia(actor, id); if (!item || !item.storageKey.startsWith("local-recordings/")) return NextResponse.json({ error: "Media not found" }, { status: 404 }); const bytes = await readLocalRecording(item.storageKey); return new Response(bytes, { headers: { "content-type": item.contentType, "content-length": String(bytes.byteLength), "cache-control": "private, no-store", "accept-ranges": "none" } }); } catch { return NextResponse.json({ error: "Media not found" }, { status: 404 }); } }
