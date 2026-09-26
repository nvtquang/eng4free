import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

/**
 * Runs Playwright against a dedicated database so that E2E resets and the
 * content it publishes never touch the local demo database.
 *
 * E2E_DATABASE_URL wins when set; otherwise the database name in DATABASE_URL is
 * replaced with `english4free_e2e`. Extra CLI arguments are passed to Playwright.
 */
for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);

const baseUrl = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
if (!baseUrl) throw new Error("DATABASE_URL (or E2E_DATABASE_URL) is required to run E2E tests.");
const target = new URL(baseUrl);
if (!process.env.E2E_DATABASE_URL) target.pathname = "/english4free_e2e";
const database = target.pathname.replace(/^\//u, "");
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
if (!localHosts.has(target.hostname) || !/^english4free(?:[_-].+)?$/u.test(database)) throw new Error(`Refusing to run E2E against non-local or unexpected database: ${target.hostname}/${database}`);
if (!process.env.E2E_DATABASE_URL && process.env.DATABASE_URL && new URL(process.env.DATABASE_URL).pathname === target.pathname) throw new Error("E2E database must differ from DATABASE_URL; set E2E_DATABASE_URL explicitly to reuse it.");

async function ensureDatabase() {
  const maintenance = new URL(target); maintenance.pathname = "/postgres";
  const sql = postgres(maintenance.toString(), { max: 1, prepare: false, onnotice: () => undefined });
  try {
    const existing = await sql`SELECT 1 FROM pg_database WHERE datname = ${database}`;
    if (existing.length === 0) { await sql.unsafe(`CREATE DATABASE "${database}"`); console.log(`Created E2E database ${database}.`); }
  } finally { await sql.end(); }
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true, env: { ...process.env, DATABASE_URL: target.toString() } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

ensureDatabase().then(() => {
  console.log(`Running E2E against ${target.hostname}/${database}.`);
  run("pnpm", ["qa:prepare"]);
  run("pnpm", ["--filter", "@english4free/web", "build"]);
  run("pnpm", ["--filter", "@english4free/web", "exec", "playwright", "test", ...process.argv.slice(2)]);
}).catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
