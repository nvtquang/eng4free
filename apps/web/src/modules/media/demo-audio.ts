import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Pre-generated listening audio lives in public/demo-media/audio and is looked up by
 * a hash of the spoken script, so content rows need no media ids: whatever text a
 * part or question plays, the same text always resolves to the same committed file.
 * `pnpm content:generate-audio` writes the files and the manifest.
 */
export const DEMO_AUDIO_URL_PREFIX = "/demo-media/audio";
export type DemoAudioEntry = { file: string; spec: string; voices: string[]; durationMs: number; source: string; generatedAt: string };
export type DemoAudioManifest = { version: 1; engine: string; notice: string; files: Record<string, DemoAudioEntry> };
export type SpeechSegment = { speaker: string | null; text: string };

export function demoAudioDir(webRoot = process.cwd()) { return join(webRoot, "public", "demo-media", "audio"); }

/** Line endings and surrounding whitespace do not change what is spoken. */
export function normalizeSpeechScript(text: string) {
  return text.replace(/\r\n?/gu, "\n").split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
}

export function demoAudioKey(text: string) {
  return createHash("sha256").update(normalizeSpeechScript(text)).digest("hex").slice(0, 20);
}

const speakerLine = /^([A-Z][A-Za-z .'-]{0,24}):\s+(\S.*)$/u;
/**
 * One segment per line. "Woman: …" starts a speaker turn; unlabelled lines continue the
 * previous speaker, so a TOEIC answer list can be written as "(A) …" lines after one label.
 */
export function parseSpeechScript(text: string): SpeechSegment[] {
  let speaker: string | null = null;
  return normalizeSpeechScript(text).split("\n").map((line) => {
    const match = speakerLine.exec(line);
    if (match) speaker = match[1]!.trim();
    return { speaker, text: match ? match[2]!.trim() : line };
  });
}

let cached: { mtimeMs: number; manifest: DemoAudioManifest | null } | undefined;
export function readDemoAudioManifest(dir = demoAudioDir()): DemoAudioManifest | null {
  const path = join(dir, "manifest.json");
  let mtimeMs: number;
  try { mtimeMs = statSync(path).mtimeMs; } catch { return null; }
  if (cached?.mtimeMs !== mtimeMs) {
    try { cached = { mtimeMs, manifest: JSON.parse(readFileSync(path, "utf8")) as DemoAudioManifest }; } catch { cached = { mtimeMs, manifest: null }; }
  }
  return cached.manifest;
}

/** Public URL of the generated recording for a script, or undefined so callers can fall back to browser speech. */
export function demoAudioUrl(text: unknown, dir?: string): string | undefined {
  if (typeof text !== "string" || !text.trim()) return undefined;
  const entry = readDemoAudioManifest(dir)?.files[demoAudioKey(text)];
  return entry ? `${DEMO_AUDIO_URL_PREFIX}/${entry.file}` : undefined;
}
