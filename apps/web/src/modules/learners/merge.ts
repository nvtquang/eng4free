import { sql, type SQL } from "drizzle-orm";
import type { Database } from "@/db/client";

/**
 * Every table that stores learner-owned rows, keyed by table name. `unique` lists the
 * columns that, together with learner_id, must stay unique: when both learners own the
 * same thing (the same word, lesson, question or the profile) the newer row wins.
 * A unit test fails if a table with a learner_id column is missing from this list.
 */
export const learnerOwnedTables: Record<string, { unique?: string[] }> = {
  attempts: {},
  writing_submissions: {},
  speaking_sessions: {},
  progress_events: {},
  media: {},
  ai_usage_logs: {},
  lesson_completions: { unique: ["lesson_id"] },
  vocabulary_reviews: { unique: ["vocabulary_id"] },
  mistakes: { unique: ["question_id"] },
  learner_profiles: { unique: [] },
  placement_attempts: {}
};

function sameKey(columns: string[]): SQL {
  return columns.length ? sql.join(columns.map((column) => sql`a.${sql.identifier(column)} = b.${sql.identifier(column)}`), sql` AND `) : sql`TRUE`;
}

/** Moves everything `from` owns to `into`, re-points its links and deletes it. Runs in one transaction. */
export async function mergeLearners(db: Database, from: string, into: string): Promise<void> {
  if (from === into) return;
  await db.transaction(async (tx) => {
    for (const [table, { unique }] of Object.entries(learnerOwnedTables)) {
      const name = sql.identifier(table);
      if (unique) {
        await tx.execute(sql`DELETE FROM ${name} a USING ${name} b WHERE a.learner_id = ${from} AND b.learner_id = ${into} AND ${sameKey(unique)} AND a.updated_at <= b.updated_at`);
        await tx.execute(sql`DELETE FROM ${name} b USING ${name} a WHERE b.learner_id = ${into} AND a.learner_id = ${from} AND ${sameKey(unique)}`);
      }
      await tx.execute(sql`UPDATE ${name} SET learner_id = ${into} WHERE learner_id = ${from}`);
    }
    await tx.execute(sql`UPDATE learner_links SET learner_id = ${into} WHERE learner_id = ${from}`);
    await tx.execute(sql`DELETE FROM learners WHERE id = ${from}`);
  });
}
