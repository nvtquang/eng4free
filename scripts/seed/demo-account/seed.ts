/**
 * Seeds the demo account: a B1 learner preparing for IELTS with about three weeks of study
 * history, so the dashboard, Today, Path, vocabulary, mistakes and history pages look in use.
 *
 *   pnpm seed:demo-account                         rebuild the demo learner (safe to rerun)
 *   pnpm seed:demo-account -- --capture-feedback   also ask Gemini for any missing feedback
 *
 * The history is produced by replaying three weeks of study through the app's own modules
 * (adaptive placement, lesson and exam scoring, FSRS reviews, the mistake notebook and XP
 * events) under a shifted clock, so every number on screen is one the app computed itself.
 * The history ends yesterday: rerun this on the morning of a demo to keep the streak alive.
 *
 * Writing and speaking feedback is real output of the app's AI pipeline, captured once with
 * --capture-feedback into captured-feedback.json, so seeding needs no network or AI quota.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { and, eq, inArray, sql as dsql } from "drizzle-orm";
import { parseAuthoredQuestion, type QuestionResponse, type SpeakingFeedback, type WritingFeedback } from "@english4free/content-schemas";
import { createDatabase } from "../../../apps/web/src/db/client";
import * as schema from "../../../apps/web/src/db/schema";
import { DEMO_USER } from "../../../apps/web/src/modules/auth/demo-account";
import { createLinkedLearner } from "../../../apps/web/src/modules/learners/repository";
import { startPlacement, answerPlacement, completePlacement } from "../../../apps/web/src/modules/placement/service";
import { upsertLearnerProfile } from "../../../apps/web/src/modules/onboarding/repository";
import { listPathLessons, listCompletedLessonIds } from "../../../apps/web/src/modules/path/repository";
import { nextInPath } from "../../../apps/web/src/modules/path/path-order";
import { getLessonQuestionSetForScoring } from "../../../apps/web/src/modules/lessons/repository";
import { completeLesson } from "../../../apps/web/src/modules/lessons/completion";
import { startOrResumeExam, submitExamAttempt } from "../../../apps/web/src/modules/exams/exam-engine";
import { addToWordbook, recordVocabularyReview } from "../../../apps/web/src/modules/vocabulary/review-schedule";
import { listOpenMistakes, resolveMistakes } from "../../../apps/web/src/modules/mistakes/repository";
import { saveWritingSubmission, saveWritingFeedback } from "../../../apps/web/src/modules/writing/repository";
import { appendProgressEvent } from "../../../apps/web/src/modules/progress/repository";
import { speakingWork, writingWork } from "./learner-work";

for (const envFile of [resolve(process.cwd(), "apps/web/.env.local"), resolve(process.cwd(), ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);

const CAPTURE = process.argv.includes("--capture-feedback");
const FEEDBACK_PATH = resolve(process.cwd(), "scripts/seed/demo-account/captured-feedback.json");
const TIME_ZONE_OFFSET_HOURS = 7; // Asia/Ho_Chi_Minh, no daylight saving
const PROFILE = { goal: "ielts" as const, minutesPerDay: 20 };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed the demo account.");
const target = new URL(databaseUrl);
if (!["localhost", "127.0.0.1", "::1"].includes(target.hostname) || !/^\/english4free(?:[_-].+)?$/u.test(target.pathname)) throw new Error(`Refusing to seed the demo account into ${target.hostname}${target.pathname}`);
const db = createDatabase();
if (!db) throw new Error("DATABASE_URL is required to seed the demo account.");

// ---------------------------------------------------------------------------------------------
// Deterministic randomness and a shifted clock
// ---------------------------------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const random = mulberry32(20261001);
Math.random = random; // placement picks its questions with Math.random
const chance = (p: number) => random() < p;
const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)]!;

const RealDate = Date;
const realStart = new RealDate();
let fakeNow: number | null = null;
/** `new Date()` and `Date.now()` return the simulated time while a step runs. */
class SeedDate extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0 && fakeNow !== null) super(fakeNow);
    else super(...(args as [string]));
  }
  static override now() { return fakeNow ?? RealDate.now(); }
}
globalThis.Date = SeedDate as DateConstructor;

