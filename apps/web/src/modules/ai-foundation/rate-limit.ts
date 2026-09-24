const hits = new Map<string, { count: number; resetAt: number }>();

function configNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function allowAiRequest(key: string, limit = configNumber(process.env.AI_RATE_LIMIT_MAX_REQUESTS, 10), windowMs = configNumber(process.env.AI_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1_000)): boolean {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || now >= current.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

/** Only for deterministic unit tests; never called by application code. */
export function resetAiRateLimitForTests(): void {
  hits.clear();
}
