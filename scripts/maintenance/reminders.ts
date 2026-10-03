/**
 * Sends the study reminder emails that are due (`pnpm maintenance:reminders`). Run it at the
 * start of every hour (.github/workflows/reminders.yml, or cron); each account is emailed at
 * most once a day, at its chosen hour in Vietnam.
 *
 *   --at=2026-10-03T12:00:00Z   pretend the run happens at this time (tests and catch-up runs)
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createDatabase } from "../../apps/web/src/db/client";
import { isEmailConfigured } from "../../apps/web/src/modules/email/send";
import { sendDueReminders } from "../../apps/web/src/modules/reminders/service";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
// The mail outbox (local runs) lives under apps/web, like the app's own working directory.
process.chdir(resolve(process.cwd(), "apps/web"));

async function main() {
  const db = createDatabase();
  if (!db) throw new Error("DATABASE_URL is required");
  if (!isEmailConfigured()) throw new Error("Email is not configured: set AUTH_RESEND_KEY and AUTH_EMAIL_FROM (or E4F_MAIL_OUTBOX=true locally).");
  const at = process.argv.find((arg) => arg.startsWith("--at="))?.slice(5);
  const now = at ? new Date(at) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error(`Invalid --at time: ${at}`);
  const run = await sendDueReminders(db, now);
  console.log(`Reminders at ${now.toISOString()}: ${run.checked} accounts with reminders on, ${run.sent} sent, ${run.failed} failed.`);
  if (run.failed) process.exitCode = 1;
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => process.exit());
