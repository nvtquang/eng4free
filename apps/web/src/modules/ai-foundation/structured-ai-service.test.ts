import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import type { StructuredAiProvider } from "./contracts";
import { AiInvalidResponseError } from "./contracts";
import { resetAiRateLimitForTests } from "./rate-limit";
import { resetAiCacheForTests } from "./repository";
import { executeStructuredAi } from "./structured-ai-service";

const responseSchema = z.object({ explanation: z.string().min(1) });
const jsonSchema = { type: "object", properties: { explanation: { type: "string" } }, required: ["explanation"] };
const originalInMemorySetting = process.env.E4F_USE_IN_MEMORY;

afterEach(() => {
  resetAiRateLimitForTests();
  resetAiCacheForTests();
  if (originalInMemorySetting === undefined) delete process.env.E4F_USE_IN_MEMORY;
  else process.env.E4F_USE_IN_MEMORY = originalInMemorySetting;
});

describe("executeStructuredAi", () => {
  it("validates provider JSON and reuses a validated cache entry", async () => {
    process.env.E4F_USE_IN_MEMORY = "true";
    let calls = 0;
    const provider: StructuredAiProvider = {
      name: "gemini", model: "test-model",
      async generateJson() { calls += 1; return { value: { explanation: "Validated feedback" }, usage: { promptTokens: 3, responseTokens: 2 } }; }
    };
    const request = { actor: { userId: null, guestId: "guest-test" }, operation: "TUTOR_EXPLANATION" as const, cacheInput: { answer: "A" }, prompt: "Prompt", systemInstruction: "Instruction", responseSchema: jsonSchema, validator: responseSchema, provider };

    await expect(executeStructuredAi(request)).resolves.toEqual({ explanation: "Validated feedback" });
    await expect(executeStructuredAi(request)).resolves.toEqual({ explanation: "Validated feedback" });
    expect(calls).toBe(1);
  });

  it("rejects a structurally invalid provider response", async () => {
    process.env.E4F_USE_IN_MEMORY = "true";
    const provider: StructuredAiProvider = { name: "gemini", model: "test-model", async generateJson() { return { value: { explanation: "" }, usage: { promptTokens: null, responseTokens: null } }; } };
    await expect(executeStructuredAi({ actor: { userId: null, guestId: "guest-invalid" }, operation: "TUTOR_EXPLANATION", cacheInput: { answer: "B" }, prompt: "Prompt", systemInstruction: "Instruction", responseSchema: jsonSchema, validator: responseSchema, provider })).rejects.toBeInstanceOf(AiInvalidResponseError);
  });
});
