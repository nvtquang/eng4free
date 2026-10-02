import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";

// Rendered per request so the sitemap URL follows APP_URL at run time.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/dashboard", "/profile", "/today", "/onboarding", "/mistakes", "/toeic/history", "/login"] }, sitemap: new URL("/sitemap.xml", siteUrl()).toString() };
}
