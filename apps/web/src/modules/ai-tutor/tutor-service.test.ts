import { describe, expect, it } from "vitest";
import { OfficialExplanationTutor } from "./tutor-service";
describe("official explanation tutor", () => { it("uses trusted official explanation without inventing feedback", async () => { const response = await new OfficialExplanationTutor().explain({ prompt: "p", learnerAnswer: "a", correctOptionId: "b", officialExplanation: "Official explanation", optionText: "x" }); expect(response).toMatchObject({ correct: false, explanation: "Official explanation", providerUsed: false }); }); });
