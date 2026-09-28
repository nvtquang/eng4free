/**
 * Blind cross-check of the D3 answer keys (`pnpm content:d3:crosscheck`).
 *
 * An independent model (Gemini) answers every question from the same material a learner
 * gets (reading text, recording transcript, photograph or graphic) without seeing the key.
 * Its answers are scored with the real scoring engine; every disagreement is written to
 * content/packs/d3/qa/crosscheck.json so a reviewer checks those items first. Agreement is
 * evidence, not proof: the reviewer's spot check still decides.
 *
 *   --only=lessons,toeic,ielts   limit the areas (default: all)
 */
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildQuestionFromAuthoring, type AuthoredQuestion, type QuestionResponse } from "@english4free/content-schemas";
import { scoreQuestion } from "@english4free/scoring-core";
import { d3Exams, d3Lessons } from "../../../content/packs/d3";
import { arrangeLessonOptions, type ExamQuestion, type Image } from "../../../content/packs/d3/types";
import "./shared";

type Item = { id: string; area: string; label: string; question: AuthoredQuestion; explanation: string };
type Batch = { key: string; area: string; context: string; images: Image[]; items: Item[] };
type Mismatch = { id: string; area: string; label: string; key: string; modelAnswer: string; modelNote?: string; explanation: string };

const only = new Set((process.argv.find((arg) => arg.startsWith("--only="))?.slice(7) ?? "lessons,toeic,ielts").split(","));
const outPath = resolve(process.cwd(), "content/packs/d3/qa/crosscheck.json");
const LETTERS = "ABCDEFGHIJKL";
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

function describe(item: Item, index: number): string {
  const q = item.question;
  const head = `Q${index + 1} [${q.type}] ${q.content.prompt}`;
  switch (q.type) {
    case "MCQ": return `${head}\n${q.content.options.map((option, n) => `  ${LETTERS[n]}. ${option.text}`).join("\n")}\nAnswer with one letter.`;
    case "MULTI_SELECT": return `${head}\n${q.content.options.map((option, n) => `  ${LETTERS[n]}. ${option.text}`).join("\n")}\nChoose exactly ${q.content.selectCount} letters, comma-separated.`;
    case "TRUE_FALSE": return `${head}\nAnswer ${q.content.variant === "YES_NO_NOT_GIVEN" ? "YES, NO or NOT_GIVEN" : "TRUE, FALSE or NOT_GIVEN"}.`;
    case "FILL_BLANK": return `${head}\nThe blanks are marked {{n}}.${q.content.wordLimit ? ` Use no more than ${q.content.wordLimit} word(s) per blank.` : ""} Answer each blank in order, separated by " | ".`;
    case "MATCHING": return `${head}\nItems:\n${q.content.items.map((entry, n) => `  ${n + 1}. ${entry.text}`).join("\n")}\nOptions:\n${q.content.options.map((option, n) => `  ${LETTERS[n]}. ${option.text}`).join("\n")}\nGive one option letter per item, in item order, comma-separated.`;
    default: return `${head}`;
  }
}

function toResponse(question: AuthoredQuestion, answer: string): QuestionResponse | null {
  const letters = answer.toUpperCase().split(/[\s,;/]+/u).filter(Boolean);
  switch (question.type) {
    case "MCQ": return { optionId: (letters[0] ?? "").toLowerCase() };
    case "MULTI_SELECT": return { optionIds: letters.map((letter) => letter.toLowerCase()) };
    case "TRUE_FALSE": { const value = answer.toUpperCase().replace(/[\s-]+/gu, "_"); return { value: value === "YES" ? "TRUE" : value === "NO" ? "FALSE" : value } as QuestionResponse; }
    case "FILL_BLANK": { const parts = answer.split("|").map((part) => part.trim()); const tokens = [...question.content.prompt.matchAll(/\{\{\s*([A-Za-z0-9_-]{1,16})\s*\}\}/gu)].map((match) => match[1]!); return { blanks: Object.fromEntries(tokens.map((token, index) => [token, parts[index] ?? ""])) }; }
    case "MATCHING": return { matches: Object.fromEntries(question.content.items.map((entry, index) => [entry.id, (letters[index] ?? "").toLowerCase()])) };
    default: return null;
  }
}

function keyText(question: AuthoredQuestion): string {
  const answer = question.answer as Record<string, unknown>;
  switch (question.type) {
    case "MCQ": return String(answer.correctOptionId).toUpperCase();
    case "MULTI_SELECT": return (answer.correctOptionIds as string[]).join(",").toUpperCase();
    case "TRUE_FALSE": return String(answer.correct);
    case "FILL_BLANK": return Object.values(answer.blanks as Record<string, string[]>).map((forms) => forms[0]).join(" | ");
    case "MATCHING": return Object.values(answer.matches as Record<string, string>).join(",").toUpperCase();
    default: return JSON.stringify(answer);
  }
}

