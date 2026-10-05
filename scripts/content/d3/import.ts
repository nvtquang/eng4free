/**
 * Imports content pack D3 (`pnpm content:d3:import`).
 *
 *   --check     run the quality gate only
 *   --only a,b  import only these batches (lessons, grammar, toeic, ielts, topics, pronunciation, placement)
 *               The vocabulary is not in the pack: it lives in PostgreSQL (pnpm vocab:check, /admin/vocabulary).
 *
 * Review rules, the same for every batch:
 * - The quality gate runs first; any issue stops the import.
 * - A new item is always written as DRAFT, even in a batch that is already published.
 * - Each item's authored definition is hashed (content_item_hashes). A batch that has any
 *   item whose hash differs from the last published hash (new or edited) moves to REVIEW
 *   and needs approval again; `content:d3:publish` then releases its DRAFT items.
 * - An edit to an already-published item is applied in place (there is no versioning) and
 *   is listed as "changed since last publish" at the top of the review sheet.
 * - Items removed from the pack are archived, not deleted, so learner history keeps working.
 */
import { createHash } from "node:crypto";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { buildQuestionFromAuthoring, parseAuthoredQuestion } from "@english4free/content-schemas";
import { contentBatches, contentItemHashes, courseLevels, courseUnits, courses, examParts, exams, lessonBlocks, lessons, passages, placementItems, pronunciationItems, questions, speakingSessions, topicCategories, topics, writingSubmissions } from "../../../apps/web/src/db/schema";
import { D3_VERSION, d3Batches, d3Exams, d3Lessons, d3Placement, d3Prompts, d3Pronunciation, d3SelfAssessment, d3TopicCategories } from "../../../content/packs/d3";
import { arrangeLessonOptions, type BatchKey, type ExamDef, type LessonBlock, type LessonDef } from "../../../content/packs/d3/types";
import { checkExams, checkLessons, checkPlacement, checkPrompts, checkPronunciation, checkPronunciationSet, checkTopics, type GateIssue } from "./quality-gate";
import { batchId, connect, d3Id, D3_COURSE_ID } from "./shared";

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const ALL_BATCHES = Object.keys(d3Batches) as BatchKey[];
const only = new Set((args.find((arg) => arg.startsWith("--only="))?.slice(7).split(",") ?? ALL_BATCHES) as BatchKey[]);
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
const hashOf = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** Old free-text ids of speaking/writing history, mapped to the topic that replaced them. */
const legacyTopicSlugs: Record<string, string> = {
  "local-speaking-skill": "speak-useful-skill",
  "ielts-part1-skill": "speak-useful-skill",
  "local-general-opinion": "write-improve-neighbourhood"
};

export function runQualityGate() {
  const issues: GateIssue[] = [...checkLessons(d3Lessons), ...checkExams(d3Exams), ...checkPrompts(d3Prompts), ...checkTopics(d3TopicCategories), ...checkPronunciation(d3Pronunciation), ...checkPronunciationSet(d3Pronunciation), ...checkPlacement(d3Placement, d3SelfAssessment)];
  return { issues };
}

function lessonBlockRow(lesson: LessonDef, block: LessonBlock, index: number) {
  const id = d3Id(`lesson-block:${lesson.key}:${index}`);
  switch (block.kind) {
    case "text": return { id, type: "RICH_TEXT" as const, content: { heading: block.heading, body: block.body } };
    case "grammar": return { id, type: "GRAMMAR" as const, content: { heading: block.heading, body: block.body } };
    case "pronunciation": return { id, type: "PRONUNCIATION" as const, content: { heading: block.heading, body: block.body } };
    case "listening": return { id, type: "MEDIA" as const, content: { heading: block.heading, transcript: block.script, playbackText: block.script, ...(block.voices ? { audioVoices: block.voices } : {}), sourceLabel: "English 4 Free original script · audio: Piper TTS (VCTK / LibriTTS-R voices, CC BY 4.0)" } };
    case "practice": return { id, type: "QUESTION_SET" as const, content: { instruction: block.instruction, questions: block.questions.map((question, number) => { const arranged = arrangeLessonOptions(`${lesson.key}:${index}`, question, number); return { id: d3Id(`lesson-question:${lesson.key}:${index}:${number}`), prompt: question.q, options: arranged.options.map((text, option) => ({ id: "abcdefgh"[option]!, text })), correctOptionId: "abcdefgh"[arranged.answer]!, explanation: question.why }; }) } };
  }
}

