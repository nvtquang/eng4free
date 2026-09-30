/**
 * Pre-generates listening audio for every spoken script in the database:
 * exam part recordings, listening passages (TOEIC conversations and talks, IELTS
 * sections), questions heard on their own (TOEIC Part 1–2), dictation questions,
 * lesson listening blocks and placement-test listening items.
 *
 *   pnpm content:generate-audio            generate missing or changed files
 *   pnpm content:generate-audio --check    list missing files, exit 1 if any (no synthesis)
 *   pnpm content:generate-audio --force    regenerate everything
 *   pnpm content:generate-audio --prune    also delete files no script uses any more
 *
 * Engine: Piper (local neural TTS, `pip install piper-tts lameenc`) with voice models
 * whose training data has a clear licence: VCTK (CC BY 4.0), LibriTTS-R (CC BY 4.0)
 * and cori (public-domain LibriVox recordings). Models are downloaded once into
 * .cache/piper-voices. Each speaker turn gets its own voice; files are keyed by a hash
 * of the script (see demo-audio.ts) and committed, so every machine plays the same file.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import postgres from "postgres";
import { demoAudioDir, demoAudioKey, normalizeSpeechScript, parseSpeechScript, type DemoAudioManifest } from "../../apps/web/src/modules/media/demo-audio";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const args = new Set(process.argv.slice(2));
const CHECK = args.has("--check"), FORCE = args.has("--force"), PRUNE = args.has("--prune");
const ENGINE = "piper";
const outputDir = demoAudioDir(resolve(process.cwd(), "apps/web"));
const manifestPath = join(outputDir, "manifest.json");
const voicesDir = resolve(process.cwd(), ".cache/piper-voices");

const MODELS = {
  "en_GB-vctk-medium": { path: "en/en_GB/vctk/medium", license: "VCTK corpus, CC BY 4.0 (University of Edinburgh CSTR)" },
  "en_US-libritts_r-medium": { path: "en/en_US/libritts_r/medium", license: "LibriTTS-R corpus, CC BY 4.0" },
  "en_GB-cori-high": { path: "en/en_GB/cori/high", license: "cori voice, trained on public-domain LibriVox recordings" }
} as const;
type Model = keyof typeof MODELS;
type Voice = `${Model}:${string}`;

type Accent = "US" | "UK";
type Gender = "female" | "male";
/** Speakers picked from a pitch probe of every model speaker (female median F0 ≥ 190 Hz, male ≤ 120 Hz) and a natural speaking rate. */
const VOICES: Record<Accent, Record<Gender, Voice[]>> = {
  UK: { female: ["en_GB-vctk-medium:p236", "en_GB-vctk-medium:p257", "en_GB-vctk-medium:p264", "en_GB-vctk-medium:p277"], male: ["en_GB-vctk-medium:p226", "en_GB-vctk-medium:p241", "en_GB-vctk-medium:p278", "en_GB-vctk-medium:p360"] },
  US: { female: ["en_US-libritts_r-medium:15", "en_US-libritts_r-medium:150", "en_US-libritts_r-medium:180", "en_US-libritts_r-medium:450"], male: ["en_US-libritts_r-medium:105", "en_US-libritts_r-medium:330", "en_US-libritts_r-medium:345", "en_US-libritts_r-medium:600"] }
};
const NARRATOR: Voice = "en_GB-cori-high:";
/** Piper speaks at 220–240 wpm by default; these length scales bring recordings to roughly 150–175 wpm (measured by content:qa-audio). */
const RATE = { exam: 1.6, question: 1.45, dictation: 1.6, lesson: 1.55 };
/** VCTK speakers talk faster than the other models at the same length scale (probe: ~190 vs ~165 wpm). */
const MODEL_PACE: Record<Model, number> = { "en_GB-vctk-medium": 1.14, "en_US-libritts_r-medium": 1, "en_GB-cori-high": 1 };
/** TOEIC mixes North American and British speakers; IELTS recordings are mostly British. */
const ACCENTS = { TOEIC: ["US", "UK"], IELTS: ["UK", "UK", "US"], LESSON: ["US", "UK"] } satisfies Record<string, Accent[]>;

