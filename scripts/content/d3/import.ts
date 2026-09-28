/**
 * Imports content pack D3 (`pnpm content:d3:import`).
 *
 *   --check     run the quality gate only
 *   --only a,b  import only these batches (lessons, grammar, vocabulary, toeic, ielts)
 *
 * The quality gate runs first; any issue stops the import. New and changed items are
 * written as DRAFT and their batch is moved to REVIEW, ready for the spot review. Items of
 * a batch that is already PUBLISHED are updated in place and stay published. Items removed
 * from the pack are archived, not deleted, so learner attempts keep their questions.
 */
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { buildQuestionFromAuthoring, parseAuthoredQuestion } from "@english4free/content-schemas";
import { contentBatches, courseLevels, courseUnits, courses, examParts, exams, lessonBlocks, lessons, passages, practicePrompts, questions, vocabulary } from "../../../apps/web/src/db/schema";
import { D3_VERSION, d3Batches, d3Exams, d3Lessons, d3Prompts, d3Vocabulary } from "../../../content/packs/d3";
import { arrangeLessonOptions, type BatchKey, type ExamDef, type LessonBlock, type LessonDef } from "../../../content/packs/d3/types";
import { checkExams, checkLessons, checkPrompts, checkVocabulary, type GateIssue } from "./quality-gate";
import { batchId, connect, d3Id, D3_COURSE_ID } from "./shared";

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const only = new Set((args.find((arg) => arg.startsWith("--only="))?.slice(7) ?? "lessons,grammar,vocabulary,toeic,ielts").split(",") as BatchKey[]);
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");

