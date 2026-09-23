import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const linkClass = "inline-flex min-h-8 items-center justify-center rounded-ui px-2.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

// A plain GET form deliberately performs a document navigation. The locale API
// writes a cookie, then the next server render supplies the new active state.
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  return <form action="/api/locale" method="get" className="inline-flex rounded-ui border border-line bg-surface p-1" aria-label={label}>
    <button type="submit" name="locale" value="vi" className={cn(linkClass, locale === "vi" ? "bg-brand text-white hover:bg-brand-deep" : "text-brand hover:bg-brand-soft")} aria-pressed={locale === "vi"}>VI</button>
    <button type="submit" name="locale" value="en" className={cn(linkClass, locale === "en" ? "bg-brand text-white hover:bg-brand-deep" : "text-brand hover:bg-brand-soft")} aria-pressed={locale === "en"}>EN</button>
  </form>;
}