function examBatches(): Batch[] {
  const batches: Batch[] = [];
  for (const exam of d3Exams) {
    if (!only.has(exam.batch)) continue;
    for (const part of exam.parts) part.groups.forEach((group, groupIndex) => {
      const build = (question: ExamQuestion, n: number): Item => {
        const built = buildQuestionFromAuthoring(question.authoring);
        if (!built.success) throw new Error(built.error);
        return { id: `${exam.slug}/p${part.partNumber}/g${groupIndex + 1}/q${n + 1}`, area: exam.batch, label: `${exam.title} · Part ${part.partNumber} · ${group.title ?? `group ${groupIndex + 1}`} · Q${n + 1}`, question: built.data, explanation: question.explanation };
      };
      // Questions heard on their own (Part 1–2) each carry their own transcript and picture.
      if (group.questions.some((question) => question.audio)) {
        group.questions.forEach((question, n) => batches.push({ key: `${exam.slug}/p${part.partNumber}/q${n + 1}`, area: exam.batch, context: `Recording transcript (the learner hears this):\n${question.audio}${question.image && !question.image.src.endsWith(".jpg") ? `\nPicture: ${question.image.alt}` : ""}`, images: question.image?.src.endsWith(".jpg") ? [question.image] : [], items: [build(question, n)] }));
        return;
      }
      const context = [group.passage ? `Reading text:\n${group.passage}` : "", group.listening ? `Recording transcript (the learner hears this):\n${group.listening.script}` : "", group.image ? `Graphic: ${group.image.alt}` : ""].filter(Boolean).join("\n\n");
      batches.push({ key: `${exam.slug}/p${part.partNumber}/g${groupIndex + 1}`, area: exam.batch, context: `${part.instructions}\n\n${context}`, images: [], items: group.questions.map(build) });
    });
  }
  return batches;
}

function lessonBatches(): Batch[] {
  if (!only.has("lessons")) return [];
  return d3Lessons.map((lesson) => {
    const context = lesson.blocks.map((block) => block.kind === "practice" ? "" : block.kind === "listening" ? `Recording transcript:\n${block.script}` : `${block.heading}\n${block.body}`).filter(Boolean).join("\n\n");
    const items = lesson.blocks.flatMap((block, blockIndex) => block.kind !== "practice" ? [] : block.questions.map((question, n): Item => {
      const arranged = arrangeLessonOptions(`${lesson.key}:${blockIndex}`, question, n);
      const built = buildQuestionFromAuthoring({ type: "MCQ", prompt: question.q, options: arranged.options, correct: LETTERS[arranged.answer]! });
      if (!built.success) throw new Error(built.error);
      return { id: `${lesson.level}/${lesson.slug}/q${n + 1}`, area: lesson.batch, label: `${lesson.level} · ${lesson.title} · Q${n + 1}`, question: built.data, explanation: question.why };
    }));
    return { key: `${lesson.level}/${lesson.slug}`, area: lesson.batch, context: `Lesson: ${lesson.title}\n\n${context}`, images: [], items };
  });
}

let lastCall = 0;
/** Free-tier quotas are per model and per day, so the check moves on to the next model when one runs out. */
const MODELS = (process.env.CROSSCHECK_MODELS ?? "gemini-3.5-flash,gemini-3.7-flash,gemini-3-flash-preview,gemini-3.6-flash,gemini-3.8-flash").split(",");
let modelIndex = 0;
async function ask(group: Batch[], attempt = 1): Promise<Array<{ id: string; answer: string; note?: string }>> {
  const gap = Number(process.env.CROSSCHECK_GAP_MS ?? 7_000);
  const wait = lastCall + gap - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for the cross-check");
  const model = MODELS[modelIndex];
  if (!model) throw new Error("every configured model has reached its daily quota");
  const base = (process.env.GEMINI_API_BASE_URL?.trim() || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/u, "");
  let number = 0;
  const sets = group.map((batch, index) => `### Set ${index + 1}\n${batch.context}\n\nQuestions:\n${batch.items.map((item) => describe(item, number++)).join("\n\n")}`).join("\n\n");
  const text = `You are checking an English test. Each set has its own material; answer every question using ONLY the material of its set. Be strict: choose the single best answer as a careful examiner would.\n\n${sets}\n\nReturn JSON {"answers":[{"id":"Q1","answer":"...","note":"optional short reason if the question seems ambiguous or has more than one correct answer"}]} with one entry for every question Q1–Q${number}.`;
  const images = group.flatMap((batch) => batch.images);
  const input = [...images.map((image) => ({ type: "image", mime_type: "image/jpeg", data: readFileSync(resolve(process.cwd(), "apps/web/public" + image.src)).toString("base64") })), { type: "text", text }];
  const response = await fetch(`${base}/interactions`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ model, store: false, input, generation_config: { temperature: 0, thinking_level: "medium" }, response_format: { type: "text", mime_type: "application/json" } }), signal: AbortSignal.timeout(180_000) });
  const body = await response.json().catch(() => null) as { output_text?: string; steps?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } } | null;
  if (!response.ok) {
    const message = body?.error?.message ?? `Gemini request failed (${response.status})`;
    if (response.status === 429 && /per day/iu.test(message)) { console.log(`  ${model} reached its daily quota; switching model`); modelIndex += 1; return ask(group, attempt); }
    if (response.status === 404) { modelIndex += 1; return ask(group, attempt); }
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) { await sleep(20_000 * attempt); return ask(group, attempt + 1); }
    throw new Error(message);
  }
  const output = (body?.output_text ?? body?.steps?.flatMap((step) => step.content ?? []).filter((item) => item.type === "text").map((item) => item.text ?? "").join("") ?? "").trim();
  return (JSON.parse(output.replace(/^```(?:json)?|```$/gu, "")) as { answers: Array<{ id: string; answer: string; note?: string }> }).answers;
}