export function runQualityGate() {
  const vocabularyEntries = d3Vocabulary();
  const issues: GateIssue[] = [...checkLessons(d3Lessons), ...checkExams(d3Exams), ...checkPrompts(d3Prompts), ...checkVocabulary(vocabularyEntries)];
  return { issues, vocabularyEntries };
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

async function main() {
  const { issues, vocabularyEntries } = runQualityGate();
  const counts = { lessons: d3Lessons.length, exams: d3Exams.length, questions: d3Exams.reduce((sum, exam) => sum + exam.parts.reduce((inner, part) => inner + part.groups.reduce((g, group) => g + group.questions.length, 0), 0), 0), prompts: d3Prompts.length, vocabulary: vocabularyEntries.length };
  console.log(`D3 pack: ${counts.lessons} lessons · ${counts.exams} exams (${counts.questions} questions) · ${counts.prompts} prompts · ${counts.vocabulary} vocabulary`);
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
      const statusOf = new Map<BatchKey, string>();
      for (const key of only) {
        const batch = d3Batches[key];
        const [existing] = await tx.select({ status: contentBatches.status }).from(contentBatches).where(eq(contentBatches.id, batchId(key)));
        const status = existing?.status === "PUBLISHED" || existing?.status === "APPROVED" ? existing.status : "REVIEW";
        statusOf.set(key, status);
        await tx.insert(contentBatches).values({ id: batchId(key), source: batch.source, license: batch.license, author: "English 4 Free", generatedBy: batch.generatedBy, importedAt: now, version: D3_VERSION, status }).onConflictDoUpdate({ target: contentBatches.id, set: { source: batch.source, license: batch.license, generatedBy: batch.generatedBy, importedAt: now, version: D3_VERSION, status } });
      }
      const itemStatus = (key: BatchKey) => statusOf.get(key) === "PUBLISHED" ? "PUBLISHED" as const : "DRAFT" as const;

      // Lessons live in one CEFR course; each level gets its units in authoring order.
      const lessonDefs = d3Lessons.filter((lesson) => only.has(lesson.batch));
      if (lessonDefs.length) {
        const courseBatch = only.has("lessons") ? "lessons" : "grammar";
        const [course] = await tx.select({ status: courses.status }).from(courses).where(eq(courses.id, D3_COURSE_ID));
        await tx.insert(courses).values({ id: D3_COURSE_ID, slug: "e4f-cefr-path", title: "English 4 Free CEFR path", description: "Grammar topics and skill lessons from A1 to C2.", status: course?.status ?? "DRAFT", contentBatchId: batchId(courseBatch) }).onConflictDoNothing();
        for (const [index, level] of LEVELS.entries()) await tx.insert(courseLevels).values({ id: d3Id(`level:${level}`), courseId: D3_COURSE_ID, cefrLevel: level, sortOrder: index + 1, title: level }).onConflictDoNothing();
        const units = new Map<string, number>();
        for (const lesson of lessonDefs) if (!units.has(`${lesson.level}|${lesson.unit}`)) units.set(`${lesson.level}|${lesson.unit}`, units.size + 1);
        for (const [key, sortOrder] of units) {
          const [level, title] = key.split("|") as [string, string];
          await tx.insert(courseUnits).values({ id: d3Id(`unit:${key}`), courseLevelId: d3Id(`level:${level}`), slug: slugify(title), title, sortOrder }).onConflictDoUpdate({ target: courseUnits.id, set: { title, sortOrder } });
        }
        for (const [order, lesson] of lessonDefs.entries()) {
          const lessonId = d3Id(`lesson:${lesson.key}`);
          const createdAt = new Date(Date.UTC(2026, 8, 28) + order * 1000);
          await tx.insert(lessons).values({ id: lessonId, unitId: d3Id(`unit:${lesson.level}|${lesson.unit}`), slug: lesson.slug, title: lesson.title, skill: lesson.skill, estimatedMinutes: lesson.minutes, status: itemStatus(lesson.batch), contentBatchId: batchId(lesson.batch), createdAt }).onConflictDoUpdate({ target: lessons.id, set: { unitId: d3Id(`unit:${lesson.level}|${lesson.unit}`), slug: lesson.slug, title: lesson.title, skill: lesson.skill, estimatedMinutes: lesson.minutes, status: itemStatus(lesson.batch), createdAt, updatedAt: now } });
          const rows = lesson.blocks.map((block, index) => lessonBlockRow(lesson, block, index));
          for (const [index, row] of rows.entries()) await tx.insert(lessonBlocks).values({ ...row, lessonId, sortOrder: index + 1, schemaVersion: 1 }).onConflictDoUpdate({ target: lessonBlocks.id, set: { type: row.type, content: row.content, sortOrder: index + 1 } });
          await tx.delete(lessonBlocks).where(and(eq(lessonBlocks.lessonId, lessonId), notInArray(lessonBlocks.id, rows.map((row) => row.id))));
        }
        const keep = lessonDefs.map((lesson) => d3Id(`lesson:${lesson.key}`));
        await tx.update(lessons).set({ status: "ARCHIVED" }).where(and(inArray(lessons.contentBatchId, [...only].filter((key) => key === "lessons" || key === "grammar").map(batchId)), notInArray(lessons.id, keep)));
      }

      // Exams: parts, passages (reading texts and listening recordings) and questions.
      for (const exam of d3Exams.filter((item) => only.has(item.batch))) {
        const examId = d3Id(`exam:${exam.key}`);
        await tx.insert(exams).values({ id: examId, slug: exam.slug, title: exam.title, type: exam.type, mode: exam.mode, durationSeconds: exam.durationSeconds, metadata: { pack: D3_VERSION }, status: itemStatus(exam.batch), contentBatchId: batchId(exam.batch) }).onConflictDoUpdate({ target: exams.id, set: { slug: exam.slug, title: exam.title, mode: exam.mode, durationSeconds: exam.durationSeconds, status: itemStatus(exam.batch), updatedAt: now } });
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
              const values = { passageId, type: stored.type, content: stored.content, answer: stored.answer, explanation: question.explanation, tags: [exam.type.toLowerCase(), `part-${part.partNumber}`, "d3"], status: itemStatus(exam.batch), createdAt, updatedAt: now };
              await tx.insert(questions).values({ id, examPartId: partId, schemaVersion: 1, contentBatchId: batchId(exam.batch), ...values }).onConflictDoUpdate({ target: questions.id, set: values });
            }
          }
          await tx.update(questions).set({ status: "ARCHIVED" }).where(and(eq(questions.examPartId, partId), questionIds.length ? notInArray(questions.id, questionIds) : undefined));
          if (passageIds.length) await tx.delete(passages).where(and(eq(passages.examPartId, partId), notInArray(passages.id, passageIds)));
        }
      }

      if (only.has("ielts")) {
        for (const prompt of d3Prompts) {
          const values = { slug: prompt.slug, kind: prompt.kind, title: prompt.title, content: prompt.content, sortOrder: prompt.sortOrder, status: itemStatus("ielts"), updatedAt: now };
          await tx.insert(practicePrompts).values({ id: d3Id(`prompt:${prompt.key}`), contentBatchId: batchId("ielts"), ...values }).onConflictDoUpdate({ target: practicePrompts.id, set: values });
        }
      }

      if (only.has("vocabulary")) {
        for (const entry of vocabularyEntries) {
          const attribution = { ipaUs: entry.ipaUs, sense: entry.sense, sources: { ...entry.sources, example: { name: "English 4 Free", url: "https://github.com/nvtquang/eng4free", license: "English 4 Free original content" } } };
          const values = { ipa: entry.ipa, meaning: entry.meaningVi, example: entry.example!, tags: ["d3", entry.level.toLowerCase(), entry.pos], attribution, status: itemStatus("vocabulary"), contentBatchId: batchId("vocabulary"), updatedAt: now };
          await tx.insert(vocabulary).values({ id: d3Id(`vocabulary:${entry.headword}:${entry.pos}:${entry.level}`), headword: entry.headword, partOfSpeech: entry.pos, cefrLevel: entry.level, ...values }).onConflictDoUpdate({ target: [vocabulary.headword, vocabulary.partOfSpeech, vocabulary.cefrLevel], set: values });
        }
      }
    });
    console.log(`Imported ${[...only].join(", ")}. Batches are in REVIEW unless already approved or published.`);
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.replace(/\\/gu, "/").endsWith("scripts/content/d3/import.ts")) main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