type Job = { text: string; source: string; name: string; accents: Accent[]; voiceOverrides: Record<string, string>; lengthScale: number; pauseMs: number };
type Segment = { voice: Voice; text: string; pauseBeforeMs?: number };
type Planned = Job & { key: string; segments: Segment[]; spec: string };

const hashInt = (value: string) => createHash("sha256").update(value).digest().readUInt32BE(0);
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 60);
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
const isVoice = (value: string): value is Voice => Object.keys(MODELS).some((model) => value.startsWith(`${model}:`));

function guessGender(speaker: string): Gender | null {
  if (/\b(woman|female|w|mrs|ms|miss|girl|lady)\b/iu.test(speaker)) return "female";
  if (/\b(man|male|m|mr|boy|gentleman)\b/iu.test(speaker)) return "male";
  return null;
}

/**
 * What the TTS engine is given for one line. Answer letters are read the way the real
 * test reads them ("A. At three o'clock"), and spelled words get a pause between letters
 * ("B-R-E-N-N-A-N" becomes "B, R, E, N, N, A, N"). The script itself, and so its hash, is unchanged.
 */
export function speakable(line: string) {
  return line
    .replace(/^\(([A-D])\)\s*/u, "$1. ")
    .replace(/\b[A-Z](?:-[A-Z])+\b/gu, (word) => word.split("-").join(", "))
    // espeak mangles accented loanwords ("café" came out as noise); plain letters read correctly.
    .normalize("NFD").replace(/[\u0300-\u036f]/gu, "");
}

/** Deterministic casting: explicit overrides, a narrator voice for directions, then alternating accents and genders per speaker. */
function plan(job: Job): Planned {
  const text = normalizeSpeechScript(job.text);
  const segments = parseSpeechScript(text);
  const seed = hashInt(text);
  const cast = new Map<string, Voice>();
  const used = new Set<Voice>();
  let nextGender: Gender = seed % 2 ? "male" : "female";
  const voiceFor = (speaker: string | null): Voice => {
    const name = speaker ?? "";
    const override = job.voiceOverrides[name];
    // An override is either an exact voice ("en_GB-vctk-medium:p236") or just the speaker's gender.
    const genderHint = override === "female" || override === "male" ? override : null;
    if (override && !genderHint) { if (!isVoice(override)) throw new Error(`${job.source}: unknown voice "${override}"`); return override; }
    if (/^narrator$/iu.test(name)) return NARRATOR;
    if (!cast.has(name)) {
      const accent = job.accents[(seed + cast.size) % job.accents.length]!;
      const gender = genderHint ?? (speaker ? guessGender(speaker) : null) ?? nextGender;
      nextGender = gender === "female" ? "male" : "female";
      const pool = VOICES[accent][gender];
      const voice = pool.map((_, index) => pool[(seed + index) % pool.length]!).find((candidate) => !used.has(candidate)) ?? pool[0]!;
      used.add(voice);
      cast.set(name, voice);
    }
    return cast.get(name)!;
  };
  // An answer letter is read on its own, with a short pause before the choice, as in the real test;
  // run together with the sentence it was misheard ("A. It's…" → "Hey, it's…").
  const voiced: Segment[] = segments.flatMap((segment) => {
    const voice = voiceFor(segment.speaker);
    const text = speakable(segment.text);
    const letter = /^([A-D])\. (.+)$/u.exec(text);
    return letter ? [{ voice, text: `${letter[1]}.` }, { voice, text: letter[2]!, pauseBeforeMs: 350 }] : [{ voice, text }];
  });
  const spec = createHash("sha256").update(JSON.stringify({ engine: ENGINE, pace: MODEL_PACE, lengthScale: job.lengthScale, pauseMs: job.pauseMs, segments: voiced })).digest("hex").slice(0, 16);
  return { ...job, text, key: demoAudioKey(text), segments: voiced, spec };
}

