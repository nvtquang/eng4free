import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { GuestSessionBootstrap } from "@/components/guest-session-bootstrap";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/auth";
import { getLocale, getMessages } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin", "vietnamese"], variable: "--font-source-serif", display: "swap" });

export const metadata: Metadata = {
  title: "English 4 Free",
  description: "Free English learning for CEFR, TOEIC and IELTS."
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const session = await auth().catch(() => null);
  const viewer = session?.user?.email ? { name: session.user.name ?? null, email: session.user.email } : null;
  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${sourceSerif.variable}`}>
        <a className="skip-link" href="#main-content">{messages.common.skipContent}</a>
        <SiteHeader locale={locale} messages={messages} viewer={viewer} />
        {!viewer && <GuestSessionBootstrap />}
        <main id="main-content">{children}</main>
        <SiteFooter messages={messages} />
      </body>
    </html>
  );
}
