import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { isRecordingKey, readRecording } from "@/modules/media/recording-storage";
import { findOwnedMedia } from "@/modules/speaking/repository";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Media not found" }, { status: 404 }); try { const { learner: actor } = await getRequestLearner(false); const item = await findOwnedMedia(actor, id); if (!item || !isRecordingKey(item.storageKey)) return NextResponse.json({ error: "Media not found" }, { status: 404 }); const bytes = await readRecording(item.storageKey); return new Response(bytes, { headers: { "content-type": item.contentType, "content-length": String(bytes.byteLength), "cache-control": "private, no-store", "accept-ranges": "none" } }); } catch { return NextResponse.json({ error: "Media not found" }, { status: 404 }); } }