const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(realStart);
/** A wall-clock time in Vietnam, `dayOffset` days from today. */
function at(dayOffset: number, time: string): Date {
  const [year, month, day] = todayKey.split("-").map(Number) as [number, number, number];
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  return new RealDate(RealDate.UTC(year, month - 1, day + dayOffset, hour - TIME_ZONE_OFFSET_HOURS, minute));
}
const plusMinutes = (date: Date, minutes: number) => new RealDate(date.getTime() + minutes * 60_000);

let learnerId = "";
const actor = () => ({ learnerId });

/**
 * Runs one step at a simulated time. Columns the database fills with now() are moved back to
 * that time afterwards; only this learner's rows are touched.
 */
async function step<T>(when: Date, run: () => Promise<T>): Promise<T> {
  fakeNow = when.getTime();
  try { return await run(); } finally { fakeNow = null; await backdate(when); }
}

const owned: Array<[table: string, columns: string[], where: string]> = [
  ["learners", ["created_at", "last_seen_at"], "id = $1"],
  ["learner_links", ["created_at"], "learner_id = $1"],
  ["learner_profiles", ["completed_at", "updated_at"], "learner_id = $1"],
  ["placement_attempts", ["started_at", "updated_at", "completed_at"], "learner_id = $1"],
  ["lesson_completions", ["completed_at", "updated_at"], "learner_id = $1"],
  ["attempts", ["started_at", "submitted_at", "created_at", "updated_at"], "learner_id = $1"],
  ["attempt_answers", ["updated_at"], "attempt_id IN (SELECT id FROM attempts WHERE learner_id = $1)"],
  ["mistakes", ["created_at", "updated_at", "resolved_at"], "learner_id = $1"],
  ["vocabulary_reviews", ["created_at", "updated_at"], "learner_id = $1"],
  ["writing_submissions", ["created_at", "updated_at", "submitted_at"], "learner_id = $1"],
  ["writing_revisions", ["created_at"], "submission_id IN (SELECT id FROM writing_submissions WHERE learner_id = $1)"],
  ["writing_feedback", ["created_at"], "submission_id IN (SELECT id FROM writing_submissions WHERE learner_id = $1)"],
  ["progress_events", ["occurred_at"], "learner_id = $1"]
];
async function backdate(when: Date) {
  for (const [table, columns, where] of owned) {
    for (const column of columns) await db!.execute(dsql.raw(`UPDATE ${table} SET ${column} = '${when.toISOString()}' WHERE ${where.replace("$1", `'${learnerId}'`)} AND ${column} > '${realStart.toISOString()}'`));
  }
}

// ---------------------------------------------------------------------------------------------
// Learner-like answers
// ---------------------------------------------------------------------------------------------

/** A response that is right with probability `accuracy`, otherwise a plausible mistake. */
function respond(row: { type: string; content: unknown; answer: unknown; explanation: string | null }, accuracy: number): QuestionResponse {
  const question = parseAuthoredQuestion(row);
  const right = chance(accuracy);
  switch (question.type) {
    case "MCQ": {
      const wrong = question.content.options.filter((option) => option.id !== question.answer.correctOptionId);
      return { optionId: right ? question.answer.correctOptionId : pick(wrong).id };
    }
    case "MULTI_SELECT": {
      const correct = question.answer.correctOptionIds;
      if (right) return { optionIds: [...correct] };
      const distractor = question.content.options.find((option) => !correct.includes(option.id));
      return { optionIds: distractor ? [...correct.slice(1), distractor.id] : [...correct] };
    }
    case "TRUE_FALSE": {
      const values = question.content.variant === "TRUE_FALSE" ? ["TRUE", "FALSE"] as const : ["TRUE", "FALSE", "NOT_GIVEN"] as const;
      return { value: right ? question.answer.correct : pick(values.filter((value) => value !== question.answer.correct)) };
    }
    case "FILL_BLANK":
      return { blanks: Object.fromEntries(Object.entries(question.answer.blanks).map(([id, accepted]) => [id, chance(accuracy) ? accepted[0]! : misspell(accepted[0]!)])) };
    case "MATCHING": {
      const options = question.content.options.map((option) => option.id);
      return { matches: Object.fromEntries(Object.entries(question.answer.matches).map(([item, option]) => [item, chance(accuracy) ? option : pick(options.filter((id) => id !== option))])) };
    }
    case "ORDERING": {
      const order = [...question.answer.order];
      if (!right) { const index = Math.floor(random() * (order.length - 1)); [order[index], order[index + 1]] = [order[index + 1]!, order[index]!]; }
      return { order };
    }
    case "DICTATION": {
      const text = question.answer.accepted[0]!;
      return { text: right ? text : text.split(" ").filter((_, index) => index !== 1).join(" ") };
    }
  }
}
/** A learner's slip: a dropped letter, or a plural that should not be there. */
function misspell(word: string) {
  if (word.length > 4) { const index = 1 + Math.floor(random() * (word.length - 2)); return word.slice(0, index) + word.slice(index + 1); }
  return `${word}s`;
}

