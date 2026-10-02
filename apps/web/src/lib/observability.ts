import { randomUUID } from "node:crypto";
import { createDatabase } from "@/db/client";
import { telemetryEvents } from "@/db/schema";

type Properties = Record<string, string | number | boolean | null | undefined>;
type Event = { name: string; properties?: Properties };

const MAX_MESSAGE = 1_000;

function clean(properties: Properties = {}): Record<string, string | number | boolean | null> {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 300) : value ?? null]));
}

/** One JSON line per record, so the hosting platform's log search can filter by field. */
function log(level: "info" | "error", record: Record<string, unknown>) {
  const line = JSON.stringify({ level, time: new Date().toISOString(), service: "english-4-free-web", ...record });
  if (level === "error") console.error(line); else console.info(line);
}

async function store(row: { kind: "event" | "error"; name: string; message?: string | null; path?: string | null; properties: Record<string, unknown> }) {
  try {
    const db = createDatabase();
    if (db) await db.insert(telemetryEvents).values({ id: randomUUID(), kind: row.kind, name: row.name.slice(0, 128), message: row.message?.slice(0, MAX_MESSAGE) ?? null, path: row.path?.slice(0, 512) ?? null, properties: row.properties });
  } catch {
    // Telemetry must never break the request it describes.
  }
}

/**
 * A product event (onboarding finished, placement finished, signed in…), kept in the
 * telemetry table for the admin operations page. Never pass learner-written text.
 */
export async function captureEvent(event: Event): Promise<void> {
  const properties = clean(event.properties);
  if (process.env.NODE_ENV !== "production") console.info(`[analytics] ${event.name}`, properties);
  await store({ kind: "event", name: event.name, properties });
}

/** A server or browser error: logged as JSON and stored for the operations page. */
export async function captureError(error: unknown, context: Properties & { path?: string } = {}): Promise<void> {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
  const digest = typeof error === "object" && error && "digest" in error && typeof error.digest === "string" ? error.digest : undefined;
  // A browser report is wrapped in an Error on the server; that stack would only show this file.
  const stack = context.source !== "browser" && error instanceof Error && error.stack ?error.stack.split("\n").slice(0, 6).join("\n") : undefined;
  const { path, ...rest } = context;
  const properties = clean({ ...rest, digest });
  log("error", { event: "error", name, message, path, ...properties, stack });
  await store({ kind: "error", name, message, path: path ?? null, properties: { ...properties, ...(stack ? { stack } : {}) } });
}
