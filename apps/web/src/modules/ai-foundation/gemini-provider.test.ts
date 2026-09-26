import { describe, expect, it } from "vitest";
import { GeminiProvider } from "./gemini-provider";
import { AiProviderUnavailableError } from "./contracts";

const schema = { type: "object", properties: { message: { type: "string" } }, required: ["message"] };

describe("GeminiProvider", () => {
  it("sends the API key only in the server-to-server header and requests JSON", async () => {
    let requestUrl = "";
    let requestInit: RequestInit | undefined;
    const provider = new GeminiProvider("gemini-test", "secret-key", "https://gemini.test/v1beta", 1_000, async (url, init) => {
      requestUrl = String(url);
      requestInit = init;
      return new Response(JSON.stringify({ output_text: '{"message":"ok"}', usage: { total_input_tokens: 12, total_output_tokens: 4 } }), { status: 200 });
    });

    const result = await provider.generateJson({ prompt: "hello", systemInstruction: "be helpful", responseSchema: schema });

    expect(requestUrl).toBe("https://gemini.test/v1beta/interactions");
    expect(new Headers(requestInit?.headers).get("x-goog-api-key")).toBe("secret-key");
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({ model: "gemini-test", response_format: { mime_type: "application/json", schema } });
    expect(result).toEqual({ value: { message: "ok" }, usage: { promptTokens: 12, responseTokens: 4 } });
  });

  it("requests low thinking so structured feedback stays within the request budget", async () => {
    let requestBody: unknown;
    const provider = new GeminiProvider("gemini-test", "secret-key", "https://gemini.test", 1_000, async (_url, init) => {
      requestBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ output_text: '{"message":"ok"}' }), { status: 200 });
    });
    await provider.generateJson({ prompt: "hello", systemInstruction: "be helpful", responseSchema: schema });
    expect(requestBody).toMatchObject({ generation_config: { thinking_level: "low" } });
  });

  it("retries once when the provider is temporarily overloaded", async () => {
    let calls = 0;
    const provider = new GeminiProvider("gemini-test", "secret-key", "https://gemini.test", 1_000, async () => {
      calls += 1;
      return calls === 1 ? new Response("overloaded", { status: 503 }) : new Response(JSON.stringify({ output_text: '{"message":"ok"}' }), { status: 200 });
    });
    await expect(provider.generateJson({ prompt: "hello", systemInstruction: "be helpful", responseSchema: schema })).resolves.toMatchObject({ value: { message: "ok" } });
    expect(calls).toBe(2);
  });

  it("normalizes an unavailable provider without exposing provider details to callers", async () => {
    const provider = new GeminiProvider("gemini-test", "secret-key", "https://gemini.test", 1_000, async () => new Response("unavailable", { status: 503 }));
    await expect(provider.generateJson({ prompt: "hello", systemInstruction: "be helpful", responseSchema: schema })).rejects.toBeInstanceOf(AiProviderUnavailableError);
  });
});