async function collectJobs(): Promise<Job[]> {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
  const accentsFor = (type: string | null) => type === "IELTS" ? ACCENTS.IELTS : type === "TOEIC" ? ACCENTS.TOEIC : ACCENTS.LESSON;
  const overridesFrom = (metadata: Record<string, unknown>) => {
    const overrides = { ...(record(metadata.audioVoices) as Record<string, string>) };
    if (typeof metadata.audioVoice === "string") overrides[""] = metadata.audioVoice;
    return overrides;
  };
  try {
    const jobs: Job[] = [];
    const parts = await sql<Array<{ slug: string; type: string; part_number: number; metadata: unknown }>>`select e.slug, e.type, p.part_number, p.metadata from exam_parts p join exams e on e.id = p.exam_id where p.metadata ? 'playbackText' and e.status <> 'ARCHIVED' order by e.slug, p.sort_order`;
    for (const part of parts) {
      const metadata = record(part.metadata);
      jobs.push({ text: String(metadata.playbackText), source: `exam ${part.slug} · part ${part.part_number}`, name: `${part.slug}-p${part.part_number}`, accents: accentsFor(part.type), voiceOverrides: overridesFrom(metadata), lengthScale: RATE.exam, pauseMs: typeof metadata.audioPauseMs === "number" ? metadata.audioPauseMs : 700 });
    }
    const listeningPassages = await sql<Array<{ slug: string; type: string; part_number: number; sort_order: number; content: string; metadata: unknown }>>`select e.slug, e.type, p.part_number, s.sort_order, s.content, s.metadata from passages s join exam_parts p on p.id = s.exam_part_id join exams e on e.id = p.exam_id where s.metadata->>'kind' = 'LISTENING' and e.status <> 'ARCHIVED' order by e.slug, p.sort_order, s.sort_order`;
    for (const passage of listeningPassages) {
      const metadata = record(passage.metadata);
      jobs.push({ text: passage.content, source: `exam ${passage.slug} · part ${passage.part_number} · passage ${passage.sort_order}`, name: `${passage.slug}-p${passage.part_number}-${passage.sort_order}`, accents: accentsFor(passage.type), voiceOverrides: overridesFrom(metadata), lengthScale: RATE.exam, pauseMs: typeof metadata.audioPauseMs === "number" ? metadata.audioPauseMs : 600 });
    }
    const heardQuestions = await sql<Array<{ id: string; type: string; content: unknown; slug: string | null; exam_type: string | null; part_number: number | null }>>`select q.id, q.type, q.content, e.slug, e.type as exam_type, p.part_number from questions q left join exam_parts p on p.id = q.exam_part_id left join exams e on e.id = p.exam_id where q.content ? 'playbackText' and not (q.content ? 'mediaId') and coalesce(e.status::text, '') <> 'ARCHIVED' order by e.slug, p.sort_order, q.created_at`;
    for (const question of heardQuestions) {
      const content = record(question.content);
      const dictation = question.type === "DICTATION";
      jobs.push({ text: String(content.playbackText), source: `${dictation ? "dictation" : "question"} ${question.slug ?? "unassigned"} · ${question.id}`, name: `${question.slug ?? "question"}-${dictation ? "dictation" : `p${question.part_number}-q`}`, accents: dictation && question.exam_type !== "IELTS" ? ACCENTS.LESSON : accentsFor(question.exam_type), voiceOverrides: overridesFrom(content), lengthScale: dictation ? RATE.dictation : RATE.question, pauseMs: 900 });
    }
    const blocks = await sql<Array<{ slug: string; content: unknown }>>`select l.slug, b.content from lesson_blocks b join lessons l on l.id = b.lesson_id where b.type = 'MEDIA' and b.content ? 'playbackText' and not (b.content ? 'mediaId') and l.status <> 'ARCHIVED' order by l.slug, b.sort_order`;
    for (const block of blocks) {
      const content = record(block.content);
      if (typeof content.playbackText !== "string" || !content.playbackText.trim()) continue;
      jobs.push({ text: content.playbackText, source: `lesson ${block.slug} · ${String(content.heading ?? "listening")}`, name: `lesson-${block.slug}`, accents: ACCENTS.LESSON, voiceOverrides: overridesFrom(content), lengthScale: RATE.lesson, pauseMs: 700 });
    }
    const placement = await sql<Array<{ slug: string; content: unknown }>>`select slug, content from placement_items where content ? 'playbackText' and status <> 'ARCHIVED' order by sort_order`;
    for (const item of placement) {
      const content = record(item.content);
      jobs.push({ text: String(content.playbackText), source: `placement ${item.slug}`, name: item.slug, accents: ACCENTS.LESSON, voiceOverrides: overridesFrom(content), lengthScale: RATE.lesson, pauseMs: 600 });
    }
    return jobs;
  } finally {
    await sql.end();
  }
}

