import "server-only";
import { AiProviderUnavailableError, type StructuredAiProvider, type StructuredProviderRequest, type StructuredProviderResponse } from "./contracts";

type GeminiResponse = {
  output_text?: string;
  steps?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  usage?: { total_input_tokens?: number; total_output_tokens?: number };
  error?: { message?: string };
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Gemini 3 models think by default; "low" keeps structured feedback well inside the request budget. */
function configuredThinkingLevel(value: string | undefined): string {
  const level = value?.trim().toLowerCase();
  return level === "minimal" || level === "low" || level === "medium" || level === "high" ? level : "low";
}

/** Transient provider overload; one retry usually succeeds. */
const retryableStatuses = new Set([500, 502, 503]);

function configuredBaseUrl(value: string | undefined): string {
  return (value?.trim() || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/u, "");
}

/**
 * Thin server-side Gemini REST adapter. It is deliberately isolated from Tutor
 * and Writing so another provider can implement StructuredAiProvider later.
 */
export class GeminiProvider implements StructuredAiProvider {
  readonly name = "gemini" as const;

  constructor(
    readonly model: string,
    private readonly apiKey: string,
    private readonly baseUrl = configuredBaseUrl(process.env.GEMINI_API_BASE_URL),
    private readonly timeoutMs = positiveInteger(process.env.AI_PROVIDER_TIMEOUT_MS, 30_000),
    private readonly request = fetch,
    private readonly thinkingLevel = configuredThinkingLevel(process.env.AI_THINKING_LEVEL)
  ) {}

  async generateJson(input: StructuredProviderRequest): Promise<StructuredProviderResponse> {
    const body = JSON.stringify({
      model: this.model,
      system_instruction: input.systemInstruction,
      input: input.prompt,
      generation_config: { temperature: 0.2, thinking_level: this.thinkingLevel },
      response_format: { type: "text", mime_type: "application/json", schema: input.responseSchema }
    });
    let response: Response | undefined;
    for (let attempt = 0; attempt < 2 && (!response || retryableStatuses.has(response.status)); attempt += 1) {
      try {
        response = await this.request(`${this.baseUrl}/interactions`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": this.apiKey },
          body,
          cache: "no-store",
          signal: AbortSignal.timeout(this.timeoutMs)
        });
      } catch {
        throw new AiProviderUnavailableError();
      }
    }
    if (!response) throw new AiProviderUnavailableError();

    const result = await response.json().catch(() => null) as GeminiResponse | null;
    if (!response.ok) throw new AiProviderUnavailableError(result?.error?.message || `Gemini request failed (${response.status})`);
    const text = (result?.output_text ?? result?.steps?.flatMap((step) => step.content ?? []).filter((content) => content.type === "text").map((content) => content.text ?? "").join(" ") ?? "").trim();
    if (!text) throw new AiProviderUnavailableError("Gemini returned no response text");
    try {
      return {
        value: JSON.parse(text),
        usage: {
          promptTokens: result?.usage?.total_input_tokens ?? null,
          responseTokens: result?.usage?.total_output_tokens ?? null
        }
      };
    } catch {
      throw new AiProviderUnavailableError("Gemini did not return JSON");
    }
  }
}

export function getGeminiProvider(): GeminiProvider | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GeminiProvider(process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash", apiKey);
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
