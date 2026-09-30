import { NextResponse } from "next/server";
import { z } from "zod";
import { getLocale } from "@/lib/i18n";
import { getRequestLearner, guestCookieName } from "@/modules/auth/request-actor";
import { AiRateLimitError } from "@/modules/ai-foundation/contracts";
import { isGeminiConfigured } from "@/modules/ai-foundation/gemini-provider";
import { chatWithAssistant } from "@/modules/ai-assistant/assistant-service";

const Schema = z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1_000) })).min(1).max(12) });

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid assistant request" }, { status: 400 });
  if (!isGeminiConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  try {
    const { learner: actor, createdGuestId } = await getRequestLearner(true);
    const reply = await chatWithAssistant(actor, parsed.data.messages, await getLocale());
    const response = NextResponse.json({ reply });
    if (createdGuestId) response.cookies.set(guestCookieName, createdGuestId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    if (error instanceof AiRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
