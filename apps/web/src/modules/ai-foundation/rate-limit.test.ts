import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkAiRequest, consumeAiBudget, resetAiRateLimitForTests } from "./rate-limit";
import { clientIpFromHeaders } from "@/modules/rate-limit/client-ip";

const now = new Date("2026-10-02T10:15:00Z");

describe("shared AI rate limit", () => {
  beforeEach(() => {
    resetAiRateLimitForTests();
    vi.stubEnv("AI_RATE_LIMIT_MAX_REQUESTS", "2");
    vi.stubEnv("AI_RATE_LIMIT_IP_MAX_REQUESTS", "3");
    vi.stubEnv("AI_DAILY_BUDGET", "2");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("limits each learner per operation within the window", async () => {
    const request = { operation: "TUTOR_EXPLANATION", learnerId: "learner", ip: null };
    expect(await checkAiRequest(request, now)).toBeNull();
    expect(await checkAiRequest(request, now)).toBeNull();
    expect(await checkAiRequest(request, now)).toBe("LEARNER");
    expect(await checkAiRequest({ ...request, operation: "WRITING_FEEDBACK" }, now)).toBeNull();
    expect(await checkAiRequest(request, new Date(now.getTime() + 60 * 60 * 1_000))).toBeNull();
  });

  it("still limits a guest who clears cookies and comes back with a new learner from the same address", async () => {
    for (const learnerId of ["a", "b", "c"]) expect(await checkAiRequest({ operation: "WRITING_FEEDBACK", learnerId, ip: "203.0.113.9" }, now)).toBeNull();
    expect(await checkAiRequest({ operation: "WRITING_FEEDBACK", learnerId: "d", ip: "203.0.113.9" }, now)).toBe("IP");
    expect(await checkAiRequest({ operation: "WRITING_FEEDBACK", learnerId: "e", ip: "198.51.100.4" }, now)).toBeNull();
  });

  it("spends a site-wide daily budget per provider quota and resets the next UTC day", async () => {
    expect(await consumeAiBudget("TEXT", now)).toBe(true);
    expect(await consumeAiBudget("TEXT", now)).toBe(true);
    expect(await consumeAiBudget("TEXT", now)).toBe(false);
    expect(await consumeAiBudget("TRANSCRIPTION", now)).toBe(true);
    expect(await consumeAiBudget("TEXT", new Date("2026-10-03T00:00:01Z"))).toBe(true);
  });
});

describe("client address behind proxies", () => {
  it("takes the entry the trusted proxy added, not ones the client could forge", () => {
    expect(clientIpFromHeaders("1.1.1.1, 203.0.113.9", null, 1)).toBe("203.0.113.9");
    expect(clientIpFromHeaders("1.1.1.1, 203.0.113.9, 10.0.0.2", null, 2)).toBe("203.0.113.9");
    expect(clientIpFromHeaders("203.0.113.9", null, 3)).toBe("203.0.113.9");
  });

  it("falls back to X-Real-IP, and to nothing when no proxy is trusted", () => {
    expect(clientIpFromHeaders(null, "198.51.100.4", 1)).toBe("198.51.100.4");
    expect(clientIpFromHeaders("1.1.1.1", null, 0)).toBeNull();
  });
});
