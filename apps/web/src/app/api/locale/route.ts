import { NextResponse } from "next/server";
import { isLocale, localeCookieName } from "@/lib/i18n";

function withLocaleCookie(response: NextResponse, locale: "vi" | "en") {
  response.cookies.set(localeCookieName, locale, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

function returnUrl(request: Request) {
  const current = new URL(request.url);
  const referer = request.headers.get("referer");
  if (!referer) return new URL("/", current);
  try {
    const source = new URL(referer);
    const requestedHost = request.headers.get("host");
    const isSameRequestedHost = requestedHost === source.host;
    const isLocalLoopbackPair = process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(source.hostname) && ["localhost", "127.0.0.1"].includes(current.hostname);
    return isSameRequestedHost || isLocalLoopbackPair ? source : new URL("/", current);
  } catch { return new URL("/", current); }
}

export function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") ?? undefined;
  if (!isLocale(locale)) return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  return withLocaleCookie(NextResponse.redirect(returnUrl(request), 303), locale);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const locale = body && typeof body === "object" && "locale" in body ? (body as { locale?: string }).locale : undefined;
  if (!isLocale(locale)) return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  return withLocaleCookie(NextResponse.json({ locale }), locale);
}
