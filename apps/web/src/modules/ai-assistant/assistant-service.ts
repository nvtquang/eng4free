import "server-only";
import { z } from "zod";
import type { AiActor } from "@/modules/ai-foundation/contracts";
import { executeStructuredAi } from "@/modules/ai-foundation/structured-ai-service";

export type AssistantMessage = { role: "user" | "assistant"; content: string };

const AssistantReplySchema = z.object({ reply: z.string().min(1).max(1_200) });
const responseSchema = { type: "object", properties: { reply: { type: "string", description: "A short, friendly answer of at most four sentences." } }, required: ["reply"], additionalProperties: false };

/** A short description of the app so the assistant can answer "how do I..." questions without external knowledge. */
const siteGuide = "English 4 Free is a free English-learning site. Main areas: Hôm nay/Today (daily plan), Học/Learn (CEFR A1–C2 lessons), Kỹ năng/Skills (listening, speaking, reading, writing), Từ vựng/Vocabulary (flashcards with spaced repetition and multiple review modes), Ngữ pháp/Grammar, Phát âm/Pronunciation, TOEIC and IELTS practice, and Sổ lỗi sai/Mistakes (re-practise wrong answers). Progress and log out are under the account avatar (top right).";

/**
 * A lightweight, general-purpose helper chatbot for quick English-language questions
 * and questions about using the website. Answers are deliberately short to stay fast
 * and cheap; the shared AI boundary adds caching, a per-user rate limit and usage logs.
 */
export async function chatWithAssistant(actor: AiActor, messages: AssistantMessage[], language: "vi" | "en"): Promise<string> {
  const languageInstruction = language === "vi" ? "Reply in Vietnamese unless the user writes in English." : "Reply in English unless the user writes in another language.";
  const result = await executeStructuredAi({
    actor, operation: "ASSISTANT_CHAT", cacheInput: { messages, language },
    systemInstruction: `You are the friendly assistant for English 4 Free. Help with two things only: (1) quick English-language questions (grammar, vocabulary, usage, examples) and (2) how to use this website. Keep every answer short — at most four sentences — and give a concrete example when it helps. If asked about anything unrelated, briefly say you only help with English learning and this site. Never claim to be human and never invent official test scores. ${languageInstruction} ${siteGuide} Return JSON only.`,
    prompt: JSON.stringify({ conversation: messages.map((message) => ({ role: message.role, content: message.content })) }),
    responseSchema, validator: AssistantReplySchema
  });
  return result.reply;
}