function storedQuestion(exam: ExamDef, question: ExamDef["parts"][number]["groups"][number]["questions"][number], at: string) {
  const built = buildQuestionFromAuthoring(question.authoring);
  if (!built.success) throw new Error(`${at}: ${built.error}`);
  const content = { ...built.data.content, ...(question.image ? { image: question.image } : {}), ...(question.audio ? { playbackText: question.audio, maxPlays: question.maxPlays ?? (exam.mode === "PRACTICE" ? 2 : 1) } : {}) };
  return parseAuthoredQuestion({ type: built.data.type, content, answer: built.data.answer });
}

/** Keeps an item's status on re-import, except that an archived item returning to the pack becomes a draft again. */
const keepStatus = (column: AnyPgColumn) => sql`CASE WHEN ${column} = 'ARCHIVED' THEN 'DRAFT'::content_status ELSE ${column} END`;

async function main() {
  const { issues } = runQualityGate();
  const topicCount = d3TopicCategories.reduce((sum, category) => sum + category.topics.length, 0);
  const counts = { lessons: d3Lessons.length, exams: d3Exams.length, questions: d3Exams.reduce((sum, exam) => sum + exam.parts.reduce((inner, part) => inner + part.groups.reduce((g, group) => g + group.questions.length, 0), 0), 0), prompts: d3Prompts.length };
  console.log(`D3 pack: ${counts.lessons} lessons · ${counts.exams} exams (${counts.questions} questions) · ${counts.prompts} IELTS tasks · ${topicCount} topics · ${d3Pronunciation.length} pronunciation items`);
  if (issues.length) {
    console.log(`Quality gate: ${issues.length} issue(s)`);
    for (const issue of issues.slice(0, 80)) console.log(`  ✗ ${issue.item}: ${issue.problem}`);
    process.exitCode = 1;
    return;
  }
  console.log("Quality gate: passed");
  if (CHECK) return;

  const { client, db } = connect();
  const now = new Date();
  try {
    await db.transaction(async (tx) => {
      const batches = [...only];
      // Batch rows must exist before items reference them; their final status is decided at the end.
      for (const key of batches) {
        const batch = d3Batches[key];
        await tx.insert(contentBatches).values({ id: batchId(key), source: batch.source, license: batch.license, author: "English 4 Free", generatedBy: batch.generatedBy, importedAt: now, version: D3_VERSION, status: "REVIEW" }).onConflictDoNothing();
      }
      const known = new Map((await tx.select().from(contentItemHashes).where(inArray(contentItemHashes.batchId, batches.map(batchId)))).map((row) => [row.itemKey, row]));
      const dirty = new Set<BatchKey>();
      const pending: Array<{ itemKey: string; batch: BatchKey; hash: string; publishedHash: string | null }> = [];

      /**
       * Records an item's hash. `existing` is the row's status before this import (undefined for a new row).
       * Items that existed before hashes were tracked are taken as their current state: published
       * rows count as already published, so introducing hashes does not force a full re-review.
       */
      const track = (itemKey: string, batch: BatchKey, definition: unknown, existing: string | undefined) => {
        const hash = hashOf(definition);
        const previous = known.get(itemKey);
        const publishedHash = previous ? previous.publishedHash : existing === "PUBLISHED" ? hash : null;
        if (hash !== publishedHash) dirty.add(batch);
        pending.push({ itemKey, batch, hash, publishedHash });
      };
      /** Current status of existing rows, by id (missing ids are new rows). */
      const statusesOf = async (table: typeof lessons | typeof exams | typeof topics | typeof topicCategories | typeof pronunciationItems | typeof placementItems, ids: string[]) => {
        if (!ids.length) return new Map<string, string>();
        const rows = await tx.select({ id: table.id, status: table.status }).from(table).where(inArray(table.id, ids));
        return new Map(rows.map((row) => [row.id, row.status]));
      };

      // Lessons live in one CEFR course; each level gets its units in authoring order.
      const lessonDefs = d3Lessons.filter((lesson) => only.has(lesson.batch));
      if (lessonDefs.length) {
        const courseBatch = only.has("lessons") ? "lessons" : "grammar";
        await tx.insert(courses).values({ id: D3_COURSE_ID, slug: "e4f-cefr-path", title: "English 4 Free CEFR path", description: "Grammar topics and skill lessons from A1 to C2.", status: "DRAFT", contentBatchId: batchId(courseBatch) }).onConflictDoNothing();
        for (const [index, level] of LEVELS.entries()) await tx.insert(courseLevels).values({ id: d3Id(`level:${level}`), courseId: D3_COURSE_ID, cefrLevel: level, sortOrder: index + 1, title: level }).onConflictDoNothing();
        const units = new Map<string, number>();
        for (const lesson of lessonDefs) if (!units.has(`${lesson.level}|${lesson.unit}`)) units.set(`${lesson.level}|${lesson.unit}`, units.size + 1);
        for (const [key, sortOrder] of units) {
          const [level, title] = key.split("|") as [string, string];
          await tx.insert(courseUnits).values({ id: d3Id(`unit:${key}`), courseLevelId: d3Id(`level:${level}`), slug: slugify(title), title, sortOrder }).onConflictDoUpdate({ target: courseUnits.id, set: { title, sortOrder } });
        }
        const existing = await statusesOf(lessons, lessonDefs.map((lesson) => d3Id(`lesson:${lesson.key}`)));
        for (const [order, lesson] of lessonDefs.entries()) {
          const lessonId = d3Id(`lesson:${lesson.key}`);
          track(`lesson:${lesson.key}`, lesson.batch, lesson, existing.get(lessonId));
          const createdAt = new Date(Date.UTC(2026, 8, 28) + order * 1000);
          const fields = { unitId: d3Id(`unit:${lesson.level}|${lesson.unit}`), slug: lesson.slug, title: lesson.title, skill: lesson.skill, estimatedMinutes: lesson.minutes, contentBatchId: batchId(lesson.batch), createdAt };
          await tx.insert(lessons).values({ id: lessonId, ...fields, status: "DRAFT" }).onConflictDoUpdate({ target: lessons.id, set: { ...fields, status: keepStatus(lessons.status), updatedAt: now } });
          const rows = lesson.blocks.map((block, index) => lessonBlockRow(lesson, block, index));
          for (const [index, row] of rows.entries()) await tx.insert(lessonBlocks).values({ ...row, lessonId, sortOrder: index + 1, schemaVersion: 1 }).onConflictDoUpdate({ target: lessonBlocks.id, set: { type: row.type, content: row.content, sortOrder: index + 1 } });
          await tx.delete(lessonBlocks).where(and(eq(lessonBlocks.lessonId, lessonId), notInArray(lessonBlocks.id, rows.map((row) => row.id))));
        }
        const keep = lessonDefs.map((lesson) => d3Id(`lesson:${lesson.key}`));
        await tx.update(lessons).set({ status: "ARCHIVED" }).where(and(inArray(lessons.contentBatchId, [...only].filter((key) => key === "lessons" || key === "grammar").map(batchId)), notInArray(lessons.id, keep)));
        // The extra Listening/Reading lessons first had a batch of their own; they now belong to "lessons".
        const legacyExtra = d3Id("batch:skills-extra");
        const stillUsed = await tx.select({ id: lessons.id }).from(lessons).where(eq(lessons.contentBatchId, legacyExtra)).limit(1);
        if (!stillUsed.length) await tx.delete(contentBatches).where(eq(contentBatches.id, legacyExtra));
      }

      // Exams: parts, passages (reading texts and listening recordings) and questions.
      const examDefs = d3Exams.filter((item) => only.has(item.batch));
      const existingExams = await statusesOf(exams, examDefs.map((exam) => d3Id(`exam:${exam.key}`)));
      for (const exam of examDefs) {
        const examId = d3Id(`exam:${exam.key}`);
        track(`exam:${exam.key}`, exam.batch, exam, existingExams.get(examId));
        const fields = { slug: exam.slug, title: exam.title, type: exam.type, mode: exam.mode, durationSeconds: exam.durationSeconds, metadata: { pack: D3_VERSION }, contentBatchId: batchId(exam.batch) };
        await tx.insert(exams).values({ id: examId, ...fields, status: "DRAFT" }).onConflictDoUpdate({ target: exams.id, set: { ...fields, status: keepStatus(exams.status), updatedAt: now } });
        let questionOrder = 0;
        for (const [partIndex, part] of exam.parts.entries()) {
          const partId = d3Id(`part:${exam.key}:${part.partNumber}`);
          const listening = part.skill === "LISTENING";
          await tx.insert(examParts).values({ id: partId, examId, partNumber: part.partNumber, title: part.title, sortOrder: partIndex + 1, instructions: part.instructions, skill: part.skill, metadata: listening ? { mediaKind: "GENERATED_TTS" } : {} }).onConflictDoUpdate({ target: examParts.id, set: { title: part.title, sortOrder: partIndex + 1, instructions: part.instructions, skill: part.skill, metadata: listening ? { mediaKind: "GENERATED_TTS" } : {} } });
          const passageIds: string[] = [];
          const questionIds: string[] = [];
          for (const [groupIndex, group] of part.groups.entries()) {
            let passageId: string | null = null;
            if (group.passage !== undefined || group.listening) {
              passageId = d3Id(`passage:${exam.key}:${part.partNumber}:${groupIndex}`);
              passageIds.push(passageId);
              const metadata = group.listening ? { kind: "LISTENING", playbackLimit: group.listening.playbackLimit ?? (exam.mode === "PRACTICE" ? 2 : 1), ...(group.listening.voices ? { audioVoices: group.listening.voices } : {}), ...(group.image ? { image: group.image } : {}) } : { ...(group.image ? { image: group.image } : {}) };
              const content = group.listening ? group.listening.script : group.passage!;
              await tx.insert(passages).values({ id: passageId, examPartId: partId, title: group.title ?? null, content, sortOrder: groupIndex + 1, metadata }).onConflictDoUpdate({ target: passages.id, set: { title: group.title ?? null, content, sortOrder: groupIndex + 1, metadata } });
            }
            for (const [index, question] of group.questions.entries()) {
              const at = `${exam.slug} part ${part.partNumber} group ${groupIndex + 1} q${index + 1}`;
              const stored = storedQuestion(exam, question, at);
              const id = d3Id(`question:${exam.key}:${part.partNumber}:${groupIndex}:${index}`);
              questionIds.push(id);
              const createdAt = new Date(Date.UTC(2026, 8, 28) + (questionOrder += 1) * 1000);
              const values = { passageId, type: stored.type, content: stored.content, answer: stored.answer, explanation: question.explanation, tags: [exam.type.toLowerCase(), `part-${part.partNumber}`, "d3"], contentBatchId: batchId(exam.batch), createdAt, updatedAt: now };
              await tx.insert(questions).values({ id, examPartId: partId, schemaVersion: 1, ...values, status: "DRAFT" }).onConflictDoUpdate({ target: questions.id, set: { ...values, status: keepStatus(questions.status) } });
            }
          }
          await tx.update(questions).set({ status: "ARCHIVED" }).where(and(eq(questions.examPartId, partId), questionIds.length ? notInArray(questions.id, questionIds) : undefined));
          if (passageIds.length) await tx.delete(passages).where(and(eq(passages.examPartId, partId), notInArray(passages.id, passageIds)));
        }
      }

      // IELTS Writing and Speaking tasks are topics too (no category).
      if (only.has("ielts")) {
        const existing = await statusesOf(topics, d3Prompts.map((prompt) => d3Id(`prompt:${prompt.key}`)));
        for (const prompt of d3Prompts) {
          const id = d3Id(`prompt:${prompt.key}`);
          track(`prompt:${prompt.key}`, "ielts", prompt, existing.get(id));
          const fields = { slug: prompt.slug, kind: prompt.kind, categoryId: null, title: prompt.title, content: prompt.content, sortOrder: prompt.sortOrder, contentBatchId: batchId("ielts") };
          await tx.insert(topics).values({ id, ...fields, status: "DRAFT" }).onConflictDoUpdate({ target: topics.id, set: { ...fields, status: keepStatus(topics.status), updatedAt: now } });
        }
      }

      // Free speaking/writing topics and their categories.
      if (only.has("topics")) {
        const existingCategories = await statusesOf(topicCategories, d3TopicCategories.map((category) => d3Id(category.key)));
        const existingTopics = await statusesOf(topics, d3TopicCategories.flatMap((category) => category.topics.map((topic) => d3Id(topic.key))));
        for (const category of d3TopicCategories) {
          const categoryId = d3Id(category.key);
          const { topics: categoryTopics, ...categoryDefinition } = category;
          track(category.key, "topics", categoryDefinition, existingCategories.get(categoryId));
          const categoryFields = { kind: category.kind, slug: category.slug, title: category.title, note: category.note ?? null, sortOrder: category.sortOrder, contentBatchId: batchId("topics") };
          await tx.insert(topicCategories).values({ id: categoryId, ...categoryFields, status: "DRAFT" }).onConflictDoUpdate({ target: topicCategories.id, set: { ...categoryFields, status: keepStatus(topicCategories.status), updatedAt: now } });
          for (const [order, topic] of categoryTopics.entries()) {
            const topicId = d3Id(topic.key);
            track(topic.key, "topics", { ...topic, category: category.key, order }, existingTopics.get(topicId));
            const fields = { slug: topic.slug, kind: category.kind, categoryId, title: topic.title.en, content: { title: topic.title, prompt: topic.prompt, suggestions: topic.suggestions, advanced: topic.advanced }, sortOrder: order + 1, contentBatchId: batchId("topics") };
            await tx.insert(topics).values({ id: topicId, ...fields, status: "DRAFT" }).onConflictDoUpdate({ target: topics.id, set: { ...fields, status: keepStatus(topics.status), updatedAt: now } });
          }
        }
        const keepTopics = d3TopicCategories.flatMap((category) => category.topics.map((topic) => d3Id(topic.key)));
        await tx.update(topics).set({ status: "ARCHIVED" }).where(and(eq(topics.contentBatchId, batchId("topics")), notInArray(topics.id, keepTopics)));
      }

      // Speaking/writing history recorded before topics existed points at them now.
      if (only.has("topics") || only.has("ielts")) {
        for (const [legacy, slug] of Object.entries(legacyTopicSlugs)) {
          await tx.execute(sql`UPDATE ${speakingSessions} SET topic_id = t.id FROM ${topics} t WHERE ${speakingSessions.topicId} IS NULL AND ${speakingSessions.legacyPromptId} = ${legacy} AND t.slug = ${slug}`);
          await tx.execute(sql`UPDATE ${writingSubmissions} SET topic_id = t.id FROM ${topics} t WHERE ${writingSubmissions.topicId} IS NULL AND ${writingSubmissions.legacyPromptId} = ${legacy} AND t.slug = ${slug}`);
        }
        await tx.execute(sql`UPDATE ${speakingSessions} SET topic_id = t.id FROM ${topics} t WHERE ${speakingSessions.topicId} IS NULL AND ${speakingSessions.legacyPromptId} LIKE 'free-talk:%' AND t.slug = 'speak-' || substring(${speakingSessions.legacyPromptId} from 11)`);
        await tx.execute(sql`UPDATE ${writingSubmissions} SET topic_id = t.id FROM ${topics} t WHERE ${writingSubmissions.topicId} IS NULL AND ${writingSubmissions.legacyPromptId} LIKE 'free-write:%' AND t.slug = 'write-' || substring(${writingSubmissions.legacyPromptId} from 12)`);
        await tx.execute(sql`UPDATE ${writingSubmissions} SET topic_id = t.id FROM ${topics} t WHERE ${writingSubmissions.topicId} IS NULL AND ${writingSubmissions.legacyPromptId} = t.slug`);
        await tx.execute(sql`UPDATE ${speakingSessions} SET topic_id = t.id, part = COALESCE(NULLIF(substring(${speakingSessions.legacyPromptId} from length(t.slug) + 2), ''), 'part2') FROM ${topics} t WHERE ${speakingSessions.topicId} IS NULL AND t.kind = 'IELTS_SPEAKING' AND (${speakingSessions.legacyPromptId} = t.slug OR ${speakingSessions.legacyPromptId} LIKE t.slug || ':%')`);
      }

      if (only.has("pronunciation")) {
        const existing = await statusesOf(pronunciationItems, d3Pronunciation.map((item) => d3Id(item.key)));
        for (const [order, item] of d3Pronunciation.entries()) {
          const id = d3Id(item.key);
          track(item.key, "pronunciation", item, existing.get(id));
          const fields = { kind: item.kind, slug: item.slug, content: item.content, sortOrder: order + 1, contentBatchId: batchId("pronunciation") };
          await tx.insert(pronunciationItems).values({ id, ...fields, status: "DRAFT" }).onConflictDoUpdate({ target: pronunciationItems.id, set: { ...fields, status: keepStatus(pronunciationItems.status), updatedAt: now } });
        }
        await tx.update(pronunciationItems).set({ status: "ARCHIVED" }).where(and(eq(pronunciationItems.contentBatchId, batchId("pronunciation")), notInArray(pronunciationItems.id, d3Pronunciation.map((item) => d3Id(item.key)))));
      }

      if (only.has("placement")) {
        // Auto-scored items keep their answer key in a separate column that is never sent to the browser.
        const rows = [
          ...d3Placement.map((item) => {
            const arranged = arrangeLessonOptions(item.key, { q: item.q, options: item.options, answer: item.answer, why: item.why }, 0);
            const options = arranged.options.map((text, index) => ({ id: "abcd"[index]!, text }));
            const content = { prompt: item.q, options, ...(item.passage ? { passage: item.passage } : {}), ...(item.script ? { playbackText: item.script } : {}) };
            return { key: item.key, definition: item, slug: item.key.replace(/^placement:/u, "placement-").replace(/:/gu, "-"), skill: item.skill, level: item.level, content, answer: { correctOptionId: options[arranged.answer]!.id, explanation: item.why } };
          }),
          ...d3SelfAssessment.map((statement) => {
            const key = `placement:self:${statement.skill.toLowerCase()}:${statement.level.toLowerCase()}`;
            return { key, definition: statement, slug: key.replace(/:/gu, "-"), skill: statement.skill, level: statement.level, content: { canDo: statement.canDo }, answer: {} };
          })
        ];
        const existing = await statusesOf(placementItems, rows.map((row) => d3Id(row.key)));
        for (const [order, row] of rows.entries()) {
          const id = d3Id(row.key);
          track(row.key, "placement", row.definition, existing.get(id));
          const fields = { slug: row.slug, skill: row.skill, cefrLevel: row.level, content: row.content, answer: row.answer, sortOrder: order + 1, contentBatchId: batchId("placement") };
          await tx.insert(placementItems).values({ id, ...fields, status: "DRAFT" }).onConflictDoUpdate({ target: placementItems.id, set: { ...fields, status: keepStatus(placementItems.status), updatedAt: now } });
        }
        await tx.update(placementItems).set({ status: "ARCHIVED" }).where(and(eq(placementItems.contentBatchId, batchId("placement")), notInArray(placementItems.id, rows.map((row) => d3Id(row.key)))));
      }

      // Batch status: any unpublished change (new or edited item) sends the batch back to REVIEW.
      for (const key of only) {
        const batch = d3Batches[key];
        const [current] = await tx.select({ status: contentBatches.status }).from(contentBatches).where(eq(contentBatches.id, batchId(key)));
        // A batch left in REVIEW whose items all match what was published (e.g. an edit was reverted) is published again.
        const tracked = pending.some((item) => item.batch === key);
        const status = dirty.has(key) ? "REVIEW" : tracked && current!.status === "REVIEW" ? "PUBLISHED" : current!.status;
        await tx.update(contentBatches).set({ source: batch.source, license: batch.license, generatedBy: batch.generatedBy, importedAt: now, version: D3_VERSION, status }).where(eq(contentBatches.id, batchId(key)));
      }
      for (const item of pending) {
        await tx.insert(contentItemHashes).values({ itemKey: item.itemKey, batchId: batchId(item.batch), hash: item.hash, publishedHash: item.publishedHash, updatedAt: now }).onConflictDoUpdate({ target: contentItemHashes.itemKey, set: { batchId: batchId(item.batch), hash: item.hash, publishedHash: item.publishedHash, updatedAt: now } });
      }
      const changed = [...dirty];
      console.log(`Imported ${[...only].join(", ")}.`);
      console.log(changed.length ? `Batches with unpublished changes (now in REVIEW): ${changed.join(", ")}` : "No unpublished changes.");
    });
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.replace(/\\/gu, "/").endsWith("scripts/content/d3/import.ts")) main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
