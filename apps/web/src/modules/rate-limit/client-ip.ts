import { headers } from "next/headers";

/**
 * The client address behind `hops` trusted proxies. Each proxy appends the address it received
 * the request from to X-Forwarded-For, so the trustworthy entry is `hops` from the right; any
 * entries further left were sent by the client and can be forged.
 */
export function clientIpFromHeaders(forwardedFor: string | null, realIp: string | null, hops: number): string | null {
  const chain = (forwardedFor ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  if (chain.length && hops > 0) return chain[Math.max(0, chain.length - hops)] ?? null;
  return realIp?.trim() || null;
}

function trustedHops(): number {
  const parsed = Number(process.env.TRUSTED_PROXY_HOPS);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 1;
}

/** The current request's client address, or null outside a request (scripts, tests). */
export async function getClientIp(): Promise<string | null> {
  try {
    const store = await headers();
    return clientIpFromHeaders(store.get("x-forwarded-for"), store.get("x-real-ip"), trustedHops());
  } catch {
    return null;
  }
}
