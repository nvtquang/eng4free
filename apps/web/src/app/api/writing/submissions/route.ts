import { NextResponse } from "next/server";
import { WritingPersistenceSchema } from "@english4free/content-schemas";
import { getRequestActor, guestCookieName } from "@/modules/auth/request-actor";
import { listWritingHistory, saveWritingSubmission } from "@/modules/writing/repository";

export async function GET() { try { const { actor } = await getRequestActor(false); return NextResponse.json({ submissions: await listWritingHistory(actor) }); } catch { return NextResponse.json({ submissions: [] }); } }
export async function POST(request: Request) { const parsed = WritingPersistenceSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid writing submission", issues: parsed.error.flatten() }, { status: 400 }); try { const { actor, createdGuestId } = await getRequestActor(true); const saved = await saveWritingSubmission(actor, parsed.data); const response = NextResponse.json(saved, { status: parsed.data.submissionId ? 200 : 201 }); if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 }); return response; } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save writing" }, { status: 400 }); } }
