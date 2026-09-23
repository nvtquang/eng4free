import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, isNull } from "drizzle-orm";
import postgres from "postgres";
import { z } from "@english4free/content-schemas";
import { contentBatches, courseLevels, courseUnits, courses, examParts, exams, lessonBlocks, lessons, passages, questions, vocabulary } from "../../apps/web/src/db/schema";

const root = process.cwd();
const sourcePath = resolve(root, "content/incoming/english-4-free-content-pack-v0.1/content-pack-v0.1.json");
const normalizedPath = resolve(root, "content/normalized/english-4-free-content-pack-v0.1/normalization-report.json");
const optionIds = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const statusSchema = z.enum(["draft", "review", "approved", "published", "archived"]);
const nullableUrl = z.string().url().nullable();
const sourceQuestionSchema = z.object({
  id: z.string().min(1), status: statusSchema, content_batch_id: z.string().min(1), question_type: z.string().min(1),
  skill: z.string().min(1), cefr_level: z.string().nullable().optional(), prompt: z.string().min(1), options: z.array(z.string().min(1)).max(8).nullable().optional(),
  answer: z.object({ correct_option_index: z.number().int().nonnegative().optional(), accepted: z.array(z.string().min(1)).optional() }).passthrough(),
  explanation: z.string().min(1), points: z.number().positive(), tags: z.array(z.string().min(1))
}).passthrough();
const sourcePackSchema = z.object({
  pack_version: z.string().min(1), generated_at: z.string().datetime(), license: z.string().min(1),
  provenance: z.object({ source_name: z.string().min(1), source_url: z.string().nullable(), original_or_adapted: z.string().min(1), license_verified_at: z.string().datetime() }),
  records: z.object({
    content_batches: z.array(z.object({ id: z.string().min(1), status: statusSchema, source_type: z.string().min(1), license: z.string().min(1), source_url: nullableUrl, created_at: z.string().datetime(), reviewed_at: z.string().datetime().nullable() }).passthrough()).length(1),
    courses: z.array(z.object({ id: z.string().min(1), slug: z.string().min(1), title: z.string().min(1), track: z.string().min(1), cefr_level: z.string().nullable(), status: statusSchema, description: z.string().nullable(), content_batch_id: z.string().min(1) }).passthrough()),
    course_levels: z.array(z.object({ id: z.string().min(1), course_id: z.string().min(1), cefr_level: z.string().min(2).max(2), position: z.number().int().positive(), title: z.string().min(1) }).passthrough()),
    lessons: z.array(z.object({ id: z.string().min(1), course_id: z.string().min(1), course_level_id: z.string().min(1), slug: z.string().min(1), title: z.string().min(1), lesson_type: z.string().min(1), skill: z.string().min(1), cefr_level: z.string().min(2).max(2), status: statusSchema, position: z.number().int().positive(), summary: z.string().min(1), content_batch_id: z.string().min(1) }).passthrough()),
    lesson_blocks: z.array(z.object({ id: z.string().min(1), lesson_id: z.string().min(1), block_type: z.enum(["text", "example"]), position: z.number().int().positive(), content: z.record(z.string(), z.unknown()) }).passthrough()),
    vocab_cards: z.array(z.object({ id: z.string().min(1), term: z.string().min(1), ipa: z.string().nullable(), part_of_speech: z.string().nullable(), meaning_vi: z.string().min(1), example_en: z.string().nullable(), example_vi: z.string().nullable(), cefr_level: z.string().min(2).max(2), tags: z.array(z.string().min(1)), source_license: z.string().min(1), status: statusSchema, content_batch_id: z.string().min(1) }).passthrough()),
    pronunciation_items: z.array(z.object({ id: z.string().min(1), item_type: z.string().min(1), title: z.string().min(1), script: z.string().min(1), tip: z.string().min(1), audio_url: nullableUrl, source_license: z.string().min(1), status: statusSchema, content_batch_id: z.string().min(1) }).passthrough()),
    passages: z.array(z.object({ id: z.string().min(1), medium: z.string().min(1), cefr_level: z.string().nullable(), exam_type: z.enum(["TOEIC", "IELTS"]).nullable(), title: z.string().min(1), body: z.string().min(1), transcript: z.string().nullable(), audio_url: nullableUrl, status: statusSchema, content_batch_id: z.string().min(1) }).passthrough()),
    questions: z.array(sourceQuestionSchema),
    exams: z.array(z.object({ id: z.string().min(1), slug: z.string().min(1), title: z.string().min(1), exam_type: z.enum(["TOEIC", "IELTS"]), mode: z.string().min(1), status: statusSchema, content_batch_id: z.string().min(1) }).passthrough()),
    exam_parts: z.array(z.object({ id: z.string().min(1), exam_id: z.string().min(1), part_number: z.number().int().positive(), title: z.string().min(1), skill: z.string().min(1), question_ids: z.array(z.string().min(1)), position: z.number().int().positive() }).passthrough())
  }),
  record_counts: z.record(z.string(), z.number().int().nonnegative())
});

