import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { linkAccountOnSignIn } from "@/modules/learners/repository";

/** The seeded demo learner (`pnpm seed:demo-account`), with about three weeks of study history. */
export const DEMO_USER = { id: "00000000-0000-4000-8000-0000000000d8", email: "demo-learner@english4free.local", name: "Minh Anh (demo)" } as const;

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const sessionDays = 7;

/**
 * One-click sign-in to the demo account, for presenting the app on a local machine. It needs
 * E4F_DEMO_SIGN_IN=true and a local english4free* database, so a deployed app never offers it.
 */
export function isDemoSignInEnabled(): boolean {
  return process.env.E4F_DEMO_SIGN_IN === "true" && isLocalDatabase();
}

/** True for a local english4free* database: the only place local-only conveniences may run. */
export function isLocalDatabase(): boolean {
  if (!process.env.DATABASE_URL) return false;
  try {
    const url = new URL(process.env.DATABASE_URL);
    return localHosts.has(url.hostname) && /^\/english4free(?:[_-].+)?$/u.test(url.pathname);
  } catch {
    return false;
  }
}

/** Auth.js names its database-session cookie by whether the app is served over HTTPS. */
export function sessionCookie(secure: boolean) {
  return { name: secure ? "__Secure-authjs.session-token" : "authjs.session-token", secure };
}

/**
 * Opens an Auth.js database session for the demo user and merges this browser's guest
 * progress into it, exactly as a Google sign-in does. Returns null when the demo account
 * has not been seeded.
 */
export async function openDemoSession(guestId: string | null): Promise<{ token: string; expires: Date } | null> {
  const db = createDatabase();
  if (!db || !isDemoSignInEnabled()) return null;
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, DEMO_USER.id)).limit(1);
  if (!user) return null;
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ sessionToken: token, userId: user.id, expires });
  await linkAccountOnSignIn(user.id, guestId);
  return { token, expires };
}
