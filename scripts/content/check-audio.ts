/**
 * Audio QA for the generated listening files (`pnpm content:qa-audio`).
 *
 * For every file in public/demo-media/audio/manifest.json it reports:
 *  - speaking rate in words per minute (exam listening should sit around 130–175 wpm);
 *  - word error rate of an independent Gemini transcription against the script, which
 *    catches mispronounced, skipped or garbled words (flagged above 10%).
 * Results are cached in .cache/audio-qa.json by file spec, so reruns only check new audio.
 * Needs GEMINI_API_KEY; without it only the speaking rate is checked.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import postgres from "postgres";
import { demoAudioDir, demoAudioKey, parseSpeechScript, type DemoAudioManifest } from "../../apps/web/src/modules/media/demo-audio";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
const dir = demoAudioDir(resolve(process.cwd(), "apps/web"));
const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as DemoAudioManifest;
const cachePath = resolve(process.cwd(), ".cache/audio-qa.json");
type Result = { spec: string; wpm: number; wer: number | null; transcript?: string };
const cache: Record<string, Result> = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};

/** Numbers are left out of the comparison: "ten thirty" and "10:30" are the same audio. */
const NUMBER = /^(\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|half|past|quarter|o'clock|pm|am|p|m)$/u;
const words = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/gu, "").replace(/[‘’]/gu, "'").replace(/\(([a-d])\)/gu, "$1").replace(/[^a-z0-9' ]+/gu, " ").split(/\s+/u).filter((word) => word && !NUMBER.test(word));
function wordErrorRate(reference: string[], hypothesis: string[]) {
  const previous = Array.from({ length: hypothesis.length + 1 }, (_, index) => index);
  for (let i = 1; i <= reference.length; i += 1) {
    let diagonal = previous[0]!; previous[0] = i;
    for (let j = 1; j <= hypothesis.length; j += 1) {
      const above = previous[j]!;
      previous[j] = Math.min(previous[j]! + 1, previous[j - 1]! + 1, diagonal + (reference[i - 1] === hypothesis[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return reference.length ? previous[hypothesis.length]! / reference.length : 0;
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
let lastCall = 0;
/** The free Gemini tier allows 3 transcriptions a minute, so calls are spaced and a rate-limit reply is retried. */
async function transcribe(bytes: Buffer, attempt = 1): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY?.trim()) return null;
  const gap = Number(process.env.AUDIO_QA_GAP_MS ?? 21_000);
  const wait = lastCall + gap - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  try { return await transcribeOnce(bytes); } catch (error) {
    if (attempt < 3 && error instanceof Error && /rate limit/iu.test(error.message)) { await sleep(30_000); return transcribe(bytes, attempt + 1); }
    throw error;
  }
}

async function transcribeOnce(bytes: Buffer): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  const base = (process.env.GEMINI_API_BASE_URL?.trim() || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/u, "");
  const response = await fetch(`${base}/interactions`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ model: process.env.GEMINI_TRANSCRIBE_MODEL?.trim() || "gemini-3.5-transcribe", store: false, input: [{ type: "audio", data: bytes.toString("base64"), mime_type: "audio/mpeg" }], generation_config: { transcription_config: { mode: { type: "verbatim" } } } }), signal: AbortSignal.timeout(120_000) });
  const body = await response.json().catch(() => null) as { output_text?: string; steps?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(body?.error?.message ?? `Transcription failed (${response.status})`);
  return (body?.output_text ?? body?.steps?.flatMap((step) => step.content ?? []).filter((item) => item.type === "text").map((item) => item.text ?? "").join(" ") ?? "").trim();
}

async function scripts() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  try {
    const rows = await sql<Array<{ text: string }>>`
      select metadata->>'playbackText' as text from exam_parts where metadata ? 'playbackText'
      union all select content from passages where metadata->>'kind' = 'LISTENING'
      union all select content->>'playbackText' from questions where content ? 'playbackText'
      union all select content->>'playbackText' from lesson_blocks where type = 'MEDIA' and content ? 'playbackText'`;
    return new Map(rows.filter((row) => row.text).map((row) => [demoAudioKey(row.text), row.text]));
  } finally { await sql.end(); }
}

async function main() {
  const byKey = await scripts();
  const flagged: string[] = [];
  for (const [key, entry] of Object.entries(manifest.files)) {
    const script = byKey.get(key);
    if (!script) continue;
    const reference = words(parseSpeechScript(script).map((segment) => segment.text).join(" "));
    let result = cache[entry.file];
    if (!result || result.spec !== entry.spec || (result.wer === null && process.env.GEMINI_API_KEY)) {
      const transcript = await transcribe(readFileSync(join(dir, entry.file))).catch((error: unknown) => { console.log(`  ${entry.file}: ${error instanceof Error ? error.message : error}`); return null; });
      const speechMs = Math.max(1, entry.durationMs - 800 - Math.max(0, parseSpeechScript(script).length - 1) * 650);
      result = { spec: entry.spec, wpm: Math.round(reference.length / (speechMs / 60_000)), wer: transcript === null ? null : Math.round(wordErrorRate(reference, words(transcript)) * 1000) / 10, transcript: transcript ?? undefined };
      cache[entry.file] = result;
      writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    }
    const problems = [result.wpm > 195 || result.wpm < 90 ? `rate ${result.wpm} wpm` : "", result.wer !== null && result.wer > 10 ? `WER ${result.wer}%` : ""].filter(Boolean);
    if (problems.length) flagged.push(`${entry.file}: ${problems.join(", ")}`);
    console.log(`${problems.length ? "✗" : "✓"} ${entry.file} · ${result.wpm} wpm · WER ${result.wer ?? "n/a"}%`);
  }
  console.log(flagged.length ? `\n${flagged.length} file(s) need attention:\n  ${flagged.join("\n  ")}` : "\nAll generated audio passed.");
  if (flagged.length) process.exitCode = 1;
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
