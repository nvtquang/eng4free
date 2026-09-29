/**
 * AI feedback quality harness for D6 (`pnpm ai:eval`).
 *
 *   --kind=all|writing|speaking   which samples to run (default all)
 *   --limit=N                     max samples to send to Gemini (default 6) — quota guard
 *   --delay-ms=21000              wait between calls (free tier is ~3 requests/minute)
 *   --dry-run                     build and validate the requests but do NOT call Gemini
 *   --out=docs/ai/feedback-review.md
 *
 * It mirrors the system instruction and JSON schema that the writing and speaking
 * services send, so reviewers can judge feedback quality on a fixed sample set and
 * tune the prompts. Free-tier Gemini quota is small (about 20 requests/day per model),
 * so keep --limit low and prefer --dry-run while iterating on the harness itself.
 * Never prints the API key.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { WritingFeedbackSchema, SpeakingFeedbackSchema } from "@english4free/content-schemas";
import { writingSamples, speakingSamples, type WritingSample, type SpeakingSample } from "../../content/ai-samples";

const WritingModel = WritingFeedbackSchema.omit({ rubricDisclaimer: true });
const SpeakingModel = SpeakingFeedbackSchema.omit({ transcript: true, disclaimer: true });

const writingSystemInstruction = "You are an English writing feedback assistant. Give constructive practice feedback only. Never state, predict, invent, or imply an official IELTS band score. For each rubric criterion, use NEEDS_WORK, DEVELOPING, or SECURE with evidence-based feedback. Return valid JSON only. Every issue range must refer to character offsets in the submitted text, with start less than or equal to end.";
const speakingSystemInstruction = "You are an English speaking coach. Evaluate only the supplied verbatim transcript against the prompt. Never invent an official IELTS band, numeric score, pronunciation score, acoustic observation, or words that are not in the transcript. Use only NEEDS_WORK, DEVELOPING, or SECURE. Fluency feedback must be limited to organization, fillers, repetitions, and false starts visible in the verbatim transcript. Write all learner-facing feedback in English. Return JSON only.";

const criterion = { type: "object", properties: { level: { type: "string", enum: ["NEEDS_WORK", "DEVELOPING", "SECURE"] }, feedback: { type: "string" } }, required: ["level", "feedback"], additionalProperties: false };
const issue = { type: "object", properties: { message: { type: "string" }, start: { type: "integer", minimum: 0 }, end: { type: "integer", minimum: 0 }, suggestion: { type: "string" } }, required: ["message", "start", "end"], additionalProperties: false };
const writingSchema = { type: "object", properties: { summary: { type: "string" }, rubric: { type: "object", properties: { taskResponse: criterion, coherenceAndCohesion: criterion, lexicalResource: criterion, grammaticalRangeAndAccuracy: criterion }, required: ["taskResponse", "coherenceAndCohesion", "lexicalResource", "grammaticalRangeAndAccuracy"], additionalProperties: false }, grammarIssues: { type: "array", items: issue }, vocabularyIssues: { type: "array", items: issue }, coherenceIssues: { type: "array", items: { type: "string" } }, revisionSuggestions: { type: "array", items: { type: "string" } } }, required: ["summary", "rubric", "grammarIssues", "vocabularyIssues", "coherenceIssues", "revisionSuggestions"], additionalProperties: false };
const speakingSchema = { type: "object", properties: { summary: { type: "string" }, rubric: { type: "object", properties: { taskResponse: criterion, fluency: criterion, grammar: criterion, vocabulary: criterion }, required: ["taskResponse", "fluency", "grammar", "vocabulary"], additionalProperties: false }, corrections: { type: "array", items: { type: "object", properties: { original: { type: "string" }, correction: { type: "string" }, explanation: { type: "string" } }, required: ["original", "correction", "explanation"], additionalProperties: false } }, strengths: { type: "array", items: { type: "string" } }, nextSteps: { type: "array", items: { type: "string" } } }, required: ["summary", "rubric", "corrections", "strengths", "nextSteps"], additionalProperties: false };

const forbidden = /\bband\s*\d|\b\d(\.\d)?\s*\/\s*9\b|\bscore\s*(of|:)?\s*\d/i;

type Args = { kind: "all" | "writing" | "speaking"; limit: number; delayMs: number; dryRun: boolean; out: string };
function parseArgs(): Args {
  const map = new Map(process.argv.slice(2).map((arg) => { const [key, value] = arg.replace(/^--/, "").split("="); return [key, value ?? "true"] as const; }));
  const kind = map.get("kind"); const limit = Number(map.get("limit"));
  return { kind: kind === "writing" || kind === "speaking" ? kind : "all", limit: Number.isInteger(limit) && limit > 0 ? limit : 6, delayMs: Number(map.get("delay-ms")) || 21_000, dryRun: map.has("dry-run"), out: map.get("out") || "docs/ai/feedback-review.md" };
}

function loadEnv(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(resolve(process.cwd(), "apps/web/.env.local"), "utf8").split("\n").find((entry) => entry.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch { return undefined; }
}

const delay = (ms: number) => new Promise((done) => setTimeout(done, ms));

type Outcome = { id: string; level: string; kind: "writing" | "speaking"; status: string; summary?: string; rubric?: Record<string, string>; forbidden?: boolean; focus: string[]; prompt: string };

async function callGemini(model: string, apiKey: string, baseUrl: string, systemInstruction: string, prompt: string, schema: unknown): Promise<unknown> {
  const response = await fetch(`${baseUrl}/interactions`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ model, system_instruction: systemInstruction, input: prompt, generation_config: { temperature: 0.2, thinking_level: "low" }, response_format: { type: "text", mime_type: "application/json", schema } }),
    signal: AbortSignal.timeout(30_000)
  });
  const result = await response.json().catch(() => null) as { output_text?: string; steps?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(result?.error?.message || `Gemini request failed (${response.status})`);
  const text = (result?.output_text ?? result?.steps?.flatMap((step) => step.content ?? []).filter((content) => content.type === "text").map((content) => content.text ?? "").join(" ") ?? "").trim();
  return JSON.parse(text);
}

function rubricLevels(rubric: Record<string, { level: string }>): Record<string, string> {
  return Object.fromEntries(Object.entries(rubric).map(([key, value]) => [key, value.level]));
}

async function main() {
  const args = parseArgs();
  const writingPrompt = (sample: WritingSample) => JSON.stringify({ promptId: sample.promptId, taskType: sample.taskType, expectedMinimumWords: sample.expectedMinimumWords ?? null, text: sample.text });
  const speakingPrompt = (sample: SpeakingSample) => JSON.stringify({ prompt: sample.prompt, transcript: sample.transcript, feedbackLanguage: "en" });

  const queue: Array<{ kind: "writing" | "speaking"; id: string; level: string; focus: string[]; prompt: string; system: string; body: string; schema: unknown; validate: (value: unknown) => boolean }> = [];
  if (args.kind !== "speaking") for (const sample of writingSamples) queue.push({ kind: "writing", id: sample.id, level: sample.level, focus: sample.focus, prompt: sample.prompt, system: writingSystemInstruction, body: writingPrompt(sample), schema: writingSchema, validate: (value) => WritingModel.safeParse(value).success });
  if (args.kind !== "writing") for (const sample of speakingSamples) queue.push({ kind: "speaking", id: sample.id, level: sample.level, focus: sample.focus, prompt: sample.prompt, system: speakingSystemInstruction, body: speakingPrompt(sample), schema: speakingSchema, validate: (value) => SpeakingModel.safeParse(value).success });

  const outcomes: Outcome[] = [];
  const apiKey = loadEnv("GEMINI_API_KEY");
  const model = loadEnv("GEMINI_MODEL") || "gemini-3.8-flash";
  const baseUrl = (loadEnv("GEMINI_API_BASE_URL") || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");

  let sent = 0;
  for (const item of queue) {
    const base = { id: item.id, level: item.level, kind: item.kind, focus: item.focus, prompt: item.prompt };
    if (args.dryRun) { outcomes.push({ ...base, status: "DRY_RUN (request built, schema-valid samples)" }); continue; }
    if (!apiKey) { outcomes.push({ ...base, status: "SKIPPED (no GEMINI_API_KEY)" }); continue; }
    if (sent >= args.limit) { outcomes.push({ ...base, status: "SKIPPED (--limit reached)" }); continue; }
    try {
      const value = await callGemini(model, apiKey, baseUrl, item.system, item.body, item.schema);
      sent += 1;
      const valid = item.validate(value);
      const feedback = value as { summary?: string; rubric?: Record<string, { level: string }> };
      const flagged = forbidden.test(JSON.stringify(value));
      outcomes.push({ ...base, status: valid ? (flagged ? "OK but FORBIDDEN-CONTENT flag" : "OK") : "INVALID_SCHEMA", summary: feedback.summary, rubric: feedback.rubric ? rubricLevels(feedback.rubric) : undefined, forbidden: flagged });
    } catch (error) {
      outcomes.push({ ...base, status: `ERROR: ${error instanceof Error ? error.message : "unknown"}` });
      if (String(error).match(/quota|rate|429|resource_exhausted/i)) { console.error("Stopping: quota/rate limit reached."); break; }
    }
    if (sent < args.limit) await delay(args.delayMs);
  }

  const lines: string[] = [];
  lines.push("# AI feedback review sheet", "", `Generated: ${new Date().toISOString()} · model: ${model} · mode: ${args.dryRun ? "dry-run" : "live"}`, "");
  lines.push("Compare each response against the sample's focus points. \"FORBIDDEN-CONTENT flag\" means the reply may mention a band/score and must be fixed in the prompt.", "");
  lines.push("| Sample | Level | Kind | Status | Rubric levels |", "| --- | --- | --- | --- | --- |");
  for (const outcome of outcomes) lines.push(`| ${outcome.id} | ${outcome.level} | ${outcome.kind} | ${outcome.status} | ${outcome.rubric ? Object.entries(outcome.rubric).map(([key, value]) => `${key}=${value}`).join(", ") : "—"} |`);
  lines.push("");
  for (const outcome of outcomes) {
    lines.push(`## ${outcome.id} (${outcome.level}, ${outcome.kind})`, "", `- Prompt: ${outcome.prompt}`, `- Status: ${outcome.status}`);
    if (outcome.summary) lines.push(`- Summary: ${outcome.summary}`);
    lines.push(`- Focus to check: ${outcome.focus.map((point) => `\n  - ${point}`).join("")}`, "");
  }

  const outPath = resolve(process.cwd(), args.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join("\n"));
  console.log(`Wrote ${args.out} (${outcomes.length} samples, ${sent} live calls).`);
}

void main();
