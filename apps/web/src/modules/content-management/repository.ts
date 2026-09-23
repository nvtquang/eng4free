import { asc, eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { contentBatches, courseLevels, courseUnits, courses, examParts, exams, lessons, media, passages } from "@/db/schema";
import type { ContentStatus } from "./workflow";
export type ContentBatchSummary = { id: string; source: string; version: string; status: ContentStatus; importedAt: Date };
export async function listContentBatches(): Promise<ContentBatchSummary[] | null> { const db = createDatabase(); if (!db) return null; return (await db.select({ id: contentBatches.id, source: contentBatches.source, version: contentBatches.version, status: contentBatches.status, importedAt: contentBatches.importedAt }).from(contentBatches).orderBy(contentBatches.importedAt)).map((batch) => ({ ...batch, status: batch.status as ContentStatus })); }
export async function updateContentBatchStatus(id: string, status: ContentStatus): Promise<ContentBatchSummary | null> { const db = createDatabase(); if (!db) return null; const [updated] = await db.update(contentBatches).set({ status }).where(eq(contentBatches.id, id)).returning({ id: contentBatches.id, source: contentBatches.source, version: contentBatches.version, status: contentBatches.status, importedAt: contentBatches.importedAt }); return updated ? { ...updated, status: updated.status as ContentStatus } : null; }
export async function findContentBatch(id: string): Promise<ContentBatchSummary | null> { const db = createDatabase(); if (!db) return null; const [batch] = await db.select({ id: contentBatches.id, source: contentBatches.source, version: contentBatches.version, status: contentBatches.status, importedAt: contentBatches.importedAt }).from(contentBatches).where(eq(contentBatches.id, id)); return batch ? { ...batch, status: batch.status as ContentStatus } : null; }

export type AdminEditorData = {
  batches: Array<{ id: string; source: string; version: string; status: ContentStatus }>;
  units: Array<{ id: string; title: string; level: string; courseTitle: string; batchId: string | null }>;
  lessons: Array<{ id: string; title: string; slug: string; level: string; status: ContentStatus; batchId: string | null }>;
  exams: Array<{ id: string; title: string; slug: string; type: "TOEIC" | "IELTS"; status: ContentStatus; batchId: string | null }>;
  examParts: Array<{ id: string; examId: string; examTitle: string; partNumber: number; title: string; skill: string | null }>;
  passages: Array<{ id: string; examPartId: string; title: string | null }>;
  media: Array<{ id: string; kind: string; contentType: string; status: string }>;
};

/**
 * The CMS receives labels and ids together here so editors choose related
 * content from a select control. UUIDs never have to be copied between forms.
 */
export async function getAdminEditorData(): Promise<AdminEditorData | null> {
  const db = createDatabase();
  if (!db) return null;
  const [batchRows, unitRows, lessonRows, examRows, partRows, passageRows, mediaRows] = await Promise.all([
    db.select({ id: contentBatches.id, source: contentBatches.source, version: contentBatches.version, status: contentBatches.status }).from(contentBatches).orderBy(asc(contentBatches.importedAt)),
    db.select({ id: courseUnits.id, title: courseUnits.title, level: courseLevels.cefrLevel, courseTitle: courses.title, batchId: courses.contentBatchId }).from(courseUnits).innerJoin(courseLevels, eq(courseUnits.courseLevelId, courseLevels.id)).innerJoin(courses, eq(courseLevels.courseId, courses.id)).orderBy(asc(courses.title), asc(courseLevels.sortOrder), asc(courseUnits.sortOrder)),
    db.select({ id: lessons.id, title: lessons.title, slug: lessons.slug, level: courseLevels.cefrLevel, status: lessons.status, batchId: lessons.contentBatchId }).from(lessons).innerJoin(courseUnits, eq(lessons.unitId, courseUnits.id)).innerJoin(courseLevels, eq(courseUnits.courseLevelId, courseLevels.id)).orderBy(asc(lessons.createdAt)),
    db.select({ id: exams.id, title: exams.title, slug: exams.slug, type: exams.type, status: exams.status, batchId: exams.contentBatchId }).from(exams).orderBy(asc(exams.createdAt)),
    db.select({ id: examParts.id, examId: examParts.examId, examTitle: exams.title, partNumber: examParts.partNumber, title: examParts.title, skill: examParts.skill }).from(examParts).innerJoin(exams, eq(examParts.examId, exams.id)).orderBy(asc(exams.title), asc(examParts.sortOrder)),
    db.select({ id: passages.id, examPartId: passages.examPartId, title: passages.title }).from(passages).orderBy(asc(passages.sortOrder)),
    db.select({ id: media.id, kind: media.kind, contentType: media.contentType, status: media.status }).from(media).orderBy(asc(media.createdAt))
  ]);
  return {
    batches: batchRows.map((item) => ({ ...item, status: item.status as ContentStatus })),
    units: unitRows,
    lessons: lessonRows.map((item) => ({ ...item, status: item.status as ContentStatus })),
    exams: examRows.map((item) => ({ ...item, type: item.type as "TOEIC" | "IELTS", status: item.status as ContentStatus })),
    examParts: partRows,
    passages: passageRows,
    media: mediaRows
  };
}
