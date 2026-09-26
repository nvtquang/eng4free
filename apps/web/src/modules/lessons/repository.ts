import { and, asc, desc, eq, or } from "drizzle-orm";
import { LessonListeningContentSchema, LessonQuestionSetContentSchema, LessonRichTextContentSchema, type LessonQuestionSetContent } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { demoAudioUrl } from "@/modules/media/demo-audio";
import { courseLevels, courseUnits, courses, lessonBlocks, lessonCompletions, lessons, media } from "@/db/schema";

export type LearnerLessonBlock =
  | { id: string; type: "RICH_TEXT"; sortOrder: number; content: { heading: string; body: string } }
  | { id: string; type: "MEDIA"; sortOrder: number; content: { heading: string; transcript: string; playbackText?: string; mediaId?: string; mediaUrl?: string; sourceLabel: string } }
  | { id: string; type: "QUESTION_SET"; sortOrder: number; content: { instruction: string; questions: Array<{ id: string; prompt: string; options: Array<{ id: string; text: string }> }> } };

export type PublishedLesson = { id: string; title: string; skill: string | null; estimatedMinutes: number; blocks: LearnerLessonBlock[] };
export type PublishedLessonCatalogItem = { level: string; slug: string; title: string; skill: string | null; estimatedMinutes: number };

export async function listPublishedLessonCatalog(): Promise<PublishedLessonCatalogItem[] | null> {
  const db = createDatabase();
  if (!db) return null;
  return db.select({ level: courseLevels.cefrLevel, slug: lessons.slug, title: lessons.title, skill: lessons.skill, estimatedMinutes: lessons.estimatedMinutes })
    .from(lessons)
    .innerJoin(courseUnits, eq(lessons.unitId, courseUnits.id))
    .innerJoin(courseLevels, eq(courseUnits.courseLevelId, courseLevels.id))
    .innerJoin(courses, eq(courseLevels.courseId, courses.id))
    .where(and(eq(lessons.status, "PUBLISHED"), eq(courses.status, "PUBLISHED")))
    .orderBy(asc(courseLevels.cefrLevel), asc(courseLevels.sortOrder), asc(courseUnits.sortOrder), asc(lessons.createdAt));
}

function toPublicQuestionSet(content: LessonQuestionSetContent): Extract<LearnerLessonBlock, { type: "QUESTION_SET" }>["content"] {
  return { instruction: content.instruction, questions: content.questions.map((question) => ({ id: question.id, prompt: question.prompt, options: question.options })) };
}

export async function findPublishedLesson(level: string, slug: string): Promise<PublishedLesson | null> {
  const db = createDatabase();
  if (!db) return null;
  const [lesson] = await db.select({ id: lessons.id, title: lessons.title, skill: lessons.skill, estimatedMinutes: lessons.estimatedMinutes })
    .from(lessons)
    .innerJoin(courseUnits, eq(lessons.unitId, courseUnits.id))
    .innerJoin(courseLevels, eq(courseUnits.courseLevelId, courseLevels.id))
    .innerJoin(courses, eq(courseLevels.courseId, courses.id))
    .where(and(eq(lessons.slug, slug), eq(courseLevels.cefrLevel, level.toUpperCase()), eq(lessons.status, "PUBLISHED"), eq(courses.status, "PUBLISHED")));
  if (!lesson) return null;
  const rows = await db.select().from(lessonBlocks).where(eq(lessonBlocks.lessonId, lesson.id)).orderBy(asc(lessonBlocks.sortOrder));
  const blocks: LearnerLessonBlock[] = [];
  for (const row of rows) {
    if (row.type === "RICH_TEXT" || row.type === "GRAMMAR" || row.type === "PRONUNCIATION") {
      const parsed = LessonRichTextContentSchema.safeParse(row.content);
      if (parsed.success) blocks.push({ id: row.id, type: "RICH_TEXT", sortOrder: row.sortOrder, content: parsed.data });
    }
    if (row.type === "QUESTION_SET") {
      const parsed = LessonQuestionSetContentSchema.safeParse(row.content);
      if (parsed.success) blocks.push({ id: row.id, type: "QUESTION_SET", sortOrder: row.sortOrder, content: toPublicQuestionSet(parsed.data) });
    }
    if (row.type === "MEDIA") {
      const parsed = LessonListeningContentSchema.safeParse(row.content);
      if (parsed.success) { let mediaUrl: string | undefined; if (parsed.data.mediaId) { const [asset] = await db.select({ id: media.id }).from(media).where(and(eq(media.id, parsed.data.mediaId), eq(media.status, "READY"))); if (asset) mediaUrl = `/api/content-media/${asset.id}`; } mediaUrl ??= demoAudioUrl(parsed.data.playbackText); blocks.push({ id: row.id, type: "MEDIA", sortOrder: row.sortOrder, content: { ...parsed.data, mediaUrl } }); }
    }
  }
  return { ...lesson, blocks };
}

