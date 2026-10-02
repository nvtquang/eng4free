/** Locale constants with no server imports, so middleware can use them too. */
export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";
export const localeCookieName = "e4f-locale";
/** `?lang=en` renders a page in that language and keeps it, so each language has its own crawlable URL. */
export const localeParam = "lang";
