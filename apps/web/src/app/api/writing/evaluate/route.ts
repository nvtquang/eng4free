import { WritingSubmissionSchema } from "@english4free/content-schemas";
import { HttpWritingService } from "@/modules/ai-writing/writing-service";
import { NextResponse } from "next/server";
export async function POST(request: Request) { const body: unknown = await request.json().catch(() => null); const parsed = WritingSubmissionSchema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: "Invalid writing submission", details: parsed.error.flatten() }, { status: 400 }); try { return NextResponse.json(await new HttpWritingService().evaluate(parsed.data)); } catch { return NextResponse.json({ error: "Writing service unavailable" }, { status: 503 }); } }
