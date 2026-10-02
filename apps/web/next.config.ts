import { resolve } from "node:path";
import type { NextConfig } from "next";

// The Content-Security-Policy is set per request in src/middleware.ts, so it can include the
// object storage origin from the runtime environment.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=()" },
  // Browsers ignore this over plain HTTP, so it is harmless locally.
  { key: "Strict-Transport-Security", value: "max-age=31536000" }
];
const nextConfig: NextConfig = {
  // Keep hot-reload artifacts isolated from production/E2E builds. Otherwise a
  // build started while `next dev` is running can remove a module mid-reload.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // The Docker image runs the self-contained server; `next start` is used everywhere else.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" as const, outputFileTracingRoot: resolve(__dirname, "../..") } : {}),
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; }
};
export default nextConfig;
