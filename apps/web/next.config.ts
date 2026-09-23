import type { NextConfig } from "next";
const scriptSource = process.env.NODE_ENV === "development" ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=()" },
  { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'; font-src 'self';` }
];
const nextConfig: NextConfig = {
  // Keep hot-reload artifacts isolated from production/E2E builds. Otherwise a
  // build started while `next dev` is running can remove a module mid-reload.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; }
};
export default nextConfig;
