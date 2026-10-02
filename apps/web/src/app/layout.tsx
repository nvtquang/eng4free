import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { GuestSessionBootstrap } from "@/components/guest-session-bootstrap";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantWidget } from "@/components/ai-assistant-widget";
import { auth } from "@/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { shareImage, siteName, siteText, siteUrl } from "@/lib/metadata";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin", "vietnamese"], variable: "--font-source-serif", display: "swap" });

/** Site-wide defaults; every public page sets its own title, canonical URL and hreflang. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = siteText[locale];
  return { metadataBase: siteUrl(), applicationName: siteName, title: { default: text.title, template: "%s · English 4 Free" }, description: text.description, openGraph: { siteName, type: "website", locale: locale === "vi" ? "vi_VN" : "en_US", images: [shareImage] }, twitter: { card: "summary_large_image", images: [shareImage.url] } };
}

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
        <AiAssistantWidget copy={messages.assistant} name={viewer?.name ?? null} />
      </body>
    </html>
  );
}
