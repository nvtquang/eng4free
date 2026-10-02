import { sql } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { rateLimitCounters } from "@/db/schema";

/** Fallback when there is no database (unit tests, in-memory mode): one process only. */
const memory = new Map<string, number>();

/** Start of the fixed window that contains `now`. */
export function windowStart(now: Date, windowMs: number): Date {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

/**
 * Counts one hit for `key` in the current fixed window and returns the count so far. Counters
 * live in PostgreSQL, so every app instance and every restart sees the same numbers; the
 * increment is a single atomic upsert.
 */
export async function hitCounter(key: string, windowMs: number, now = new Date()): Promise<number> {
  const start = windowStart(now, windowMs);
  const db = createDatabase();
  if (!db) {
    const memoryKey = `${key}@${start.getTime()}`;
    const count = (memory.get(memoryKey) ?? 0) + 1;
    memory.set(memoryKey, count);
    return count;
  }
  const [row] = await db.insert(rateLimitCounters)
    .values({ key, windowStart: start, count: 1, expiresAt: new Date(start.getTime() + windowMs) })
    .onConflictDoUpdate({ target: [rateLimitCounters.key, rateLimitCounters.windowStart], set: { count: sql`${rateLimitCounters.count} + 1` } })
    .returning({ count: rateLimitCounters.count });
  return row?.count ?? 1;
}

/** Only for deterministic unit tests. */
export function resetMemoryCountersForTests(): void {
  memory.clear();
}
