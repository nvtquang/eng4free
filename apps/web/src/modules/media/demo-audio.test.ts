import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { demoAudioKey, demoAudioUrl, parseSpeechScript } from "./demo-audio";

describe("demo audio lookup", () => {
  it("keys scripts by what is spoken, not by line endings or indentation", () => {
    expect(demoAudioKey("Woman: Hello.\r\n  Man: Hi.  ")).toBe(demoAudioKey("Woman: Hello.\nMan: Hi."));
    expect(demoAudioKey("Hello.")).not.toBe(demoAudioKey("Hello!"));
  });

  it("splits a dialogue into speaker turns and keeps unlabelled lines with the last speaker", () => {
    expect(parseSpeechScript("Look at the picture.\nWoman: Where is it?\nMan: (A) At three.\n(B) Upstairs.")).toEqual([
      { speaker: null, text: "Look at the picture." },
      { speaker: "Woman", text: "Where is it?" },
      { speaker: "Man", text: "(A) At three." },
      { speaker: "Man", text: "(B) Upstairs." }
    ]);
  });

  it("resolves a generated file from the manifest and falls back to undefined", () => {
    const dir = mkdtempSync(join(tmpdir(), "e4f-audio-"));
    expect(demoAudioUrl("Hello there.", dir)).toBeUndefined();
    writeFileSync(join(dir, "manifest.json"), JSON.stringify({ version: 1, engine: "test", notice: "", files: { [demoAudioKey("Hello there.")]: { file: "hello.mp3", spec: "x", voices: [], durationMs: 1, source: "test", generatedAt: "" } } }));
    expect(demoAudioUrl(" Hello there. ", dir)).toBe("/demo-media/audio/hello.mp3");
    expect(demoAudioUrl("Something else.", dir)).toBeUndefined();
    expect(demoAudioUrl(undefined, dir)).toBeUndefined();
  });
});
