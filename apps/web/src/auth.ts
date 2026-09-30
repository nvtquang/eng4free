import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { cookies } from "next/headers";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createDatabase } from "@/db/client";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { guestCookieName } from "@/modules/auth/request-actor";
import { linkAccountOnSignIn } from "@/modules/learners/repository";

const database = createDatabase();
export const isGoogleSignInEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

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
  providers: isGoogleSignInEnabled ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })] : [],
  trustHost: true,
  events: {
    // The browser's guest learner becomes (or is merged into) the account's learner.
    signIn: async ({ user }) => {
      if (!user?.id) return;
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
