/**
 * D3 quality gate. Every item must pass before it can be imported:
 *  - no placeholder text ("placeholder", "original-answer", "Example 1 using…", "lorem", "TODO"…);
 *  - questions build with the shared authoring format and have exactly one valid key;
 *  - multiple-choice keys are spread across positions (no "always A");
 *  - listening scripts, passages and explanations are real text of a sensible length;
 *  - (vocabulary is checked in PostgreSQL by apps/web/src/modules/vocabulary/catalog-rules.ts);
 *  - images exist on disk and carry a licence credit; no duplicate prompts or slugs.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { buildQuestionFromAuthoring } from "@english4free/content-schemas";
import { arrangeLessonOptions, type ExamDef, type Image, type LessonDef, type PlacementItemDef, type PromptDef, type PronunciationDef, type SelfAssessmentDef, type TopicCategoryDef } from "../../../content/packs/d3/types";

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
/** Speaking/writing topics: unique keys and slugs, both languages filled, 5+ sentence frames with basic and advanced ones. */
export function checkTopics(categories: TopicCategoryDef[]): GateIssue[] {
  const issues: GateIssue[] = [];
  const keys = new Set<string>();
  const slugs = { category: new Set<string>(), topic: new Set<string>() };
  const unique = (item: string, key: string, slug: string, table: keyof typeof slugs) => {
    if (keys.has(key)) issues.push({ item, problem: "duplicate key" });
    if (slugs[table].has(slug)) issues.push({ item, problem: "duplicate slug" });
    if (!/^[a-z0-9-]+$/u.test(slug)) issues.push({ item, problem: "slug must be kebab-case" });
    keys.add(key); slugs[table].add(slug);
  };
  for (const category of categories) {
    const item = `topic category ${category.slug}`;
    unique(item, category.key, category.slug, "category");
    text(issues, item, category.title.vi, "Vietnamese title"); text(issues, item, category.title.en, "English title");
    if (category.kind === "FREE_WRITING" && !category.note) issues.push({ item, problem: "writing categories need a suggested length note" });
    if (category.topics.length < 3) issues.push({ item, problem: `only ${category.topics.length} topics (expected ≥ 3)` });
    for (const topic of category.topics) {
      const at = `topic ${topic.slug}`;
      unique(at, topic.key, topic.slug, "topic");
      text(issues, at, topic.title.vi, "Vietnamese title"); text(issues, at, topic.title.en, "English title");
      text(issues, at, topic.prompt.vi, "Vietnamese prompt", 2); text(issues, at, topic.prompt.en, "English prompt", 2);
      if (topic.suggestions.length < 3) issues.push({ item: at, problem: "needs at least 3 basic sentence frames" });
      if (topic.advanced.length < 1) issues.push({ item: at, problem: "needs at least 1 advanced sentence frame" });
      if (topic.suggestions.length + topic.advanced.length < 5) issues.push({ item: at, problem: "needs at least 5 sentence frames in total" });
      for (const frame of [...topic.suggestions, ...topic.advanced]) text(issues, at, frame, "sentence frame", 2);
    }
  }
  return issues;
}

/** Pronunciation items: unique keys/slugs and the fields each kind needs. */
export function checkPronunciation(items: PronunciationDef[]): GateIssue[] {
  const issues: GateIssue[] = [];
  const keys = new Set<string>();
  const slugs = new Set<string>();
  for (const entry of items) {
    const item = `pronunciation ${entry.slug}`;
    if (keys.has(entry.key)) issues.push({ item, problem: "duplicate key" });
    if (slugs.has(entry.slug)) issues.push({ item, problem: "duplicate slug" });
    if (!/^[a-z0-9-]+$/u.test(entry.slug)) issues.push({ item, problem: "slug must be kebab-case" });
    keys.add(entry.key); slugs.add(entry.slug);
    if (entry.kind === "SOUND") { text(issues, item, entry.content.keyword, "keyword"); if (entry.content.examples.length < 2) issues.push({ item, problem: "needs two example words" }); }
    if (entry.kind === "PAIR") { if (entry.content.contrast.length !== 2) issues.push({ item, problem: "a minimal pair contrasts two sounds" }); text(issues, item, entry.content.tip.vi, "Vietnamese tip", 4); text(issues, item, entry.content.tip.en, "English tip", 4); }
    if (entry.kind === "SHADOW") { text(issues, item, entry.content.targetText, "target sentence", 3); if (!entry.content.focusSounds.length) issues.push({ item, problem: "needs focus sounds" }); }
  }
  return issues;
}

