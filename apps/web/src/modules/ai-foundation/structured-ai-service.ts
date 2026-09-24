import "server-only";
import type { z } from "zod";
import { AiInvalidResponseError, AiProviderUnavailableError, AiRateLimitError, type StructuredAiRequest } from "./contracts";
import { getGeminiProvider } from "./gemini-provider";
import { allowAiRequest } from "./rate-limit";
import { getCachedAiResponse, putCachedAiResponse, recordAiUsage } from "./repository";
import { sha256 } from "./contracts";

function cacheTtlSeconds(value: number | undefined): number {
  if (value) return value;
  const configured = Number(process.env.AI_CACHE_TTL_SECONDS);
  return Number.isInteger(configured) && configured > 0 ? configured : 900;
}

/**
 * Shared provider boundary for all structured AI features. It enforces the same
 * server-side rate limit, cache protocol, response validation and usage audit.
 */
export async function executeStructuredAi<TSchema extends z.ZodType>(request: StructuredAiRequest<TSchema>): Promise<z.infer<TSchema>> {
  const provider = request.provider ?? getGeminiProvider();
  if (!provider) throw new AiProviderUnavailableError("Gemini is not configured");

  const inputHash = sha256(request.cacheInput);
  const actorKey = request.actor.userId ?? request.actor.guestId;
  const limitKey = `${request.operation}:${actorKey}`;
  if (!allowAiRequest(limitKey)) {
    await recordAiUsage({ actor: request.actor, operation: request.operation, provider: provider.name, model: provider.model, inputHash, cacheHit: false, status: "RATE_LIMITED" });
    throw new AiRateLimitError();
  }

  const cacheKey = sha256({ operation: request.operation, provider: provider.name, model: provider.model, input: request.cacheInput });
  const cached = await getCachedAiResponse(cacheKey);
  if (cached !== null) {
    const parsed = request.validator.safeParse(cached);
    if (parsed.success) {
      await recordAiUsage({ actor: request.actor, operation: request.operation, provider: provider.name, model: provider.model, inputHash, cacheHit: true, status: "CACHE_HIT" });
      return parsed.data;
    }
  }

  const startedAt = Date.now();
  try {
    const response = await provider.generateJson({ prompt: request.prompt, systemInstruction: request.systemInstruction, responseSchema: request.responseSchema });
    const parsed = request.validator.safeParse(response.value);
    if (!parsed.success) {
      await recordAiUsage({ actor: request.actor, operation: request.operation, provider: provider.name, model: provider.model, inputHash, cacheHit: false, status: "INVALID_RESPONSE", latencyMs: Date.now() - startedAt, promptTokens: response.usage.promptTokens, responseTokens: response.usage.responseTokens });
      throw new AiInvalidResponseError();
    }
    await putCachedAiResponse({ cacheKey, operation: request.operation, provider: provider.name, model: provider.model, value: parsed.data, ttlSeconds: cacheTtlSeconds(request.cacheTtlSeconds) });
    await recordAiUsage({ actor: request.actor, operation: request.operation, provider: provider.name, model: provider.model, inputHash, cacheHit: false, status: "SUCCESS", latencyMs: Date.now() - startedAt, promptTokens: response.usage.promptTokens, responseTokens: response.usage.responseTokens });
    return parsed.data;
  } catch (error) {
    if (error instanceof AiInvalidResponseError) throw error;
    await recordAiUsage({ actor: request.actor, operation: request.operation, provider: provider.name, model: provider.model, inputHash, cacheHit: false, status: "PROVIDER_UNAVAILABLE", latencyMs: Date.now() - startedAt });
    if (error instanceof AiProviderUnavailableError) throw error;
    throw new AiProviderUnavailableError();
  }
}