type SourcePack = z.infer<typeof sourcePackSchema>;
type SourceQuestion = z.infer<typeof sourceQuestionSchema>;
type ContentStatus = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
const toStatus = (status: z.infer<typeof statusSchema>): ContentStatus => status.toUpperCase() as ContentStatus;
const uuid = (key: string) => {
  const bytes = createHash("sha256").update(`english4free:content-pack-v0.1:${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const isRunnableMcq = (question: SourceQuestion) => question.options !== null && question.options !== undefined && question.answer.correct_option_index !== undefined && question.answer.correct_option_index < question.options.length;
const questionContent = (question: SourceQuestion) => {
  if (!isRunnableMcq(question)) throw new Error(`Question ${question.id} is not compatible with MCQ engine`);
  const options = question.options.map((text, index) => ({ id: optionIds[index], text }));
  return { content: { prompt: question.prompt, options }, answer: { correctOptionId: optionIds[question.answer.correct_option_index!] } };
};
const lessonSkill = (value: string) => value.toUpperCase();

function loadPack(): SourcePack {
  if (!existsSync(sourcePath)) throw new Error(`Content pack source is missing: ${sourcePath}`);
  const parsed = sourcePackSchema.safeParse(JSON.parse(readFileSync(sourcePath, "utf8")));
  if (!parsed.success) throw new Error(`Content pack failed schema validation:\n${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")}`);
  const declaredTotal = parsed.data.record_counts.total;
  const actualTotal = Object.entries(parsed.data.record_counts).filter(([name]) => name !== "total").reduce((total, [, count]) => total + count, 0);
  if (declaredTotal !== 300 || actualTotal !== declaredTotal) throw new Error(`Expected a declared and actual total of 300 records, found declared=${declaredTotal}, actual=${actualTotal}`);
  return parsed.data;
}

function normalize(pack: SourcePack) {
  const batch = pack.records.content_batches[0];
  const questionsById = new Map(pack.records.questions.map((question) => [question.id, question]));
  const partsById = new Map(pack.records.exam_parts.map((part) => [part.id, part]));
  const lessonBlocksByLesson = new Map<string, SourcePack["records"]["lesson_blocks"]>();
  for (const block of pack.records.lesson_blocks) lessonBlocksByLesson.set(block.lesson_id, [...(lessonBlocksByLesson.get(block.lesson_id) ?? []), block]);
  const lessonQuestions = pack.records.questions.filter((question) => /^question_(a1|a2|b1|b2|c1|c2)_lesson_[12]$/.test(question.id) && isRunnableMcq(question));
  const lessonQuestionByLesson = new Map(lessonQuestions.map((question) => [question.id.replace(/^question_(.+)_lesson_([12])$/, "lesson_$1_$2"), question]));
  const runnableExamQuestions = pack.records.exam_parts.flatMap((part) => part.question_ids.map((id) => ({ part, question: questionsById.get(id) }))).filter((entry): entry is { part: SourcePack["records"]["exam_parts"][number]; question: SourceQuestion } => Boolean(entry.question)).filter(({ question }) => isRunnableMcq(question));
  const unsupportedExamQuestions = pack.records.exam_parts.flatMap((part) => part.question_ids.map((id) => ({ partId: part.id, question: questionsById.get(id) }))).filter((entry): entry is { partId: string; question: SourceQuestion } => Boolean(entry.question)).filter(({ question }) => !isRunnableMcq(question));
  const passagePartId = (sourceId: string) => {
    const toeic = /^passage_toeic-p([3467])$/.exec(sourceId);
    if (toeic) return `exam_part_toeic_${toeic[1]}`;
    if (sourceId === "passage_ielts-listen") return "exam_part_ielts_listening";
    if (sourceId === "passage_ielts-read") return "exam_part_ielts_reading";
    return null;
  };
  const importedPassages = pack.records.passages.flatMap((passage) => {
    const partId = passagePartId(passage.id);
    return partId && partsById.has(partId) ? [{ ...passage, partId }] : [];
  });
  const passageByPartId = new Map(importedPassages.map((passage) => [passage.partId, passage]));
  const report = {
    schemaVersion: 1,
    pack: { version: pack.pack_version, generatedAt: pack.generated_at, license: pack.license, sourceName: pack.provenance.source_name },
    ids: { contentBatchId: uuid(`content-batch:${batch.id}`) },
    imported: {
      contentBatches: 1, courses: pack.records.courses.length, courseLevels: pack.records.course_levels.length, generatedCourseUnits: pack.records.course_levels.length,
      lessons: pack.records.lessons.length, lessonBlocks: pack.records.lesson_blocks.length + lessonQuestions.length, vocabulary: pack.records.vocab_cards.length,
      exams: pack.records.exams.length, examParts: pack.records.exam_parts.length, passages: importedPassages.length, questions: runnableExamQuestions.length
    },
    deferred: {
      questions: unsupportedExamQuestions.map(({ partId, question }) => ({ id: question.id, sourceQuestionType: question.question_type, examPartId: partId, reason: "The current Question Engine supports deterministic MCQ only." })),
      practiceQuestions: pack.records.questions.filter((question) => !question.id.includes("_lesson_") && !pack.records.exam_parts.some((part) => part.question_ids.includes(question.id))).map((question) => ({ id: question.id, sourceQuestionType: question.question_type, reason: "No generalized practice-bank relationship exists yet." })),
      passages: pack.records.passages.filter((passage) => !passagePartId(passage.id)).map((passage) => ({ id: passage.id, medium: passage.medium, reason: "The current passage table requires an exam part; this CEFR practice passage has no source question group." })),
      pronunciation: pack.records.pronunciation_items.map((item) => ({ id: item.id, itemType: item.item_type, reason: "No pronunciation-content persistence model exists yet; raw source is retained." })),
      media: pack.records.passages.filter((passage) => passage.medium === "audio" && !passage.audio_url).map((passage) => ({ passageId: passage.id, reason: "No audio asset was supplied. Transcript is preserved for future media attachment/browser TTS." }))
    },
    mappings: { sourceIdStrategy: "Deterministic UUIDv5-like SHA-256 mapping scoped to content-pack-v0.1.", supportedQuestionEngine: "MCQ with correct_option_index", courseUnitSlug: "content-pack-v0.1", exampleBlocks: "Mapped to GRAMMAR rich-text blocks; original English and Vietnamese fields are retained in raw source." }
  };
  return { batch, questionsById, lessonBlocksByLesson, lessonQuestionByLesson, runnableExamQuestions, importedPassages, passageByPartId, report };
}

function writeNormalizedReport(report: ReturnType<typeof normalize>["report"]) {
  mkdirSync(resolve(root, "content/normalized/english-4-free-content-pack-v0.1"), { recursive: true });
  writeFileSync(normalizedPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote normalization report: ${normalizedPath}`);
}

async function importPack(pack: SourcePack, normalized: ReturnType<typeof normalize>) {
  for (const envFile of [resolve(root, "apps/web/.env.local"), resolve(root, ".env")]) if (existsSync(envFile)) process.loadEnvFile(envFile);
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required. Set it in apps/web/.env.local before importing.");
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client);
  const batchId = uuid(`content-batch:${normalized.batch.id}`);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(contentBatches).values({ id: batchId, source: "content/incoming/english-4-free-content-pack-v0.1", license: pack.license, author: pack.provenance.source_name, reviewedBy: "English 4 Free content review", importedAt: new Date(pack.generated_at), version: pack.pack_version, status: "PUBLISHED" }).onConflictDoUpdate({ target: contentBatches.id, set: { license: pack.license, author: pack.provenance.source_name, version: pack.pack_version, status: "PUBLISHED" } });
      for (const course of pack.records.courses) {
        const courseId = uuid(`course:${course.id}`);
        await tx.insert(courses).values({ id: courseId, slug: `content-pack-v01-${course.slug}`, title: course.title, description: course.description, status: toStatus(course.status), contentBatchId: batchId }).onConflictDoUpdate({ target: courses.id, set: { title: course.title, description: course.description, status: toStatus(course.status), contentBatchId: batchId, updatedAt: new Date() } });
      }
      for (const level of pack.records.course_levels) {
        const levelId = uuid(`course-level:${level.id}`);
        await tx.insert(courseLevels).values({ id: levelId, courseId: uuid(`course:${level.course_id}`), cefrLevel: level.cefr_level, sortOrder: level.position, title: level.title }).onConflictDoUpdate({ target: courseLevels.id, set: { title: level.title, sortOrder: level.position } });
        await tx.insert(courseUnits).values({ id: uuid(`course-unit:${level.id}`), courseLevelId: levelId, slug: "content-pack-v0-1", title: "Content Pack v0.1", sortOrder: 1 }).onConflictDoUpdate({ target: courseUnits.id, set: { title: "Content Pack v0.1", sortOrder: 1 } });
      }
      for (const lesson of pack.records.lessons) {
        const lessonId = uuid(`lesson:${lesson.id}`);
        await tx.insert(lessons).values({ id: lessonId, unitId: uuid(`course-unit:${lesson.course_level_id}`), slug: lesson.slug, title: lesson.title, skill: lessonSkill(lesson.skill), estimatedMinutes: 10, status: toStatus(lesson.status), contentBatchId: batchId }).onConflictDoUpdate({ target: lessons.id, set: { title: lesson.title, skill: lessonSkill(lesson.skill), status: toStatus(lesson.status), contentBatchId: batchId, updatedAt: new Date() } });
        for (const block of normalized.lessonBlocksByLesson.get(lesson.id) ?? []) {
          const raw = block.content;
          const isText = block.block_type === "text";
          const content = isText
            ? { heading: String(raw.heading ?? lesson.title), body: String(raw.body ?? lesson.summary) }
            : { heading: `Example: ${String(raw.highlight ?? lesson.title)}`, body: `${String(raw.english ?? "")}\n\nVietnamese: ${String(raw.vietnamese ?? "")}`.trim() };
          await tx.insert(lessonBlocks).values({ id: uuid(`lesson-block:${block.id}`), lessonId, type: isText ? "RICH_TEXT" : "GRAMMAR", sortOrder: block.position, schemaVersion: 1, content }).onConflictDoUpdate({ target: lessonBlocks.id, set: { type: isText ? "RICH_TEXT" : "GRAMMAR", sortOrder: block.position, content } });
        }
        const practice = normalized.lessonQuestionByLesson.get(lesson.id);
        if (practice) {
          const adapted = questionContent(practice);
          const content = { instruction: "Choose the best answer.", questions: [{ id: uuid(`lesson-question:${practice.id}`), prompt: adapted.content.prompt, options: adapted.content.options, correctOptionId: adapted.answer.correctOptionId, explanation: practice.explanation }] };
          await tx.insert(lessonBlocks).values({ id: uuid(`lesson-question-block:${lesson.id}`), lessonId, type: "QUESTION_SET", sortOrder: 100, schemaVersion: 1, content }).onConflictDoUpdate({ target: lessonBlocks.id, set: { type: "QUESTION_SET", sortOrder: 100, content } });
        }
      }
      for (const card of pack.records.vocab_cards) {
        const values = { headword: card.term, partOfSpeech: card.part_of_speech, cefrLevel: card.cefr_level, ipa: card.ipa, meaning: card.meaning_vi, example: card.example_en, tags: [...card.tags, "content-pack-v0.1"], status: toStatus(card.status), contentBatchId: batchId, updatedAt: new Date() };
        const sourceId = uuid(`vocabulary:${card.id}`);
        const [bySourceId] = await tx.select({ id: vocabulary.id }).from(vocabulary).where(eq(vocabulary.id, sourceId));
        const partOfSpeech = card.part_of_speech === null ? isNull(vocabulary.partOfSpeech) : eq(vocabulary.partOfSpeech, card.part_of_speech);
        const [bySemanticIdentity] = await tx.select({ id: vocabulary.id }).from(vocabulary).where(and(eq(vocabulary.headword, card.term), partOfSpeech, eq(vocabulary.cefrLevel, card.cefr_level)));
        const existing = bySourceId ?? bySemanticIdentity;
        if (existing) await tx.update(vocabulary).set(values).where(eq(vocabulary.id, existing.id));
        else await tx.insert(vocabulary).values({ id: sourceId, ...values });
      }
      for (const exam of pack.records.exams) await tx.insert(exams).values({ id: uuid(`exam:${exam.id}`), slug: exam.slug, title: exam.title, type: exam.exam_type, mode: "PRACTICE", durationSeconds: exam.exam_type === "TOEIC" ? 1800 : 1200, metadata: { sourcePack: "content-pack-v0.1", sourceMode: exam.mode, durationEstimated: true }, status: toStatus(exam.status), contentBatchId: batchId }).onConflictDoUpdate({ target: exams.id, set: { title: exam.title, mode: "PRACTICE", durationSeconds: exam.exam_type === "TOEIC" ? 1800 : 1200, status: toStatus(exam.status), contentBatchId: batchId, updatedAt: new Date() } });
      for (const part of pack.records.exam_parts) {
        const sourcePassage = normalized.passageByPartId.get(part.id);
        await tx.insert(examParts).values({ id: uuid(`exam-part:${part.id}`), examId: uuid(`exam:${part.exam_id}`), partNumber: part.part_number, title: part.title, sortOrder: part.position, instructions: part.skill === "listening" ? "Listen to the available transcript and choose the best answer." : "Read and choose the best answer.", skill: part.skill.toUpperCase(), metadata: sourcePassage?.medium === "audio" ? { mediaKind: "BROWSER_TTS", playbackText: sourcePassage.transcript ?? sourcePassage.body, playbackLimit: 1, sourceAudioMissing: !sourcePassage.audio_url } : { sourcePack: "content-pack-v0.1" } }).onConflictDoUpdate({ target: examParts.id, set: { title: part.title, sortOrder: part.position, skill: part.skill.toUpperCase() } });
      }
      for (const passage of normalized.importedPassages) await tx.insert(passages).values({ id: uuid(`passage:${passage.id}`), examPartId: uuid(`exam-part:${passage.partId}`), title: passage.title, content: passage.body, sortOrder: 1, metadata: { medium: passage.medium, transcript: passage.transcript, sourceAudioUrl: passage.audio_url, cefrLevel: passage.cefr_level } }).onConflictDoUpdate({ target: passages.id, set: { title: passage.title, content: passage.body, metadata: { medium: passage.medium, transcript: passage.transcript, sourceAudioUrl: passage.audio_url, cefrLevel: passage.cefr_level } } });
      for (const { part, question } of normalized.runnableExamQuestions) {
        const adapted = questionContent(question);
        const sourcePassage = normalized.passageByPartId.get(part.id);
        await tx.insert(questions).values({ id: uuid(`question:${question.id}`), examPartId: uuid(`exam-part:${part.id}`), passageId: sourcePassage ? uuid(`passage:${sourcePassage.id}`) : null, groupKey: `source:${part.id}`, schemaVersion: 1, type: "MCQ", content: adapted.content, answer: adapted.answer, explanation: question.explanation, tags: [...question.tags, "content-pack-v0.1", `source-type:${question.question_type}`], status: toStatus(question.status), contentBatchId: batchId }).onConflictDoUpdate({ target: questions.id, set: { passageId: sourcePassage ? uuid(`passage:${sourcePassage.id}`) : null, content: adapted.content, answer: adapted.answer, explanation: question.explanation, tags: [...question.tags, "content-pack-v0.1", `source-type:${question.question_type}`], status: toStatus(question.status), contentBatchId: batchId, updatedAt: new Date() } });
      }
    });
    console.log(`Imported Content Pack v${pack.pack_version}: ${normalized.report.imported.lessons} lessons, ${normalized.report.imported.vocabulary} vocabulary cards, ${normalized.report.imported.questions} runnable exam questions.`);
  } finally { await client.end(); }
}

const mode = process.argv.includes("--import") ? "import" : process.argv.includes("--normalize") ? "normalize" : "check";
const pack = loadPack();
const normalized = normalize(pack);
if (mode === "normalize" || mode === "import") writeNormalizedReport(normalized.report);
if (mode === "import") importPack(pack, normalized).catch((error: unknown) => { console.error(error); process.exitCode = 1; });
else console.log(`Validated Content Pack v${pack.pack_version}. ${normalized.report.imported.questions} of ${pack.records.questions.length} questions are runnable with the current MCQ engine; ${normalized.report.deferred.questions.length} exam questions are deferred.`);