export async function getLessonQuestionSetForScoring(lessonId: string) {
  const db = createDatabase();
  if (!db) return null;
  const [lesson] = await db.select({ id: lessons.id, skill: lessons.skill }).from(lessons).where(and(eq(lessons.id, lessonId), eq(lessons.status, "PUBLISHED")));
  if (!lesson) return null;
  const rows = await db.select({ content: lessonBlocks.content }).from(lessonBlocks).where(and(eq(lessonBlocks.lessonId, lessonId), eq(lessonBlocks.type, "QUESTION_SET")));
  const questions = rows.flatMap((row) => {
    const parsed = LessonQuestionSetContentSchema.safeParse(row.content);
    return parsed.success ? parsed.data.questions : [];
  });
  return { lesson, questions };
}
export async function listLessonCompletionHistory(actor: { userId: string | null; guestId: string }, skill: "LISTENING" | "READING" | "GRAMMAR") { const db = createDatabase(); if (!db) return []; const owner = actor.userId ? or(eq(lessonCompletions.userId, actor.userId), eq(lessonCompletions.guestId, actor.guestId)) : eq(lessonCompletions.guestId, actor.guestId); return db.select({ id: lessonCompletions.id, lessonId: lessons.id, title: lessons.title, rawScore: lessonCompletions.rawScore, totalQuestions: lessonCompletions.totalQuestions, completedAt: lessonCompletions.completedAt }).from(lessonCompletions).innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id)).where(and(owner, eq(lessons.skill, skill))).orderBy(desc(lessonCompletions.completedAt)).limit(20); }
export async function findLessonForPreview(lessonId: string): Promise<PublishedLesson | null> { const db = createDatabase(); if (!db) return null; const [lesson] = await db.select({ id: lessons.id, title: lessons.title, skill: lessons.skill, estimatedMinutes: lessons.estimatedMinutes }).from(lessons).where(eq(lessons.id, lessonId)); if (!lesson) return null; const rows = await db.select().from(lessonBlocks).where(eq(lessonBlocks.lessonId, lesson.id)).orderBy(asc(lessonBlocks.sortOrder)); const blocks: LearnerLessonBlock[] = []; for (const row of rows) { if (row.type === "RICH_TEXT" || row.type === "GRAMMAR" || row.type === "PRONUNCIATION") { const parsed = LessonRichTextContentSchema.safeParse(row.content); if (parsed.success) blocks.push({ id: row.id, type: "RICH_TEXT", sortOrder: row.sortOrder, content: parsed.data }); } if (row.type === "QUESTION_SET") { const parsed = LessonQuestionSetContentSchema.safeParse(row.content); if (parsed.success) blocks.push({ id: row.id, type: "QUESTION_SET", sortOrder: row.sortOrder, content: toPublicQuestionSet(parsed.data) }); } if (row.type === "MEDIA") { const parsed = LessonListeningContentSchema.safeParse(row.content); if (parsed.success) blocks.push({ id: row.id, type: "MEDIA", sortOrder: row.sortOrder, content: parsed.data }); } } return { ...lesson, blocks }; }
