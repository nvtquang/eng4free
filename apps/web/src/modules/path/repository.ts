import { and, asc, eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { courseLevels, courseUnits, courses, lessonCompletions, lessons } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";
import type { PathLesson } from "./path-order";

/** Every published lesson in path order (level, unit, lesson). */
export async function listPathLessons(): Promise<PathLesson[]> {
  const db = createDatabase();
  if (!db) return [];
  return db.select({ id: lessons.id, level: courseLevels.cefrLevel, unitTitle: courseUnits.title, slug: lessons.slug, title: lessons.title, skill: lessons.skill, estimatedMinutes: lessons.estimatedMinutes })
    .from(lessons)
    .innerJoin(courseUnits, eq(lessons.unitId, courseUnits.id))
    .innerJoin(courseLevels, eq(courseUnits.courseLevelId, courseLevels.id))
    .innerJoin(courses, eq(courseLevels.courseId, courses.id))
    .where(and(eq(lessons.status, "PUBLISHED"), eq(courses.status, "PUBLISHED")))
    .orderBy(asc(courseLevels.cefrLevel), asc(courseLevels.sortOrder), asc(courseUnits.sortOrder), asc(lessons.createdAt));
}

/** Ids of the lessons this learner has completed (empty for a visitor without a learner). */
export async function listCompletedLessonIds(learner: LearnerRef | null): Promise<Set<string>> {
  const db = createDatabase();
  if (!db || !learner) return new Set();
  const rows = await db.select({ lessonId: lessonCompletions.lessonId }).from(lessonCompletions).where(eq(lessonCompletions.learnerId, learner.learnerId));
  return new Set(rows.map((row) => row.lessonId));
}

export function lessonHref(lesson: { level: string; slug: string }): string {
  return `/learn/${lesson.level.toLowerCase()}/${lesson.slug}`;
}
