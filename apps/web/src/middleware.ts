import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy, storageOrigins } from "@/lib/csp";
import { localeCookieName, localeParam, locales, type Locale } from "@/lib/locale";

/**
 * Runs before every page:
 * - sets the Content-Security-Policy, built from the runtime environment so an S3/R2 bucket
 *   configured after the build is still allowed;
 * - `?lang=vi|en` picks the page language for this request and remembers it in the locale
 *   cookie. Search engines send no cookies, so `/learn?lang=en` is how the English version
 *   of a page gets crawled; the sitemap and hreflang tags point to these URLs.
 */
export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get(localeParam);
  const switching = Boolean(lang && locales.includes(lang as Locale));
  if (switching) request.cookies.set(localeCookieName, lang!);
  const response = NextResponse.next({ request: { headers: request.headers } });
  if (switching) response.cookies.set(localeCookieName, lang!, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy({ dev: process.env.NODE_ENV === "development", storage: storageOrigins(process.env) }));
  return response;
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|demo-media|favicon.ico|robots.txt|sitemap.xml|og-image.png).*)"] };