// ---------------------------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------------------------

const levelOdds: Record<string, number> = { A1: 1, A2: 1, B1: 0.95, B2: 0.35, C1: 0.1, C2: 0 };

async function takePlacement(when: Date) {
  const view = await step(when, () => startPlacement(actor(), "B1"));
  let current = view;
  let minute = 0;
  while (current.question) {
    const question = current.question;
    const [item] = await db!.select({ level: schema.placementItems.cefrLevel, answer: schema.placementItems.answer }).from(schema.placementItems).where(eq(schema.placementItems.id, question.itemId));
    const correctId = (item!.answer as { correctOptionId: string }).correctOptionId;
    const optionId = chance(levelOdds[item!.level] ?? 0.5) ? correctId : pick(question.options.filter((option) => option.id !== correctId)).id;
    minute += 0.5;
    current = await step(plusMinutes(when, minute), () => answerPlacement(actor(), view.attemptId, question.itemId, optionId));
  }
  const result = await step(plusMinutes(when, minute + 1), () => completePlacement(actor(), view.attemptId, { SPEAKING: "B1", WRITING: "A2" }));
  await step(plusMinutes(when, minute + 2), () => upsertLearnerProfile(actor(), { goal: PROFILE.goal, minutesPerDay: PROFILE.minutesPerDay, cefrLevel: result.overall, levelSource: "PLACEMENT", placementScore: result.correct, placementTotal: result.total, skillLevels: { ...result.skills, ...result.selfAssessed } }));
  return result;
}

async function nextLesson(when: Date, level: string, accuracy = 0.78) {
  const [lessons, completed] = await Promise.all([listPathLessons(), listCompletedLessonIds(actor())]);
  const lesson = nextInPath(lessons, completed, level);
  if (!lesson) return;
  const scoring = await getLessonQuestionSetForScoring(lesson.id);
  const answers = (scoring?.questions ?? []).map((question) => ({ questionId: question.id, selectedOptionId: chance(accuracy) ? question.correctOptionId : pick(question.options.filter((option) => option.id !== question.correctOptionId)).id }));
  await step(plusMinutes(when, lesson.estimatedMinutes), () => completeLesson({ lessonId: lesson.id, actor: actor(), answers }));
}

async function takeExam(slug: string, when: Date, minutes: number, accuracy: number) {
  const started = await step(when, () => startOrResumeExam(slug, actor()));
  const rows = await db!.select({ id: schema.questions.id, type: schema.questions.type, content: schema.questions.content, answer: schema.questions.answer, explanation: schema.questions.explanation })
    .from(schema.questions).innerJoin(schema.examParts, eq(schema.questions.examPartId, schema.examParts.id))
    .where(and(eq(schema.examParts.examId, started.exam.id), eq(schema.questions.status, "PUBLISHED"))).orderBy(schema.questions.id);
  // Learners leave a few questions blank under time pressure.
  const answers = rows.filter(() => !chance(0.04)).map((row) => ({ questionId: row.id, response: respond(row, accuracy) }));
  // Submit before the timer runs out, or the engine would expire the attempt and drop the answers.
  const taken = Math.min(minutes, started.exam.durationSeconds / 60 - 2);
  await step(plusMinutes(when, taken), () => submitExamAttempt(started.attempt.id, actor(), answers));
}

