import { describe, expect, it } from "vitest";
import { estimateToeicScaledScore } from "./toeic-scaled";
describe("TOEIC practice score estimate", () => { it("keeps score within TOEIC scale range", () => { expect(estimateToeicScaledScore(100, 100).total).toBe(990); expect(estimateToeicScaledScore(0, 0).total).toBe(10); }); it("rejects invalid raw score", () => { expect(() => estimateToeicScaledScore(101, 0)).toThrow(RangeError); }); });
