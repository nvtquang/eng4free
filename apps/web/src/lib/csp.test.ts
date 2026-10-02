import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, storageOrigins } from "./csp";

describe("content security policy", () => {
  it("allows only the app itself when no object storage is configured", () => {
    const policy = contentSecurityPolicy({ dev: false, storage: storageOrigins({}) });
    expect(policy).toContain("media-src 'self' blob:;");
    expect(policy).toContain("connect-src 'self';");
    expect(policy).not.toContain("unsafe-eval");
  });

  it("adds the R2/S3 endpoint and bucket origins for signed links and uploads", () => {
    const origins = storageOrigins({ S3_ENDPOINT: "https://abc123.r2.cloudflarestorage.com", S3_BUCKET: "e4f-media" });
    expect(origins).toEqual(["https://abc123.r2.cloudflarestorage.com", "https://e4f-media.abc123.r2.cloudflarestorage.com"]);
    const policy = contentSecurityPolicy({ dev: false, storage: origins });
    for (const directive of ["img-src", "media-src", "connect-src"]) expect(policy).toMatch(new RegExp(`${directive} [^;]*https://e4f-media\\.abc123\\.r2\\.cloudflarestorage\\.com`, "u"));
  });

  it("uses only the endpoint for path-style storage and accepts a public bucket domain", () => {
    expect(storageOrigins({ S3_ENDPOINT: "http://localhost:9000", S3_BUCKET: "media", S3_FORCE_PATH_STYLE: "true", S3_PUBLIC_URL: "https://media.example.com/files" })).toEqual(["http://localhost:9000", "https://media.example.com"]);
    expect(storageOrigins({ S3_ENDPOINT: "not a url", S3_BUCKET: "media" })).toEqual([]);
  });
});
