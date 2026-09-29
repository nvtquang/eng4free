import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { cookies } from "next/headers";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createDatabase } from "@/db/client";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { guestCookieName } from "@/modules/auth/request-actor";
import { mergeGuestIntoUser } from "@/modules/onboarding/merge";

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
    // First sign-in folds the anonymous guest's work (attempts, XP, vocabulary,
    // writing, recordings, onboarding profile) into the account.
    signIn: async ({ user }) => {
      if (!user?.id) return;
      try {
        const guestId = (await cookies()).get(guestCookieName)?.value;
        if (guestId) await mergeGuestIntoUser(guestId, user.id);
      } catch {
        // Cookie store or database unavailable in this context; skip the merge.
      }
    }
  }
});
