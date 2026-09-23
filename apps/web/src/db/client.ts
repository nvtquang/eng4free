import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function buildDatabase(connectionString: string) {
  // A single postgres-js pool must be shared by all repositories. Creating a
  // pool per request quickly exhausts PostgreSQL's connection limit in Next.js.
  const client = postgres(connectionString, { prepare: false, max: 10 });
  return drizzle(client, { schema });
}

const globalForDatabase = globalThis as typeof globalThis & {
  english4FreeDatabase?: ReturnType<typeof buildDatabase>;
};

export function createDatabase() {
  if (process.env.E4F_USE_IN_MEMORY === "true") return null;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  globalForDatabase.english4FreeDatabase ??= buildDatabase(connectionString);
  return globalForDatabase.english4FreeDatabase;
}

export type Database = NonNullable<ReturnType<typeof createDatabase>>;