const vocabularyDeck: string[] = [];
async function studyVocabulary(when: Date, newWords: number) {
  const scheduled = await db!.select({ id: schema.vocabularyReviews.vocabularyId }).from(schema.vocabularyReviews).where(eq(schema.vocabularyReviews.learnerId, learnerId));
  const known = new Set(scheduled.map((row) => row.id));
  const fresh = vocabularyDeck.filter((id) => !known.has(id)).slice(0, newWords);
  for (const id of fresh) await step(when, () => addToWordbook(actor(), id, when));
  const due = await db!.select({ id: schema.vocabularyReviews.vocabularyId }).from(schema.vocabularyReviews).where(and(eq(schema.vocabularyReviews.learnerId, learnerId), dsql`${schema.vocabularyReviews.dueAt} <= ${when.toISOString()}`)).orderBy(schema.vocabularyReviews.dueAt, schema.vocabularyReviews.vocabularyId).limit(16);
  let second = 0;
  for (const { id } of due) {
    second += 20 + Math.floor(random() * 25);
    const reviewedAt = new RealDate(when.getTime() + second * 1000);
    const roll = random();
    const rating = roll < 0.07 ? "AGAIN" : roll < 0.22 ? "HARD" : roll < 0.88 ? "GOOD" : "EASY";
    await step(reviewedAt, () => recordVocabularyReview({ actor: actor(), vocabularyId: id, rating, eventId: `demo-${id}-${reviewedAt.getTime()}`, now: reviewedAt }));
  }
}

async function practiseMistakes(when: Date, count: number) {
  const open = await listOpenMistakes(actor());
  const fixed = open.slice(0, count).map((mistake) => mistake.questionId);
  if (fixed.length) await step(when, () => resolveMistakes(actor(), fixed));
}

type CapturedFeedback = { note: string; items: Record<string, { provider: string; model: string | null; capturedAt: string; feedback: WritingFeedback | SpeakingFeedback }> };
const captured: CapturedFeedback = existsSync(FEEDBACK_PATH) ? JSON.parse(readFileSync(FEEDBACK_PATH, "utf8")) as CapturedFeedback : { note: "", items: {} };

async function topicBySlug(slug: string) {
  const [topic] = await db!.select({ id: schema.topics.id, content: schema.topics.content }).from(schema.topics).where(and(eq(schema.topics.slug, slug), eq(schema.topics.status, "PUBLISHED")));
  if (!topic) throw new Error(`Topic ${slug} is not published; run pnpm demo:prepare or publish the topics batch first.`);
  return topic as { id: string; content: { prompt?: string; cueCard?: { topic: string }; part3?: string[] } };
}

async function writeAndGetFeedback(work: (typeof writingWork)[number]) {
  const topic = await topicBySlug(work.topicSlug);
  let submissionId: string | undefined;
  for (const [index, text] of work.revisions.entries()) {
    const when = at(work.dayOffset + index, "20:15");
    const saved = await step(when, () => saveWritingSubmission(actor(), { submissionId, topicId: topic.id, taskType: work.taskType, promptText: topic.content.prompt ?? "", text, action: "SUBMIT", examType: "IELTS" }));
    submissionId = saved.id;
    const entry = captured.items[`${work.key}:${index}`];
    if (!entry) { console.warn(`  no captured feedback for ${work.key} revision ${index + 1}; run with --capture-feedback`); continue; }
    await step(plusMinutes(when, 1), () => saveWritingFeedback(actor(), { submissionId: submissionId!, feedback: entry.feedback as WritingFeedback, provider: entry.provider, model: entry.model }));
  }
}

async function speak(work: (typeof speakingWork)[number]) {
  const topic = await topicBySlug(work.topicSlug);
  const prompt = work.part === "part2" ? topic.content.cueCard!.topic : topic.content.part3![Number(work.part.split(":")[1])]!;
  const started = at(work.dayOffset, "07:10");
  const completed = plusMinutes(started, work.durationMs / 60_000 + 1);
  const entry = captured.items[work.key];
  if (!entry) console.warn(`  no captured feedback for ${work.key}; run with --capture-feedback`);
  const sessionId = crypto.randomUUID();
  await db!.insert(schema.speakingSessions).values({ id: sessionId, learnerId, examType: "IELTS", topicId: topic.id, part: work.part, prompt, status: "COMPLETED", createdAt: started, completedAt: completed });
  await db!.insert(schema.speakingTurns).values({ id: crypto.randomUUID(), sessionId, turnOrder: 1, prompt, transcript: work.transcript, audioMediaId: null, durationMs: work.durationMs, feedback: entry?.feedback ?? null, createdAt: completed });
  await appendProgressEvent({ learnerId, type: "SPEAKING_COMPLETED", skill: "SPEAKING", sourceType: "SPEAKING_SESSION", sourceId: sessionId, idempotencyKey: `speaking:${sessionId}:completed`, metadata: { durationMs: work.durationMs }, occurredAt: completed });
}

