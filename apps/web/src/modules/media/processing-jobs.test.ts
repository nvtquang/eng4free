import { describe, expect, it } from "vitest";
import { canClaimMediaJob } from "./processing-jobs";
describe("media jobs", () => { it("only allows pending jobs below retry cap", () => { expect(canClaimMediaJob({ id: "1", type: "AUDIO_WAVEFORM", status: "PENDING", payload: {}, attempts: 2, error: null, createdAt: new Date() })).toBe(true); expect(canClaimMediaJob({ id: "1", type: "AUDIO_WAVEFORM", status: "PENDING", payload: {}, attempts: 3, error: null, createdAt: new Date() })).toBe(false); }); });
