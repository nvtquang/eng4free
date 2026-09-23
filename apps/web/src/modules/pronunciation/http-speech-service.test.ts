import { describe, expect, it, vi } from "vitest";
import { HttpSpeechService, SpeechServiceUnavailableError } from "./http-speech-service";

describe("HTTP speech-service adapter", () => {
  it("does not attempt a network request when the service is absent", async () => {
    const service = new HttpSpeechService(undefined);
    await expect(service.transcribe({ recordingMediaId: "recording-1", language: "en" })).rejects.toBeInstanceOf(SpeechServiceUnavailableError);
  });
  it("validates a provider response before returning it to the domain", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ transcript: "I learn", words: [{ word: "I", startMs: 0, endMs: 20, confidence: 0.99 }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const service = new HttpSpeechService("http://speech.local");
    await expect(service.transcribe({ recordingMediaId: "recording-1", language: "en" })).resolves.toMatchObject({ transcript: "I learn" });
    expect(fetchMock).toHaveBeenCalledWith("http://speech.local/v1/transcriptions", expect.objectContaining({ method: "POST" }));
    vi.unstubAllGlobals();
  });
});
