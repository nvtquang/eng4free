import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { BatchKey } from "../../../content/packs/d3/types";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);

/** Stable UUID for a pack key, so re-imports update rows instead of duplicating them. */
export function d3Id(key: string) {
  const hash = createHash("sha256").update(`e4f-d3:${key}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${(8 + (parseInt(hash[16]!, 16) & 3)).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
export const batchId = (key: BatchKey) => d3Id(`batch:${key}`);
export const D3_COURSE_ID = d3Id("course:cefr-path");

export function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const client = postgres(url, { prepare: false, max: 1, onnotice: () => undefined });
  return { client, db: drizzle(client), databaseName: new URL(url).pathname.replace(/^\//u, "") };
}

/** Publishing without a human approval is only allowed on the throwaway E2E/QA databases. */
export function isTestDatabase(name: string) {
  return /(^|_)(e2e|qa|test)$/u.test(name);
}
