import { describe, expect, it } from "vitest";
import { buildToeicMockPolicy, toeicParts } from "./toeic-format";
describe("TOEIC format", () => { it("contains all seven ordered parts and 200 questions", () => { expect(toeicParts.map((part) => part.number)).toEqual([1, 2, 3, 4, 5, 6, 7]); expect(toeicParts.reduce((sum, part) => sum + part.questionCount, 0)).toBe(200); }); it("uses a single-playback policy for listening mock audio", () => { expect(buildToeicMockPolicy().listeningAudioPolicy).toBe("ONE_PLAYBACK_ONLY"); }); });
