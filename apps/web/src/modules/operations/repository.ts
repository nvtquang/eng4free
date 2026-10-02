import { sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { aiLimits } from "@/modules/ai-foundation/rate-limit";

export type Funnel = { visitors: number; onboarded: number; firstLesson: number; returned: number };

const rows = <T>(result: unknown) => [...(result as Iterable<T>)];

/**
 * Learners first seen in the last `days`: how many set up a profile, finished a lesson, and
 * came back to study on a second day (in Vietnam time). Visitors include every guest session,
 * so crawlers that run JavaScript are counted there too.
 */
export async function learnerFunnel(db: Database, days: number): Promise<Funnel> {
  const [row] = rows<Record<keyof Funnel, number>>(await db.execute(sql`
    SELECT count(*)::int AS "visitors",
           count(p.learner_id)::int AS "onboarded",
           count(*) FILTER (WHERE EXISTS (SELECT 1 FROM progress_events e WHERE e.learner_id = l.id AND e.type = 'LESSON_COMPLETED'))::int AS "firstLesson",
           count(*) FILTER (WHERE (SELECT count(DISTINCT (e.occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) FROM progress_events e WHERE e.learner_id = l.id) >= 2)::int AS "returned"
    FROM learners l LEFT JOIN learner_profiles p ON p.learner_id = l.id
    WHERE l.created_at >= now() - make_interval(days => ${days})`));
  return row ?? { visitors: 0, onboarded: 0, firstLesson: 0, returned: 0 };
}

/** AI calls today (UTC, the day the budget counts) by status, and the budget spent so far. */
export async function aiToday(db: Database) {
  const usage = rows<{ operation: string; status: string; count: number }>(await db.execute(sql`
    SELECT operation, status, count(*)::int AS count FROM ai_usage_logs
    WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    GROUP BY operation, status ORDER BY operation, status`));
  const spent = rows<{ key: string; count: number }>(await db.execute(sql`
    SELECT key, count FROM rate_limit_counters
    WHERE key IN ('ai:budget:TEXT', 'ai:budget:TRANSCRIPTION') AND window_start = date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`));
  const limits = aiLimits().budget;
  const used = (budget: "TEXT" | "TRANSCRIPTION") => spent.find((row) => row.key === `ai:budget:${budget}`)?.count ?? 0;
  return { usage, budget: { TEXT: { used: used("TEXT"), limit: limits.TEXT }, TRANSCRIPTION: { used: used("TRANSCRIPTION"), limit: limits.TRANSCRIPTION } } };
}

/** Errors of the last `days`, grouped by kind, message and page, most frequent first. */
export async function recentErrors(db: Database, days: number) {
  return rows<{ name: string; message: string | null; path: string | null; source: string | null; count: number; lastSeen: Date }>(await db.execute(sql`
    SELECT name, message, path, properties->>'source' AS source, count(*)::int AS count, max(created_at) AS "lastSeen"
    FROM telemetry_events WHERE kind = 'error' AND created_at >= now() - make_interval(days => ${days})
    GROUP BY name, message, path, properties->>'source' ORDER BY count DESC, "lastSeen" DESC LIMIT 30`));
}

/** Product events of the last `days`, by name. */
export async function eventCounts(db: Database, days: number) {
  return rows<{ name: string; count: number }>(await db.execute(sql`
    SELECT name, count(*)::int AS count FROM telemetry_events
    WHERE kind = 'event' AND created_at >= now() - make_interval(days => ${days})
    GROUP BY name ORDER BY count DESC`));
}
