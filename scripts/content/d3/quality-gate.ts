/**
 * D3 quality gate. Every item must pass before it can be imported:
 *  - no placeholder text ("placeholder", "original-answer", "Example 1 using…", "lorem", "TODO"…);
 *  - questions build with the shared authoring format and have exactly one valid key;
 *  - multiple-choice keys are spread across positions (no "always A");
 *  - listening scripts, passages and explanations are real text of a sensible length;
 *  - vocabulary has a sourced Vietnamese meaning, IPA in slashes, a part of speech from the
 *    level list, per-field source + licence, and an example sentence that uses the headword;
 *  - images exist on disk and carry a licence credit; no duplicate prompts or slugs.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { buildQuestionFromAuthoring } from "@english4free/content-schemas";
import { arrangeLessonOptions, type ExamDef, type Image, type LessonDef, type PromptDef, type VocabularySelection } from "../../../content/packs/d3/types";

export type GateIssue = { item: string; problem: string };
const PLACEHOLDER = /(placeholder|original[- ]answer|example \d+ using|original example|lorem ipsum|\btodo\b|\btbd\b|xxx|kiểm tra renderer|sample text|\[insert|to be written)/iu;
const publicDir = resolve(process.cwd(), "apps/web/public");

function text(issues: GateIssue[], item: string, value: string | undefined, label: string, min = 1, max = 20_000) {
  if (!value || !value.trim()) { issues.push({ item, problem: `${label} is empty` }); return; }
  if (PLACEHOLDER.test(value)) issues.push({ item, problem: `${label} contains placeholder text: "${value.match(PLACEHOLDER)?.[0]}"` });
  const words = value.trim().split(/\s+/u).length;
  if (words < min) issues.push({ item, problem: `${label} is too short (${words} words, expected ≥ ${min})` });
  if (value.length > max) issues.push({ item, problem: `${label} is too long (${value.length} chars)` });
}

function image(issues: GateIssue[], item: string, value: Image | undefined) {
  if (!value) return;
  if (!value.src.startsWith("/demo-media/")) issues.push({ item, problem: `image ${value.src} must be served from /demo-media/` });
  else if (!existsSync(resolve(publicDir, "." + value.src))) issues.push({ item, problem: `image file ${value.src} is missing` });
  if (!value.alt.trim()) issues.push({ item, problem: "image needs alt text" });
  if (!value.credit || !/(CC0|public domain|CC BY|English 4 Free)/iu.test(value.credit)) issues.push({ item, problem: "image needs a credit line naming its licence" });
}

function spread(issues: GateIssue[], item: string, keys: string[]) {
  if (keys.length < 8) return;
  const counts = new Map<string, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  const top = Math.max(...counts.values());
  if (top / keys.length > 0.5) issues.push({ item, problem: `answer key is lopsided: ${[...counts].map(([key, count]) => `${key}×${count}`).join(" ")}` });
}

export function checkLessons(lessons: LessonDef[]): GateIssue[] {
  const issues: GateIssue[] = [];
  const slugs = new Set<string>();
  for (const lesson of lessons) {
    const item = `lesson ${lesson.level}/${lesson.slug}`;
    if (slugs.has(`${lesson.level}/${lesson.slug}`)) issues.push({ item, problem: "duplicate slug" });
    slugs.add(`${lesson.level}/${lesson.slug}`);
    if (!/^[a-z0-9-]+$/u.test(lesson.slug)) issues.push({ item, problem: "slug must be kebab-case" });
    text(issues, item, lesson.title, "title");
    const practice = lesson.blocks.filter((block) => block.kind === "practice");
    if (!practice.length) issues.push({ item, problem: "lesson has no practice questions" });
    const keys: string[] = [];
    for (const [blockIndex, block] of lesson.blocks.entries()) {
      if (block.kind === "practice") {
        text(issues, item, block.instruction, "instruction");
        if (block.questions.length < 4) issues.push({ item, problem: `only ${block.questions.length} practice questions (expected ≥ 4)` });
        for (const [index, question] of block.questions.entries()) {
          const at = `${item} q${index + 1}`;
          text(issues, at, question.q, "question");
          text(issues, at, question.why, "explanation", 2);
          if (question.options.length < 3) issues.push({ item: at, problem: "needs at least 3 options" });
          if (new Set(question.options.map((option) => option.trim())).size !== question.options.length) issues.push({ item: at, problem: "duplicate options" });
          if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) issues.push({ item: at, problem: "answer index out of range" });
          for (const option of question.options) text(issues, at, option, "option");
          keys.push(String(arrangeLessonOptions(`${lesson.key}:${blockIndex}`, question, index).answer));
        }
      } else if (block.kind === "listening") {
        text(issues, item, block.script, "listening script", 25);
      } else {
        text(issues, item, block.body, `${block.kind} block "${block.heading}"`, 15);
      }
    }
    spread(issues, item, keys);
  }
  return issues;
}

export function checkExams(exams: ExamDef[]): GateIssue[] {
  const issues: GateIssue[] = [];
  const slugs = new Set<string>();
  for (const exam of exams) {
    if (slugs.has(exam.slug)) issues.push({ item: exam.slug, problem: "duplicate slug" });
    slugs.add(exam.slug);
    const keys: string[] = [];
    const prompts = new Set<string>();
    for (const part of exam.parts) {
      const partItem = `${exam.slug} part ${part.partNumber}`;
      text(issues, partItem, part.instructions, "instructions", 4);
      if (!part.groups.length) issues.push({ item: partItem, problem: "part has no questions" });
      for (const [groupIndex, group] of part.groups.entries()) {
        const item = `${partItem} group ${groupIndex + 1}`;
        if (group.passage !== undefined) text(issues, item, group.passage, "passage", 20);
        if (group.listening) text(issues, item, group.listening.script, "listening script", 20);
        image(issues, item, group.image);
        if (!group.questions.length) issues.push({ item, problem: "group has no questions" });
        for (const [index, question] of group.questions.entries()) {
          const at = `${item} q${index + 1}`;
          const built = buildQuestionFromAuthoring(question.authoring);
          if (!built.success) { issues.push({ item: at, problem: built.error }); continue; }
          text(issues, at, question.authoring.prompt, "prompt");
          text(issues, at, question.explanation, "explanation", 3);
          for (const option of question.authoring.options ?? []) if (option) text(issues, at, option, "option");
          if (question.audio !== undefined) text(issues, at, question.audio, "question audio", 8);
          image(issues, at, question.image);
          if (question.authoring.type === "MCQ") keys.push(String(question.authoring.correct).toUpperCase());
          const fingerprint = `${question.authoring.prompt}|${(question.authoring.options ?? []).join("|")}|${question.audio ?? ""}`;
          if (prompts.has(fingerprint) && !question.audio && question.authoring.options?.length) issues.push({ item: at, problem: "duplicate question in this exam" });
          prompts.add(fingerprint);
        }
      }
    }
    spread(issues, exam.slug, keys);
  }
  return issues;
}

export function checkPrompts(prompts: PromptDef[]): GateIssue[] {
  const issues: GateIssue[] = [];
  for (const prompt of prompts) {
    const item = `prompt ${prompt.slug}`;
    text(issues, item, prompt.content.prompt, "prompt", 5);
    text(issues, item, prompt.content.instructions, "instructions", 5);
    image(issues, item, prompt.content.image);
    if (prompt.kind === "IELTS_WRITING_TASK_1" && !prompt.content.image) issues.push({ item, problem: "Task 1 needs a chart or diagram" });
    if (prompt.kind === "IELTS_SPEAKING" && (!prompt.content.part1?.length || !prompt.content.cueCard || !prompt.content.part3?.length)) issues.push({ item, problem: "speaking set needs Part 1, a cue card and Part 3" });
  }
  return issues;
}

/** Inflections that count as "using the headword" in an example sentence. */
function mentions(sentence: string, headword: string) {
  const lower = sentence.toLowerCase();
  const stem = headword.replace(/(e|y)$/u, "");
  return new RegExp(`\\b(${headword}|${stem}[a-z]{0,4})\\b`, "u").test(lower) || lower.includes(headword);
}

