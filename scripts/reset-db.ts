import { existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const target = new URL(process.env.DATABASE_URL); const database = target.pathname.replace(/^\//u, ""); const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
if (!localHosts.has(target.hostname) || !/^english4free(?:[_-].+)?$/u.test(database)) throw new Error(`Refusing to reset non-local or unexpected database: ${target.hostname}/${database}`);
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
async function reset() { await sql.unsafe("DROP SCHEMA public CASCADE"); await sql.unsafe("CREATE SCHEMA public"); console.log(`Reset local PostgreSQL database ${database}.`); }
reset().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => sql.end());
