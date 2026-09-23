import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.SPEECH_SERVICE_URL;
  if (!baseUrl) return NextResponse.json({ configured: false, reachable: false });
  try { const headers = process.env.SPEECH_SERVICE_API_KEY ? { "x-api-key": process.env.SPEECH_SERVICE_API_KEY } : undefined; const response = await fetch(new URL("/health", baseUrl), { headers, cache: "no-store", signal: AbortSignal.timeout(1500) }); return NextResponse.json({ configured: true, reachable: response.ok }); }
  catch { return NextResponse.json({ configured: true, reachable: false }); }
}
