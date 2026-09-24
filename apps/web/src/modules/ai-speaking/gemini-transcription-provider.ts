import "server-only";
import { AiProviderUnavailableError, type GeminiUsage } from "@/modules/ai-foundation/contracts";

type InteractionResponse = {
  output_text?: string;
  steps?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  usage?: { total_input_tokens?: number; total_output_tokens?: number };
  error?: { message?: string };
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export interface SpeechToTextProvider {
  readonly name: "gemini";
  readonly model: string;
  transcribe(input: { bytes: Uint8Array; mimeType: string }): Promise<{ transcript: string; usage: GeminiUsage }>;
}

/** Stateless, server-only push-to-talk transcription adapter. */
export class GeminiTranscriptionProvider implements SpeechToTextProvider {
  readonly name = "gemini" as const;
  constructor(
    readonly model: string,
    private readonly apiKey: string,
    private readonly baseUrl = (process.env.GEMINI_API_BASE_URL?.trim() || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/u, ""),
    private readonly timeoutMs = positiveInteger(process.env.AI_PROVIDER_TIMEOUT_MS, 30_000),
    private readonly request = fetch
  ) {}

  async transcribe(input: { bytes: Uint8Array; mimeType: string }) {
    const mimeType = input.mimeType.split(";", 1)[0].trim().toLowerCase();
    let response: Response;
    try {
      response = await this.request(`${this.baseUrl}/interactions`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify({
          model: this.model,
          store: false,
          input: [{ type: "audio", data: Buffer.from(input.bytes).toString("base64"), mime_type: mimeType }],
          generation_config: { transcription_config: { mode: { type: "verbatim" } } }
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch {
      throw new AiProviderUnavailableError("Speech transcription provider is unavailable");
    }
    const body = await response.json().catch(() => null) as InteractionResponse | null;
    if (!response.ok) throw new AiProviderUnavailableError(body?.error?.message || `Speech transcription failed (${response.status})`);
    const transcript = (body?.output_text ?? body?.steps?.flatMap((step) => step.content ?? []).filter((item) => item.type === "text").map((item) => item.text ?? "").join(" ") ?? "").trim();
    if (!transcript) throw new AiProviderUnavailableError("Speech transcription returned no text");
    return { transcript, usage: { promptTokens: body?.usage?.total_input_tokens ?? null, responseTokens: body?.usage?.total_output_tokens ?? null } };
  }
}

export function getGeminiTranscriptionProvider(): GeminiTranscriptionProvider | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GeminiTranscriptionProvider(process.env.GEMINI_TRANSCRIBE_MODEL?.trim() || "gemini-3.5-transcribe", apiKey);
}