/** Asks the app's AI pipeline for feedback on any learner work that has none recorded yet. */
async function captureMissingFeedback() {
  const { HttpWritingService } = await import("../../../apps/web/src/modules/ai-writing/writing-service");
  const { createSpeakingFeedback } = await import("../../../apps/web/src/modules/ai-speaking/speaking-service");
  const { isGeminiConfigured } = await import("../../../apps/web/src/modules/ai-foundation/gemini-provider");
  if (!isGeminiConfigured()) throw new Error("--capture-feedback needs GEMINI_API_KEY in apps/web/.env.local");
  const model = process.env.GEMINI_MODEL?.trim() || null;
  const save = (key: string, feedback: WritingFeedback | SpeakingFeedback) => {
    captured.items[key] = { provider: "gemini", model, capturedAt: new RealDate().toISOString(), feedback };
    captured.note = "Feedback produced by the app's own AI pipeline on scripts/seed/demo-account/learner-work.ts, captured with `pnpm seed:demo-account -- --capture-feedback`.";
    writeFileSync(FEEDBACK_PATH, JSON.stringify(captured, null, 2) + "\n");
    console.log(`  captured feedback for ${key}`);
  };
  for (const work of writingWork) {
    const topic = await topicBySlug(work.topicSlug);
    for (const [index, text] of work.revisions.entries()) {
      const key = `${work.key}:${index}`;
      if (captured.items[key]) continue;
      const evaluation = await new HttpWritingService(actor()).evaluate({ promptId: topic.id, taskType: work.taskType, text, language: "en", expectedMinimumWords: work.taskType === "IELTS_TASK_2" ? 250 : 150 });
      if (!evaluation.feedback || evaluation.feedback.rubricDisclaimer.startsWith("Offline")) throw new Error(`Gemini did not return feedback for ${key}; try again later.`);
      save(key, evaluation.feedback);
    }
  }
  for (const work of speakingWork) {
    if (captured.items[work.key]) continue;
    const topic = await topicBySlug(work.topicSlug);
    const prompt = work.part === "part2" ? topic.content.cueCard!.topic : topic.content.part3![Number(work.part.split(":")[1])]!;
    const feedback = await createSpeakingFeedback(actor(), { prompt, transcript: work.transcript, feedbackLanguage: "vi" });
    if (feedback.disclaimer.startsWith("Offline")) throw new Error(`Gemini did not return feedback for ${work.key}; try again later.`);
    save(work.key, feedback);
  }
}

// ---------------------------------------------------------------------------------------------
// Three weeks of study
// ---------------------------------------------------------------------------------------------

