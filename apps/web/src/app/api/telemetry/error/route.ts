import { NextResponse } from "next/server";
import { z } from "zod";
import { captureError } from "@/lib/observability";
import { getClientIp } from "@/modules/rate-limit/client-ip";
import { hitCounter } from "@/modules/rate-limit/counter";

const Schema = z.object({ message: z.string().max(1_000), digest: z.string().max(64).optional(), path: z.string().max(512) });
const PER_HOUR = 20;

/** Errors the browser shows on the error pages; limited per address so it cannot fill the table. */
export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid error report" }, { status: 400 });
  const ip = await getClientIp();
  if (await hitCounter(`telemetry:ip:${ip ?? "unknown"}`, 60 * 60 * 1_000) > PER_HOUR) return NextResponse.json({ stored: false }, { status: 429 });
  await captureError(Object.assign(new Error(parsed.data.message), { name: "BrowserError", digest: parsed.data.digest }), { source: "browser", path: parsed.data.path });
  return NextResponse.json({ stored: true });
}
