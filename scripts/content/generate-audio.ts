/**
 * Pre-generates listening audio for every spoken script in the database:
 * exam part recordings, dictation questions and lesson listening blocks.
 *
 *   pnpm content:generate-audio            generate missing or changed files
 *   pnpm content:generate-audio --check    list missing files, exit 1 if any (no network)
 *   pnpm content:generate-audio --force    regenerate everything
 *   pnpm content:generate-audio --prune    also delete files no script uses any more
 *
 * Engine: edge-tts (Microsoft Edge neural voices, `pip install edge-tts`). Each speaker
 * turn is synthesised separately and joined with silent frames, so TOEIC Part 3 dialogues
 * get one voice per speaker. Files are keyed by a hash of the script (see demo-audio.ts)
 * and committed, so every machine plays byte-identical audio.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import postgres from "postgres";
import { demoAudioDir, demoAudioKey, normalizeSpeechScript, parseSpeechScript, type DemoAudioManifest } from "../../apps/web/src/modules/media/demo-audio";
import { concatMp3, mp3DurationMs } from "../../apps/web/src/modules/media/mp3-frames";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const args = new Set(process.argv.slice(2));
const CHECK = args.has("--check"), FORCE = args.has("--force"), PRUNE = args.has("--prune");
const ENGINE = "edge-tts";
const outputDir = demoAudioDir(resolve(process.cwd(), "apps/web"));
const manifestPath = join(outputDir, "manifest.json");

type Accent = "US" | "GB" | "AU" | "CA";
type Gender = "female" | "male";
const VOICES: Record<Accent, Record<Gender, string>> = {
  US: { female: "en-US-JennyNeural", male: "en-US-GuyNeural" },
  GB: { female: "en-GB-SoniaNeural", male: "en-GB-RyanNeural" },
  AU: { female: "en-AU-NatashaNeural", male: "en-AU-WilliamMultilingualNeural" },
  CA: { female: "en-CA-ClaraNeural", male: "en-CA-LiamNeural" }
};
/** TOEIC mixes North American, British and Australian speakers; IELTS recordings are mostly British/Australian. */
const ACCENTS = { TOEIC: ["US", "GB", "AU", "CA"], IELTS: ["GB", "AU"], LESSON: ["US", "GB"] } satisfies Record<string, Accent[]>;

type Job = { text: string; source: string; name: string; accents: Accent[]; voiceOverrides: Record<string, string>; rate: string; pauseMs: number };
type Planned = Job & { key: string; segments: Array<{ voice: string; text: string }>; spec: string };

const hashInt = (value: string) => createHash("sha256").update(value).digest().readUInt32BE(0);
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 60);
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};

function guessGender(speaker: string): Gender | null {
  if (/\b(woman|female|w|mrs|ms|miss|girl|lady)\b/iu.test(speaker)) return "female";
  if (/\b(man|male|m|mr|boy|gentleman)\b/iu.test(speaker)) return "male";
  return null;
}

/** Deterministic voice casting: explicit overrides first, then a different accent per speaker and alternating genders. */
function plan(job: Job): Planned {
  const text = normalizeSpeechScript(job.text);
  const segments = parseSpeechScript(text);
  const seed = hashInt(text);
  const cast = new Map<string, string>();
  let nextGender: Gender = seed % 2 ? "male" : "female";
  const voiceFor = (speaker: string | null) => {
    const name = speaker ?? "";
    if (job.voiceOverrides[name]) return job.voiceOverrides[name]!;
    if (!cast.has(name)) {
      const accent = job.accents[(seed + cast.size) % job.accents.length]!;
      const gender = (speaker ? guessGender(speaker) : null) ?? nextGender;
      nextGender = gender === "female" ? "male" : "female";
      cast.set(name, VOICES[accent][gender]);
    }
    return cast.get(name)!;
  };
  const voiced = segments.map((segment) => ({ voice: voiceFor(segment.speaker), text: segment.text }));
  const spec = createHash("sha256").update(JSON.stringify({ engine: ENGINE, rate: job.rate, pauseMs: job.pauseMs, segments: voiced })).digest("hex").slice(0, 16);
  return { ...job, text, key: demoAudioKey(text), segments: voiced, spec };
}

async function collectJobs(): Promise<Job[]> {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
  try {
    const jobs: Job[] = [];
    const parts = await sql<Array<{ slug: string; type: "TOEIC" | "IELTS"; part_number: number; metadata: unknown }>>`select e.slug, e.type, p.part_number, p.metadata from exam_parts p join exams e on e.id = p.exam_id where p.metadata ? 'playbackText' order by e.slug, p.sort_order`;
    for (const part of parts) {
      const metadata = record(part.metadata);
      const overrides = record(metadata.audioVoices) as Record<string, string>;
      if (typeof metadata.audioVoice === "string") overrides[""] = metadata.audioVoice;
      jobs.push({ text: String(metadata.playbackText), source: `exam ${part.slug} · part ${part.part_number}`, name: `${part.slug}-p${part.part_number}`, accents: ACCENTS[part.type] ?? ACCENTS.TOEIC, voiceOverrides: overrides, rate: "+0%", pauseMs: typeof metadata.audioPauseMs === "number" ? metadata.audioPauseMs : 700 });
    }
    const dictations = await sql<Array<{ id: string; content: unknown; slug: string | null; type: "TOEIC" | "IELTS" | null }>>`select q.id, q.content, e.slug, e.type from questions q left join exam_parts p on p.id = q.exam_part_id left join exams e on e.id = p.exam_id where q.type = 'DICTATION' and q.content ? 'playbackText' and not (q.content ? 'mediaId') order by e.slug, q.created_at`;
    for (const question of dictations) {
      jobs.push({ text: String(record(question.content).playbackText), source: `dictation ${question.slug ?? "unassigned"} · ${question.id}`, name: `${question.slug ?? "dictation"}-dictation`, accents: question.type === "IELTS" ? ACCENTS.IELTS : ACCENTS.LESSON, voiceOverrides: {}, rate: "-10%", pauseMs: 700 });
    }
    const blocks = await sql<Array<{ slug: string; content: unknown }>>`select l.slug, b.content from lesson_blocks b join lessons l on l.id = b.lesson_id where b.type = 'MEDIA' and b.content ? 'playbackText' and not (b.content ? 'mediaId') order by l.slug, b.sort_order`;
    for (const block of blocks) {
      const content = record(block.content);
      if (typeof content.playbackText !== "string" || !content.playbackText.trim()) continue;
      jobs.push({ text: content.playbackText, source: `lesson ${block.slug} · ${String(content.heading ?? "listening")}`, name: `lesson-${block.slug}`, accents: ACCENTS.LESSON, voiceOverrides: {}, rate: "-5%", pauseMs: 700 });
    }
    return jobs;
  } finally {
    await sql.end();
  }
}