/** Two runs writing the same ledger overwrite each other's results, so only one may run at a time. */
function acquireLock() {
  const lockPath = resolve(process.cwd(), ".cache/crosscheck.lock");
  mkdirSync(resolve(lockPath, ".."), { recursive: true });
  try { closeSync(openSync(lockPath, "wx")); } catch { throw new Error(`Another cross-check is running (remove ${lockPath} if it crashed).`); }
  const release = () => rmSync(lockPath, { force: true });
  process.on("exit", release);
  process.on("SIGINT", () => { release(); process.exit(130); });
}

async function main() {
  acquireLock();
  const batches = [...lessonBatches(), ...examBatches()];
  const previous = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) as { checked: Record<string, "agree" | "disagree">; mismatches: Mismatch[] } : { checked: {}, mismatches: [] };
  const checked = previous.checked ?? {};
  let mismatches = (previous.mismatches ?? []).filter((item) => batches.some((batch) => batch.items.some((entry) => entry.id === item.id)));
  const todo = batches.filter((batch) => batch.items.some((item) => !checked[item.id]));
  console.log(`${batches.length} batches, ${batches.reduce((sum, batch) => sum + batch.items.length, 0)} questions; ${todo.length} batches still to check`);
  mkdirSync(resolve(outPath, ".."), { recursive: true });
  const groups: Batch[][] = [];
  for (const batch of todo) {
    const last = groups.at(-1);
    const size = (group: Batch[]) => group.reduce((sum, entry) => sum + entry.items.length, 0);
    const pictures = (group: Batch[]) => group.reduce((sum, entry) => sum + entry.images.length, 0);
    if (last && size(last) + batch.items.length <= 30 && pictures(last) + batch.images.length <= 6) last.push(batch); else groups.push([batch]);
  }
  for (const [index, group] of groups.entries()) {
    let answers: Awaited<ReturnType<typeof ask>>;
    try { answers = await ask(group); } catch (error) { console.log(`  ! ${group.map((batch) => batch.key).join(", ")}: ${error instanceof Error ? error.message : error}`); if (/every configured model/u.test(String(error))) break; continue; }
    const items = group.flatMap((batch) => batch.items);
    items.forEach((item, n) => {
      const reply = answers.find((answer) => answer.id === `Q${n + 1}`) ?? answers[n];
      const response = reply ? toResponse(item.question, String(reply.answer)) : null;
      const score = response ? scoreQuestion(item.question, response) : null;
      const agree = Boolean(score && score.earnedPoints === score.availablePoints);
      checked[item.id] = agree ? "agree" : "disagree";
      mismatches = mismatches.filter((entry) => entry.id !== item.id);
      if (!agree) mismatches.push({ id: item.id, area: item.area, label: item.label, key: keyText(item.question), modelAnswer: String(reply?.answer ?? "(no answer)"), modelNote: reply?.note, explanation: item.explanation });
    });
    writeFileSync(outPath, JSON.stringify({ models: MODELS.slice(0, modelIndex + 1), updatedAt: new Date().toISOString(), checked, mismatches }, null, 1) + "\n");
    console.log(`  [${index + 1}/${groups.length}] ${group.map((batch) => batch.key).join(", ")}: ${items.filter((item) => checked[item.id] === "disagree").length} disagreement(s)`);
  }
  const total = Object.keys(checked).length;
  console.log(`\nChecked ${total} questions; ${mismatches.length} disagreement(s) recorded in ${outPath.replace(process.cwd(), ".")}`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
