import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is required to sign unsubscribe links");
  return value;
}

/** A per-account token for the unsubscribe link, so the link works without signing in. */
export function unsubscribeToken(userId: string): string {
  return createHmac("sha256", secret()).update(`reminders:unsubscribe:${userId}`).digest("base64url");
}

export function isValidUnsubscribeToken(userId: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(userId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(baseUrl: URL, userId: string): string {
  const url = new URL("/unsubscribe", baseUrl);
  url.searchParams.set("u", userId);
  url.searchParams.set("t", unsubscribeToken(userId));
  return url.toString();
}

/** The one-click endpoint (RFC 8058) that mail apps call from the List-Unsubscribe header. */
export function oneClickUnsubscribeUrl(baseUrl: URL, userId: string): string {
  const url = new URL("/api/reminders/unsubscribe", baseUrl);
  url.searchParams.set("u", userId);
  url.searchParams.set("t", unsubscribeToken(userId));
  return url.toString();
}
