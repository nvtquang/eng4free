import { describe, expect, it } from "vitest";
import { allowAiRequest, resetAiRateLimitForTests } from "./rate-limit";

describe("shared AI rate limit", () => {
  it("scopes a fixed window to the supplied operation and actor key", () => {
    resetAiRateLimitForTests();
    expect(allowAiRequest("TUTOR_EXPLANATION:learner", 2, 60_000)).toBe(true);
    expect(allowAiRequest("TUTOR_EXPLANATION:learner", 2, 60_000)).toBe(true);
    expect(allowAiRequest("TUTOR_EXPLANATION:learner", 2, 60_000)).toBe(false);
    expect(allowAiRequest("WRITING_FEEDBACK:learner", 2, 60_000)).toBe(true);
  });
});
