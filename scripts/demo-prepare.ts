import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { delimiter, join, resolve } from "node:path";
import postgres from "postgres";

/**
 * Rebuilds the local demo database in one command (`pnpm demo:prepare`):
 *
 *   1. backs the current database up with pg_dump into .cache/demo-backups/
 *   2. resets the schema and runs every migration
 *   3. seeds the base data and imports content pack D3
 *   4. republishes the D3 batches whose content matches what was approved
 *      (content/packs/d3/qa/approved.json); a batch edited since then stays in review
 *   5. checks that every listening script has a recording, generating missing ones
 *   6. seeds the demo account with about three weeks of history
 *   7. makes the production build that `pnpm demo:start` serves
 *
 *   --no-backup    skip step 1 (for a database with nothing worth keeping)
 *   --skip-build   skip step 7
 *
 * Only local databases named english4free* are accepted, and never the E2E database.
 */
for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);

const args = new Set(process.argv.slice(2));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required (apps/web/.env.local).");
const target = new URL(databaseUrl);
const database = target.pathname.replace(/^\//u, "");
if (!["localhost", "127.0.0.1", "::1"].includes(target.hostname) || !/^english4free(?:[_-].+)?$/u.test(database)) throw new Error(`Refusing to prepare a non-local or unexpected database: ${target.hostname}/${database}`);
if (/(^|_)e2e$/u.test(database)) throw new Error(`${database} belongs to the E2E suite; point DATABASE_URL at the demo database.`);

function run(label: string, command: string, commandArgs: string[], options: { allowFailure?: boolean } = {}) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(command, commandArgs, { stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0 && !options.allowFailure) {
    console.error(`\n✗ ${label} failed. The database may be half-built; fix the problem and run pnpm demo:prepare again.`);
    process.exit(result.status ?? 1);
  }
  return result.status === 0;
}

/** pg_dump from PG_BIN, the PATH, or the usual Windows install folders. */
function findPgDump(): string | null {
  const name = process.platform === "win32" ? "pg_dump.exe" : "pg_dump";
  const folders = [process.env.PG_BIN, ...(process.env.PATH ?? "").split(delimiter), "D:/PostgreSQL/bin", "C:/PostgreSQL/bin"];
  for (const root of ["C:/Program Files/PostgreSQL", "D:/Program Files/PostgreSQL"]) {
    if (existsSync(root)) folders.push(...readdirSync(root).sort().reverse().map((version) => join(root, version, "bin")));
  }
  for (const folder of folders) if (folder && existsSync(join(folder, name))) return join(folder, name);
  return null;
}

async function ensureDatabase(): Promise<boolean> {
  const maintenance = new URL(target); maintenance.pathname = "/postgres";
  const sql = postgres(maintenance.toString(), { max: 1, prepare: false, onnotice: () => undefined });
  try {
    if ((await sql`SELECT 1 FROM pg_database WHERE datname = ${database}`).length) return true;
    await sql.unsafe(`CREATE DATABASE "${database}"`);
    console.log(`Created database ${database}.`);
    return false;
  } finally { await sql.end(); }
}

async function main() {
  console.log(`Preparing the demo on ${target.hostname}/${database}.`);
  const existed = await ensureDatabase();

  if (existed && !args.has("--no-backup")) {
    const pgDump = findPgDump();
    if (!pgDump) throw new Error("pg_dump was not found. Set PG_BIN to PostgreSQL's bin folder, or pass --no-backup to reset without a backup.");
    const folder = resolve(process.cwd(), ".cache/demo-backups");
    mkdirSync(folder, { recursive: true });
    const file = join(folder, `${database}-${new Date().toISOString().replace(/[:.]/gu, "-")}.dump`);
    console.log(`\n▶ Backing up ${database}`);
    const result = spawnSync(pgDump, ["-Fc", "-f", file, databaseUrl!], { stdio: "inherit" });
    if (result.status !== 0) throw new Error("pg_dump failed; nothing was reset.");
    console.log(`Backup: ${file}\nRestore with: pg_restore --clean --if-exists --no-owner -d <DATABASE_URL> "${file}"`);
  }

  run("Resetting the schema", "pnpm", ["db:reset"]);
  run("Running migrations", "pnpm", ["db:migrate"]);
  run("Seeding base data", "pnpm", ["db:seed"]);
  run("Importing content pack D3", "pnpm", ["content:d3:import"]);
  run("Publishing approved content", "pnpm", ["content:d3:publish", "--from-record"]);
  if (!run("Checking listening audio", "pnpm", ["content:check-audio"], { allowFailure: true })) {
    run("Generating missing audio (Piper TTS)", "pnpm", ["content:generate-audio"]);
    run("Checking listening audio again", "pnpm", ["content:check-audio"]);
  }
  run("Seeding the demo account", "pnpm", ["seed:demo-account"]);
  if (!args.has("--skip-build")) run("Building the app", "pnpm", ["--filter", "@english4free/web", "build"]);

  console.log(`\n✓ Demo ready. Start it with: pnpm demo:start  (http://localhost:3000, demo account on /login)`);
  console.log("  Content batches still in review (if any) were listed above under “Publishing approved content”.");
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
