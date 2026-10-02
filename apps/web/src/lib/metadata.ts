import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { localeParam, type Locale } from "@/lib/locale";

export const siteName = "English 4 Free";
export type PageText = { title: string; description: string };

/** The site name line used as the home page title and the default description. */
export const siteText: Record<Locale, PageText> = {
  vi: { title: "English 4 Free — Học tiếng Anh miễn phí theo lộ trình A1–C2", description: "Làm bài xếp lớp, học theo lộ trình A1–C2, ôn từ vựng đúng lúc sắp quên và luyện đề TOEIC, IELTS có nhận xét AI. Miễn phí, giao diện tiếng Việt." },
  en: { title: "English 4 Free — Free English learning from A1 to C2", description: "Take a placement test, follow an A1–C2 path, review vocabulary before you forget it and practise TOEIC and IELTS with AI feedback. Free." }
};

/** The share preview used by Facebook, Zalo and others (public/og-image.png, 1200×630). */
export const shareImage = { url: "/og-image.png", width: 1200, height: 630, alt: "English 4 Free: học tiếng Anh miễn phí, có lộ trình A1–C2, luyện TOEIC và IELTS" };

/**
 * Absolute base for canonical, hreflang, Open Graph and sitemap URLs. APP_URL is read at run
 * time, so one Docker image serves any domain (NEXT_PUBLIC_ values are fixed at build time).
 */
export function siteUrl(): URL {
  const env = process.env;
  return new URL(env.APP_URL ?? env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000");
}

/** The URL of a page in one language: Vietnamese is the plain path, English adds `?lang=en`. */
export function localizedPath(path: string, locale: Locale): string {
  return locale === "vi" ? path : `${path}${path.includes("?") ? "&" : "?"}${localeParam}=en`;
}

/** hreflang alternates for a path, in the shape both page metadata and the sitemap use. */
export function languageAlternates(path: string) {
  return { vi: localizedPath(path, "vi"), en: localizedPath(path, "en"), "x-default": localizedPath(path, "vi") };
}

/**
 * Title, description, canonical URL, hreflang alternates and Open Graph for a page, in the
 * request's language. Personal pages (progress, profile, results) pass `index: false`.
 */
export async function pageMetadata(text: Record<Locale, PageText>, path: string, options: { index?: boolean; absoluteTitle?: boolean } = {}): Promise<Metadata> {
  const locale = await getLocale();
  const { title, description } = text[locale];
  const url = localizedPath(path, locale);
  return {
    title: options.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title, description, url, siteName, type: "website", locale: locale === "vi" ? "vi_VN" : "en_US", images: [shareImage] },
    twitter: { card: "summary_large_image", title, description, images: [shareImage.url] },
    ...(options.index === false ? { robots: { index: false, follow: true } } : {})
  };
}