function ensureModels(models: Set<Model>) {
  mkdirSync(voicesDir, { recursive: true });
  for (const model of models) {
    for (const suffix of [".onnx", ".onnx.json"]) {
      const file = join(voicesDir, `${model}${suffix}`);
      if (existsSync(file)) continue;
      console.log(`  downloading ${model}${suffix}…`);
      const download = spawnSync("curl", ["-sfL", "-o", file, `https://huggingface.co/rhasspy/piper-voices/resolve/main/${MODELS[model].path}/${model}${suffix}`], { stdio: "inherit" });
      if (download.status !== 0) { rmSync(file, { force: true }); throw new Error(`Could not download the Piper voice ${model}`); }
    }
  }
}

function findPython() {
  const candidates = process.env.PIPER_PYTHON ? [process.env.PIPER_PYTHON] : ["python", "py", "python3"];
  for (const command of candidates) if (spawnSync(command, ["-c", "import piper, lameenc, numpy"], { encoding: "utf8" }).status === 0) return command;
  throw new Error("Piper is not available. Install it with `pip install piper-tts lameenc` (or set PIPER_PYTHON to a Python that has it).");
}

function readManifest(): DemoAudioManifest {
  const empty: DemoAudioManifest = { version: 1, engine: ENGINE, notice: "", files: {} };
  if (!existsSync(manifestPath)) return empty;
  return { ...empty, ...JSON.parse(readFileSync(manifestPath, "utf8")) as DemoAudioManifest };
}

function writeManifest(manifest: DemoAudioManifest) {
  const files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
  const notice = "Generated from original English 4 Free scripts with Piper TTS. Voices: VCTK and LibriTTS-R (CC BY 4.0), cori (public-domain LibriVox data). See ../README.md.";
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
    ensureModels(new Set(todo.flatMap((item) => item.segments.map((segment) => segment.voice.split(":")[0] as Model))));
    const python = findPython();
    const files = new Map(todo.map((item) => [item.key, manifest.files[item.key]?.file ?? `${slugify(item.name)}-${item.key.slice(0, 8)}.mp3`]));
    const request = { voicesDir, jobs: todo.map((item) => ({ output: join(outputDir, files.get(item.key)!), pauseMs: item.pauseMs, leadMs: 300, tailMs: 500, segments: item.segments.map((segment) => { const [model, speaker] = segment.voice.split(":"); return { model, speaker: speaker || null, text: segment.text, pauseBeforeMs: segment.pauseBeforeMs, lengthScale: Math.round(item.lengthScale * MODEL_PACE[model as Model] * 100) / 100 }; }) })) };
    const run = spawnSync(python, [resolve(process.cwd(), "scripts/content/tts_piper.py")], { input: JSON.stringify(request), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const results = new Map(run.stdout.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line) as { output: string; durationMs: number }).map((result) => [result.output, result.durationMs]));
    for (const [index, item] of todo.entries()) {
      const file = files.get(item.key)!;
      const durationMs = results.get(join(outputDir, file));
      if (durationMs === undefined) continue;
      manifest.files[item.key] = { file, spec: item.spec, voices: [...new Set(item.segments.map((segment) => segment.voice))], durationMs, source: item.source, generatedAt: new Date().toISOString() };
      console.log(`  [${index + 1}/${todo.length}] ${file} · ${(durationMs / 1000).toFixed(1)}s · ${manifest.files[item.key]!.voices.join(", ")}`);
    }
    writeManifest(manifest);
    if (run.status !== 0) throw new Error(`Piper failed: ${run.stderr.trim().split("\n").slice(-3).join(" ")}`);
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
