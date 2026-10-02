import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { cookies } from "next/headers";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { createDatabase } from "@/db/client";
import { captureEvent } from "@/lib/observability";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { guestCookieName } from "@/modules/auth/request-actor";
import { linkAccountOnSignIn } from "@/modules/learners/repository";
import { emailFrom, isEmailSignInConfigured, sendSignInEmail } from "@/modules/auth/email-sign-in";

const database = createDatabase();
export const isGoogleSignInEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
/** One-time email links need the database (they are stored as verification tokens). */
export const isEmailSignInEnabled = Boolean(database) && isEmailSignInConfigured();

export const { auth, handlers, signIn, signOut } = NextAuth({
  // The adapter defaults to singular tables (user/account/session). Our
  // application schema intentionally uses plural table names, so the mapping
  // must be explicit or the Google callback will query nonexistent tables.
  adapter: database ? DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }) : undefined,
  session: { strategy: database ? "database" : "jwt" },
  providers: [
    ...(isGoogleSignInEnabled ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })] : []),
    ...(isEmailSignInEnabled ? [Resend({ apiKey: process.env.AUTH_RESEND_KEY ?? "local-outbox", from: emailFrom(), sendVerificationRequest: sendSignInEmail })] : [])
  ],
  // Keep sign-in inside the app: the "check your inbox" note and errors show on /login.
  // Auth.js appends ?provider=resend&type=email to verifyRequest, which /login shows as "check your inbox".
  pages: { signIn: "/login", verifyRequest: "/login", error: "/login" },
  trustHost: true,
  callbacks: {
    // Stay on this site: relative paths, the request origin and the configured AUTH_URL origin
    // are allowed (behind a proxy the request origin can differ from the public one).
    redirect({ url, baseUrl }) {
      if (url.startsWith("/") && !url.startsWith("//")) return new URL(url, baseUrl).toString();
      try {
        const origin = new URL(url).origin;
        const configured = process.env.AUTH_URL ? new URL(process.env.AUTH_URL).origin : null;
        if (origin === new URL(baseUrl).origin || origin === configured) return url;
      } catch { /* not a URL */ }
      return baseUrl;
    }
  },
  events: {
    // The browser's guest learner becomes (or is merged into) the account's learner.
    signIn: async ({ user, account }) => {
      if (!user?.id) return;
      await captureEvent({ name: "signed_in", properties: { provider: account?.provider ?? "unknown" } });
      try {
        await linkAccountOnSignIn(user.id, (await cookies()).get(guestCookieName)?.value ?? null);
      } catch {
        // Cookie store or database unavailable here; the link is made on the next request instead.
      }
    },
    // The guest cookie is linked to the account's learner, so a shared browser must start a fresh guest after sign-out.
    signOut: async () => {
      try { (await cookies()).delete(guestCookieName); } catch { /* read-only cookie store in this context */ }
    }
  }
});
