import { createHash } from "node:crypto";
import type { LearnerRef } from "@/modules/learners/types";
import type { z } from "zod";

export const AI_OPERATIONS = ["TUTOR_EXPLANATION", "WRITING_FEEDBACK", "SPEECH_TRANSCRIPTION", "SPEAKING_FEEDBACK", "ASSISTANT_CHAT"] as const;
export type AiOperation = (typeof AI_OPERATIONS)[number];
export type AiActor = LearnerRef;
export type AiUsageStatus = "SUCCESS" | "CACHE_HIT" | "RATE_LIMITED" | "BUDGET_EXHAUSTED" | "PROVIDER_UNAVAILABLE" | "INVALID_RESPONSE";
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

/** LEARNER and IP limits reset within the hour; DAILY_BUDGET is the whole site's allowance for today. */
export class AiRateLimitError extends Error {
  constructor(readonly reason: "LEARNER" | "IP" | "DAILY_BUDGET" = "LEARNER") {
    super(reason === "DAILY_BUDGET" ? "AI feedback has reached today's limit for the whole site. Please try again tomorrow." : "AI request limit reached. Please try again later.");
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
