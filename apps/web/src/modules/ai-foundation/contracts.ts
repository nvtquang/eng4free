import { createHash } from "node:crypto";
import type { z } from "zod";

export const AI_OPERATIONS = ["TUTOR_EXPLANATION", "WRITING_FEEDBACK", "SPEECH_TRANSCRIPTION", "SPEAKING_FEEDBACK"] as const;
export type AiOperation = (typeof AI_OPERATIONS)[number];
export type AiActor = { userId: string | null; guestId: string };
export type AiUsageStatus = "SUCCESS" | "CACHE_HIT" | "RATE_LIMITED" | "PROVIDER_UNAVAILABLE" | "INVALID_RESPONSE";
export type JsonSchema = Record<string, unknown>;

export type GeminiUsage = {
  promptTokens: number | null;
  responseTokens: number | null;
};

export type StructuredProviderRequest = {
  prompt: string;
  systemInstruction: string;
  responseSchema: JsonSchema;
};

export type StructuredProviderResponse = {
  value: unknown;
  usage: GeminiUsage;
};

export interface StructuredAiProvider {
  readonly name: "gemini";
  readonly model: string;
  generateJson(input: StructuredProviderRequest): Promise<StructuredProviderResponse>;
}

export type StructuredAiRequest<TSchema extends z.ZodType> = {
  actor: AiActor;
  operation: AiOperation;
  /** Only a hash of this value is persisted. Never use an API key here. */
  cacheInput: unknown;
  prompt: string;
  systemInstruction: string;
  responseSchema: JsonSchema;
  validator: TSchema;
  cacheTtlSeconds?: number;
  /** Dependency injection for deterministic server-side tests. */
  provider?: StructuredAiProvider;
};

export function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function sha256Bytes(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export class AiRateLimitError extends Error {
  constructor() {
    super("AI request limit reached. Please try again later.");
    this.name = "AiRateLimitError";
  }
}

export class AiProviderUnavailableError extends Error {
  constructor(message = "Gemini provider is unavailable") {
    super(message);
    this.name = "AiProviderUnavailableError";
  }
}

export class AiInvalidResponseError extends Error {
  constructor() {
    super("Gemini returned an invalid structured response");
    this.name = "AiInvalidResponseError";
  }
}