async function main() {
  await db!.insert(schema.users).values({ id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email, emailVerified: at(-21, "09:00") })
    .onConflictDoUpdate({ target: schema.users.id, set: { name: DEMO_USER.name, email: DEMO_USER.email } });
  // Start from scratch: removing the learner cascades to all of its history.
  const links = await db!.select({ learnerId: schema.learnerLinks.learnerId }).from(schema.learnerLinks).where(and(eq(schema.learnerLinks.kind, "USER"), eq(schema.learnerLinks.externalId, DEMO_USER.id)));
  if (links.length) await db!.delete(schema.learners).where(inArray(schema.learners.id, links.map((link) => link.learnerId)));
  learnerId = await createLinkedLearner(db!, "USER", DEMO_USER.id);
  await backdate(at(-20, "20:00"));

  if (CAPTURE) await captureMissingFeedback();

  const words = await db!.select({ id: schema.vocabulary.id }).from(schema.vocabulary).where(and(eq(schema.vocabulary.status, "PUBLISHED"), inArray(schema.vocabulary.cefrLevel, ["B1"]))).orderBy(schema.vocabulary.headword);
  vocabularyDeck.push(...words.map((word) => word.id).sort(() => random() - 0.5));

  const placement = await takePlacement(at(-20, "20:02"));
  const level = placement.overall;
  console.log(`  placement: ${placement.correct}/${placement.total} correct, level ${level}`);

  // Day offsets from today. The learner skipped day -17, so the current streak starts at -16.
  type Plan = { lesson?: boolean; words?: number; exam?: [slug: string, minutes: number, accuracy: number]; mistakes?: number };
  const days: Record<number, Plan> = {
    [-20]: { lesson: true, words: 5 },
    [-19]: { lesson: true, words: 5 },
    [-18]: { exam: ["ielts-practice-test-1", 25, 0.6], words: 4 },
    [-16]: { lesson: true, words: 5 },
    [-15]: { lesson: true, words: 4 },
    [-14]: { exam: ["ielts-listening-test-1", 32, 0.58], words: 4 },
    [-13]: { lesson: true, words: 5 },
    [-12]: { words: 3 },
    [-11]: { lesson: true },
    [-10]: { exam: ["toeic-part-5-practice", 14, 0.72], words: 5 },
    [-9]: { lesson: true, words: 4, mistakes: 8 },
    [-8]: { words: 4 },
    [-7]: { exam: ["ielts-reading-test-1", 58, 0.62] },
    [-6]: { lesson: true, words: 5 },
    [-5]: { words: 3, mistakes: 6 },
    [-4]: { exam: ["toeic-mini-test-1", 22, 0.68], words: 4 },
    [-3]: { lesson: true, words: 3 },
    [-2]: { exam: ["ielts-listening-test-1", 30, 0.72], words: 4, mistakes: 10 },
    [-1]: { lesson: true, words: 5, mistakes: 4 }
  };
  for (const offset of Object.keys(days).map(Number).sort((a, b) => a - b)) {
    const plan = days[offset]!;
    const weekend = [0, 6].includes(at(offset, "12:00").getUTCDay());
    const start = offset === -20 ? at(offset, "20:30") : at(offset, weekend ? "09:20" : `${19 + Math.floor(random() * 2)}:${String(10 + Math.floor(random() * 40)).padStart(2, "0")}`);
    if (plan.exam) await takeExam(plan.exam[0], start, plan.exam[1], plan.exam[2]);
    if (plan.lesson) await nextLesson(plusMinutes(start, plan.exam ? plan.exam[1] + 5 : 0), level);
    if (plan.words) await studyVocabulary(plusMinutes(start, 30), plan.words);
    if (plan.mistakes) await practiseMistakes(plusMinutes(start, 45), plan.mistakes);
  }
  for (const work of writingWork) await writeAndGetFeedback(work);
  for (const work of speakingWork) await speak(work);
  await db!.update(schema.learners).set({ lastSeenAt: at(-1, "21:30") }).where(eq(schema.learners.id, learnerId));

  const [summary] = await db!.execute<{ events: number; lessons: number; exams: number; words: number; open_mistakes: number; due: number }>(dsql`
    SELECT (SELECT count(*) FROM progress_events WHERE learner_id = ${learnerId})::int AS events,
           (SELECT count(*) FROM lesson_completions WHERE learner_id = ${learnerId})::int AS lessons,
           (SELECT count(*) FROM attempts WHERE learner_id = ${learnerId})::int AS exams,
           (SELECT count(*) FROM vocabulary_reviews WHERE learner_id = ${learnerId})::int AS words,
           (SELECT count(*) FROM mistakes WHERE learner_id = ${learnerId} AND resolved_at IS NULL)::int AS open_mistakes,
           (SELECT count(*) FROM vocabulary_reviews WHERE learner_id = ${learnerId} AND due_at <= now())::int AS due`);
  const future = await db!.select({ id: schema.progressEvents.id }).from(schema.progressEvents).where(and(eq(schema.progressEvents.learnerId, learnerId), dsql`${schema.progressEvents.occurredAt} >= ${at(0, "00:00").toISOString()}`));
  if (future.length) throw new Error(`${future.length} demo events landed today or later; the history must end yesterday.`);
  console.log(`Seeded demo account ${DEMO_USER.email}: ${summary!.events} activities, ${summary!.lessons} lessons, ${summary!.exams} exams, ${summary!.words} words (${summary!.due} due today), ${summary!.open_mistakes} open mistakes.`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.stack ?? error.message : error); process.exitCode = 1; }).finally(() => process.exit());
