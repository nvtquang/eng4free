type Env = Record<string, string | undefined>;

/**
 * Origins that serve object storage links: the S3/R2 endpoint itself (path-style URLs) and the
 * bucket subdomain (virtual-hosted URLs, the default), plus an optional public bucket domain.
 */
export function storageOrigins(env: Env): string[] {
  const origins = new Set<string>();
  try {
    if (env.S3_ENDPOINT && env.S3_BUCKET) {
      const endpoint = new URL(env.S3_ENDPOINT);
      origins.add(endpoint.origin);
      if (env.S3_FORCE_PATH_STYLE !== "true") origins.add(`${endpoint.protocol}//${env.S3_BUCKET}.${endpoint.host}`);
    }
    if (env.S3_PUBLIC_URL) origins.add(new URL(env.S3_PUBLIC_URL).origin);
  } catch {
    // A malformed endpoint is reported by the storage service itself; the policy stays strict.
  }
  return [...origins];
}

/**
 * The page Content-Security-Policy. Built per request (in middleware) so the storage origin
 * comes from the runtime environment, not from whatever was set when the app was built.
 */
export function contentSecurityPolicy(options: { dev: boolean; storage: string[] }): string {
  const storage = options.storage.join(" ");
  const script = options.dev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";
  return [
    "default-src 'self'", "base-uri 'self'", "frame-ancestors 'none'", "object-src 'none'", "form-action 'self'",
    `img-src 'self' data: blob: ${storage}`.trim(),
    `media-src 'self' blob: ${storage}`.trim(),
    // Admins upload CMS media straight to the bucket with a signed PUT.
    `connect-src 'self' ${storage}`.trim(),
    `script-src ${script}`, "style-src 'self' 'unsafe-inline'", "font-src 'self'"
  ].join("; ");
}
