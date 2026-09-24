import { describe, expect, it } from "vitest";
import { AiProviderUnavailableError } from "@/modules/ai-foundation/contracts";
import { GeminiTranscriptionProvider } from "./gemini-transcription-provider";

describe("GeminiTranscriptionProvider", () => {
  it("sends inline audio server-to-server in verbatim mode without storing the interaction", async () => {
    let requestUrl = "";
    let requestInit: RequestInit | undefined;
    const provider = new GeminiTranscriptionProvider(
      "gemini-transcribe-test",
      "server-secret",
      "https://gemini.test/v1beta",
      1_000,
      async (url, init) => {
        requestUrl = String(url);
        requestInit = init;
        return new Response(JSON.stringify({ output_text: "I learned to cook last year.", usage: { total_input_tokens: 8, total_output_tokens: 7 } }), { status: 200 });
      }
    );

    const result = await provider.transcribe({ bytes: new Uint8Array([1, 2, 3]), mimeType: "audio/webm;codecs=opus" });
    const body = JSON.parse(String(requestInit?.body)) as Record<string, unknown>;

    expect(requestUrl).toBe("https://gemini.test/v1beta/interactions");
    expect(new Headers(requestInit?.headers).get("x-goog-api-key")).toBe("server-secret");
    expect(body).toMatchObject({
      model: "gemini-transcribe-test",
      store: false,
      input: [{ type: "audio", data: "AQID", mime_type: "audio/webm" }],
      generation_config: { transcription_config: { mode: { type: "verbatim" } } }
    });
    expect(result).toEqual({ transcript: "I learned to cook last year.", usage: { promptTokens: 8, responseTokens: 7 } });
  });

  it("normalizes provider failures", async () => {
    const provider = new GeminiTranscriptionProvider("test", "secret", "https://gemini.test", 1_000, async () => new Response("unavailable", { status: 503 }));
    await expect(provider.transcribe({ bytes: new Uint8Array([1]), mimeType: "audio/webm" })).rejects.toBeInstanceOf(AiProviderUnavailableError);
  });
});