function findPython() {
  const candidates = process.env.EDGE_TTS_PYTHON ? [process.env.EDGE_TTS_PYTHON] : ["python", "py", "python3"];
  for (const command of candidates) {
    const probe = spawnSync(command, ["-c", "import edge_tts"], { encoding: "utf8" });
    if (probe.status === 0) return command;
  }
  throw new Error("edge-tts is not available. Install it with `pip install edge-tts` (or set EDGE_TTS_PYTHON to a Python that has it).");
}

function synthesize(python: string, workDir: string, voice: string, rate: string, text: string): Uint8Array {
  const file = join(workDir, `${createHash("sha1").update(voice + rate + text).digest("hex")}.mp3`);
  let lastError = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const run = spawnSync(python, ["-m", "edge_tts", "--voice", voice, `--rate=${rate}`, "--text", text, "--write-media", file], { encoding: "utf8", timeout: 60_000 });
    if (run.status === 0 && existsSync(file)) { const audio = readFileSync(file); unlinkSync(file); if (audio.length > 0) return audio; }
    lastError = (run.stderr || run.error?.message || "").trim().split("\n").slice(-2).join(" ");
  }
  throw new Error(`edge-tts failed for ${voice}: ${lastError}`);
}

function readManifest(): DemoAudioManifest {
  const empty: DemoAudioManifest = { version: 1, engine: ENGINE, notice: "", files: {} };
  if (!existsSync(manifestPath)) return empty;
  return { ...empty, ...JSON.parse(readFileSync(manifestPath, "utf8")) as DemoAudioManifest };
}

function writeManifest(manifest: DemoAudioManifest) {
  const files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
  const notice = "Generated from original English 4 Free scripts with Microsoft Edge neural text-to-speech (edge-tts). Demo use only; see ../README.md.";
  writeFileSync(manifestPath, JSON.stringify({ version: 1, engine: ENGINE, notice, files }, null, 2) + "\n");
}

async function main() {
  const planned = new Map<string, Planned>();
  for (const job of await collectJobs()) { const item = plan(job); if (!planned.has(item.key)) planned.set(item.key, item); }
  mkdirSync(outputDir, { recursive: true });
  const manifest = readManifest();
  const isCurrent = (item: Planned) => { const entry = manifest.files[item.key]; return Boolean(entry && entry.spec === item.spec && existsSync(join(outputDir, entry.file))); };
  const todo = [...planned.values()].filter((item) => FORCE || !isCurrent(item));
  const orphans = Object.entries(manifest.files).filter(([key]) => !planned.has(key));
  console.log(`${planned.size} spoken scripts · ${planned.size - todo.length} up to date · ${todo.length} to generate · ${orphans.length} unused`);

  if (CHECK) {
    for (const item of todo) console.log(`  missing: ${item.source}`);
    if (todo.length) process.exitCode = 1;
    return;
  }

  if (todo.length) {
    const python = findPython();
    const workDir = mkdtempSync(join(tmpdir(), "e4f-tts-"));
    try {
      for (const [index, item] of todo.entries()) {
        const clips = item.segments.map((segment) => synthesize(python, workDir, segment.voice, item.rate, segment.text));
        const audio = concatMp3(clips, { gapMs: item.pauseMs, leadMs: 300, tailMs: 500 });
        const previous = manifest.files[item.key];
        const file = previous?.file ?? `${slugify(item.name)}-${item.key.slice(0, 8)}.mp3`;
        writeFileSync(join(outputDir, file), audio);
        manifest.files[item.key] = { file, spec: item.spec, voices: [...new Set(item.segments.map((segment) => segment.voice))], durationMs: mp3DurationMs(audio), source: item.source, generatedAt: new Date().toISOString() };
        writeManifest(manifest);
        console.log(`  [${index + 1}/${todo.length}] ${file} · ${(manifest.files[item.key]!.durationMs / 1000).toFixed(1)}s · ${manifest.files[item.key]!.voices.join(", ")}`);
      }
    } finally {
      rmSync(workDir, { recursive: true, force: true });
    }
  }

  if (PRUNE) {
    for (const [key, entry] of orphans) { delete manifest.files[key]; rmSync(join(outputDir, entry.file), { force: true }); console.log(`  removed unused ${entry.file}`); }
    const known = new Set(Object.values(manifest.files).map((entry) => entry.file));
    for (const file of readdirSync(outputDir)) if (file.endsWith(".mp3") && !known.has(file)) { rmSync(join(outputDir, file)); console.log(`  removed stray ${file}`); }
  } else if (orphans.length) {
    console.log(`  ${orphans.length} file(s) are no longer used by any script; run with --prune to delete them.`);
  }
  writeManifest(manifest);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
