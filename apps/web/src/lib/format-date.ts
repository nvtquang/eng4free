/**
 * A date and time in the page's language (the <html lang> the layout sets), not the browser's,
 * so a Vietnamese page shows "20:16:00 20/9/2026" even in an English browser. Client-side only:
 * use it for lists that are fetched after the page has loaded.
 */
export function formatDateTime(value: string | Date): string {
  const lang = typeof document === "undefined" ? "vi" : document.documentElement.lang;
  return new Date(value).toLocaleString(lang === "en" ? "en-GB" : "vi-VN");
}