export function checkVocabulary(entries: Array<VocabularySelection & { example?: string }>): GateIssue[] {
  const issues: GateIssue[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const item = `vocab ${entry.headword} (${entry.pos}, ${entry.level})`;
    if (seen.has(`${entry.headword}|${entry.pos}|${entry.level}`)) issues.push({ item, problem: "duplicate entry" });
    seen.add(`${entry.headword}|${entry.pos}|${entry.level}`);
    if (!["noun", "verb", "adjective", "adverb"].includes(entry.pos)) issues.push({ item, problem: `unexpected part of speech "${entry.pos}"` });
    if (!/^\/[^/]+\/$/u.test(entry.ipa)) issues.push({ item, problem: `IPA "${entry.ipa}" is not in /slashes/` });
    if (!entry.meaningVi.trim() || PLACEHOLDER.test(entry.meaningVi)) issues.push({ item, problem: "Vietnamese meaning missing" });
    for (const field of ["level", "meaning", "ipa"] as const) {
      const source = entry.sources[field];
      if (!source?.url?.startsWith("https://") || !source.license) issues.push({ item, problem: `${field} source or licence missing` });
    }
    if (!entry.example) issues.push({ item, problem: "example sentence missing" });
    else {
      text(issues, item, entry.example, "example", 4, 220);
      if (!mentions(entry.example, entry.headword)) issues.push({ item, problem: `example does not use "${entry.headword}": ${entry.example}` });
    }
  }
  return issues;
}
