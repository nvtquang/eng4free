/**
 * Applies the data retention policy (`pnpm maintenance:retention`); run it daily from cron or a
 * scheduled job. It removes speaking recordings older than RECORDING_RETENTION_DAYS (180), guest
 * learners not seen for GUEST_RETENTION_DAYS (365) and guests who never studied and have not been
 * seen for EMPTY_GUEST_RETENTION_DAYS (30). Accounts are never removed by this job. It also
 * prunes ended rate-limit windows and telemetry older than TELEMETRY_RETENTION_DAYS (90).
 *
 *   pnpm maintenance:retention            list what would be removed (nothing is deleted)
 *   pnpm maintenance:retention -- --apply delete it
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createDatabase } from "../../apps/web/src/db/client";
import { applyRetention, planRetention, pruneOperationalData, retentionPolicyFromEnv } from "../../apps/web/src/modules/account/retention";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
// Recordings live under apps/web/.local-media, which the app resolves from its own working directory.
process.chdir(resolve(process.cwd(), "apps/web"));

async function main() {
  const db = createDatabase();
  if (!db) throw new Error("DATABASE_URL is required");
  const policy = retentionPolicyFromEnv();
  const plan = await planRetention(db, policy);
  console.log(`Policy: recordings ${policy.recordingDays} days, inactive guests ${policy.guestDays} days, guests who never studied ${policy.emptyGuestDays} days.`);
  console.log(`Due: ${plan.recordingIds.length} recordings, ${plan.inactiveGuestIds.length} inactive guests, ${plan.emptyGuestIds.length} empty guests.`);
  if (!process.argv.includes("--apply")) { console.log("Dry run: nothing was deleted. Pass --apply to delete."); return; }
  const result = await applyRetention(db, plan);
  console.log(`Deleted ${result.learners} guest learners and ${result.recordingFiles} recording files.`);
  const pruned = await pruneOperationalData(db, policy);
  console.log(`Pruned ${pruned.counters} expired rate-limit windows and ${pruned.telemetry} telemetry events older than ${policy.telemetryDays} days.`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => process.exit());
