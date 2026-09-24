import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { aiResponseCache, aiUsageLogs } from "@/db/schema";
import type { AiActor, AiOperation, AiUsageStatus } from "./contracts";

type CachedResponse = { value: unknown; expiresAt: Date };
type UsageLogInput = {
  actor: AiActor;
  operation: AiOperation;
  provider: string;
  model: string | null;
  inputHash: string;
  cacheHit: boolean;
  status: AiUsageStatus;
  latencyMs?: number | null;
  promptTokens?: number | null;
  responseTokens?: number | null;
  metadata?: Record<string, unknown>;
};

const memoryCache = new Map<string, CachedResponse>();

/** Only for deterministic unit tests; never called by application code. */
export function resetAiCacheForTests(): void {
  memoryCache.clear();
}

export async function getCachedAiResponse(cacheKey: string): Promise<unknown | null> {
  const memory = memoryCache.get(cacheKey);
  if (memory && memory.expiresAt > new Date()) return memory.value;
  if (memory) memoryCache.delete(cacheKey);

  const db = createDatabase();
  if (!db) return null;
  try {
    const [cached] = await db.select({ response: aiResponseCache.response, expiresAt: aiResponseCache.expiresAt })
      .from(aiResponseCache)
      .where(eq(aiResponseCache.cacheKey, cacheKey));
    if (!cached || cached.expiresAt <= new Date()) return null;
    memoryCache.set(cacheKey, { value: cached.response, expiresAt: cached.expiresAt });
    return cached.response;
  } catch {
    return null;
  }
}

export async function putCachedAiResponse(input: { cacheKey: string; operation: AiOperation; provider: string; model: string; value: unknown; ttlSeconds: number }): Promise<void> {
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1_000);
  memoryCache.set(input.cacheKey, { value: input.value, expiresAt });
  const db = createDatabase();
  if (!db) return;
  try {
    await db.insert(aiResponseCache).values({ id: randomUUID(), cacheKey: input.cacheKey, operation: input.operation, provider: input.provider, model: input.model, response: input.value, expiresAt })
      .onConflictDoUpdate({ target: aiResponseCache.cacheKey, set: { response: input.value, operation: input.operation, provider: input.provider, model: input.model, expiresAt } });
  } catch {
    // Cache persistence must never make an otherwise valid response fail.
  }
}

/** Best-effort operational audit. Raw learner text and credentials are never logged. */
export async function recordAiUsage(input: UsageLogInput): Promise<void> {
  const db = createDatabase();
  if (!db) return;
  try {
    await db.insert(aiUsageLogs).values({
      id: randomUUID(), userId: input.actor.userId, guestId: input.actor.guestId,
      operation: input.operation, provider: input.provider, model: input.model,
      inputHash: input.inputHash, cacheHit: input.cacheHit, status: input.status,
      latencyMs: input.latencyMs ?? null, promptTokens: input.promptTokens ?? null,
      responseTokens: input.responseTokens ?? null, metadata: input.metadata ?? {}
    });
  } catch {
    // Observability is intentionally non-blocking for the learner.
  }
}
