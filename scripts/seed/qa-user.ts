import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../../apps/web/src/db/schema";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed the QA user.");

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);
const qaUser = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "English 4 Free QA Learner",
  email: "qa-learner@english4free.local",
  emailVerified: new Date("2026-01-01T00:00:00.000Z")
};

db.insert(users).values(qaUser).onConflictDoUpdate({
  target: users.email,
  set: { name: qaUser.name, emailVerified: qaUser.emailVerified }
}).then(() => console.log("Seeded deterministic QA learner."))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
