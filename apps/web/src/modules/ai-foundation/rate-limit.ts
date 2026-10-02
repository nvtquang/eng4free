import { hitCounter, resetMemoryCountersForTests } from "@/modules/rate-limit/counter";
import { getClientIp } from "@/modules/rate-limit/client-ip";

/** Why an AI request was refused. */
export type AiLimitReason = "LEARNER" | "IP" | "DAILY_BUDGET";
/** The provider quota each budget protects: text generation and speech transcription are counted apart. */
export type AiBudget = "TEXT" | "TRANSCRIPTION";

const DAY_MS = 24 * 60 * 60 * 1_000;

function configNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function aiLimits(env: Record<string, string | undefined> = process.env) {
  return {
    learner: configNumber(env.AI_RATE_LIMIT_MAX_REQUESTS, 10),
    ip: configNumber(env.AI_RATE_LIMIT_IP_MAX_REQUESTS, 30),
    windowMs: configNumber(env.AI_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1_000),
    budget: { TEXT: configNumber(env.AI_DAILY_BUDGET, 200), TRANSCRIPTION: configNumber(env.AI_TRANSCRIPTION_DAILY_BUDGET, 200) } satisfies Record<AiBudget, number>
  };
}

/**
 * Per-learner (per operation) and per-IP limits, checked before any AI work. A guest who clears
 * cookies gets a new learner but keeps the same address, so the IP limit still applies. Counters
 * are shared through PostgreSQL. Returns the reason when the request must be refused.
 */
export async function checkAiRequest(input: { operation: string; learnerId: string; ip?: string | null }, now = new Date()): Promise<AiLimitReason | null> {
  const limits = aiLimits();
  if (await hitCounter(`ai:${input.operation}:learner:${input.learnerId}`, limits.windowMs, now) > limits.learner) return "LEARNER";
  const ip = input.ip === undefined ? await getClientIp() : input.ip;
  if (ip && await hitCounter(`ai:ip:${ip}`, limits.windowMs, now) > limits.ip) return "IP";
  return null;
}

/**
 * Takes one call from the site-wide daily budget, just before a real provider call (cache hits
 * are free). Keep AI_DAILY_BUDGET below the provider's daily quota so one busy day cannot use
 * it all and leave the provider failing for everyone. Days are counted in UTC.
 */
export async function consumeAiBudget(budget: AiBudget, now = new Date()): Promise<boolean> {
  return await hitCounter(`ai:budget:${budget}`, DAY_MS, now) <= aiLimits().budget[budget];
}

/** Only for deterministic unit tests (counters without a database live in memory). */
export function resetAiRateLimitForTests(): void {
  resetMemoryCountersForTests();
}
