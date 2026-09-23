import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createDatabase } from "@/db/client";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

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
  trustHost: true
});