/** Chart-level checks the old app fixture test covered: both vowels and consonants, distinct pair contrasts. */
export function checkPronunciationSet(items: PronunciationDef[]): GateIssue[] {
  const issues: GateIssue[] = [];
  const kinds = new Set(items.flatMap((item) => (item.kind === "SOUND" ? [item.content.kind] : [])));
  if (!kinds.has("vowel") || !kinds.has("consonant")) issues.push({ item: "pronunciation chart", problem: "needs both vowels and consonants" });
  for (const item of items) if (item.kind === "PAIR" && item.content.contrast[0] === item.content.contrast[1]) issues.push({ item: `pronunciation ${item.slug}`, problem: "the two contrasted sounds must differ" });
  return issues;
}

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function checkPlacement(items: PlacementItemDef[], statements: SelfAssessmentDef[]): GateIssue[] {
  const issues: GateIssue[] = [];
  const keys = new Set<string>();
  const prompts = new Set<string>();
  const cells = new Map<string, number>();
  for (const item of items) {
    const at = item.key;
    if (keys.has(item.key)) issues.push({ item: at, problem: "duplicate key" });
    keys.add(item.key);
    cells.set(`${item.skill}:${item.level}`, (cells.get(`${item.skill}:${item.level}`) ?? 0) + 1);
    text(issues, at, item.q, "question", 2, 300);
    text(issues, at, item.why, "explanation", 2, 400);
    if (item.options.length < 3 || item.options.length > 4) issues.push({ item: at, problem: "needs 3 or 4 options" });
    if (new Set(item.options.map((option) => option.trim().toLowerCase())).size !== item.options.length) issues.push({ item: at, problem: "duplicate options" });
    if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.options.length) issues.push({ item: at, problem: "answer index out of range" });
    for (const option of item.options) text(issues, at, option, "option");
    if (item.skill === "GRAMMAR" || item.skill === "VOCABULARY") {
      if (!item.q.includes("___")) issues.push({ item: at, problem: "gap-fill question needs a ___ gap" });
      if (item.passage || item.script) issues.push({ item: at, problem: "gap-fill items take no passage or script" });
      if (prompts.has(item.q)) issues.push({ item: at, problem: "duplicate question" });
      prompts.add(item.q);
    }
    if (item.skill === "READING") { text(issues, at, item.passage, "passage", 15, 1_200); if (item.script) issues.push({ item: at, problem: "reading items take no script" }); }
    if (item.skill === "LISTENING") { text(issues, at, item.script, "script", 8, 1_200); if (item.passage) issues.push({ item: at, problem: "listening items take no passage" }); }
  }
  for (const skill of ["GRAMMAR", "VOCABULARY", "READING", "LISTENING"]) for (const level of LEVEL_ORDER) {
    if ((cells.get(`${skill}:${level}`) ?? 0) < 3) issues.push({ item: `placement ${skill} ${level}`, problem: "needs at least 3 items" });
  }
  spread(issues, "placement bank", items.map((item) => String(arrangeLessonOptions(item.key, { q: item.q, options: item.options, answer: item.answer, why: item.why }, 0).answer)));
  for (const skill of ["SPEAKING", "WRITING"] as const) for (const level of LEVEL_ORDER) {
    const matches = statements.filter((statement) => statement.skill === skill && statement.level === level);
    if (matches.length !== 1) issues.push({ item: `self-assessment ${skill} ${level}`, problem: `needs exactly one can-do statement (found ${matches.length})` });
    for (const statement of matches) { text(issues, `self-assessment ${skill} ${level}`, statement.canDo.en, "English statement", 6, 300); text(issues, `self-assessment ${skill} ${level}`, statement.canDo.vi, "Vietnamese statement", 6, 300); }
  }
  return issues;
}
