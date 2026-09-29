import { and, asc, eq, inArray } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { courseLevels, courseUnits, courses, lessonCompletions, lessons } from "@/db/schema";
import { countDueVocabulary, vocabularyOwnerKey } from "@/modules/vocabulary/review-schedule";
import { findLearnerProfile, type LearnerProfile } from "@/modules/onboarding/repository";
import { listPublicExams } from "@/modules/exams/exam-engine";
import { countOpenMistakes } from "@/modules/mistakes/repository";

type Actor = { userId: string | null; guestId: string };
const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type NextLesson = { level: string; slug: string; title: string; skill: string | null; estimatedMinutes: number };
export type ExamSuggestion = { slug: string; title: string; type: "TOEIC" | "IELTS"; mode: string };
export type TodayPlan = {
  profile: LearnerProfile;
  nextLesson: NextLesson | null;
  vocabularyDue: number;
  exam: ExamSuggestion | null;
  minutesGoal: number;
  mistakesDue: number;
};

/** The first published lesson at or above the learner's level that they have not completed. */
async function findNextLesson(actor: Actor, fromLevel: string): Promise<NextLesson | null> {
  const db = createDatabase();
  if (!db) return null;
  const startIndex = Math.max(0, levelOrder.indexOf(fromLevel.toUpperCase()));
  const targetLevels = levelOrder.slice(startIndex);
  const rows = await db.select({ id: lessons.id, level: courseLevels.cefrLevel, slug: lessons.slug, title: lessons.title, skill: lessons.skill, estimatedMinutes: lessons.estimatedMinutes })
    .from(lessons)
    .innerJoin(courseUnits, eq(lessons.unitId, courseUnits.id))
    .innerJoin(courseLevels, eq(courseUnits.courseLevelId, courseLevels.id))
    .innerJoin(courses, eq(courseLevels.courseId, courses.id))
    .where(and(eq(lessons.status, "PUBLISHED"), eq(courses.status, "PUBLISHED"), inArray(courseLevels.cefrLevel, targetLevels)))
    .orderBy(asc(courseLevels.cefrLevel), asc(courseLevels.sortOrder), asc(courseUnits.sortOrder), asc(lessons.createdAt));
  if (rows.length === 0) return null;
  const ownerKey = vocabularyOwnerKey(actor);
  const completed = new Set((await db.select({ lessonId: lessonCompletions.lessonId }).from(lessonCompletions).where(eq(lessonCompletions.ownerKey, ownerKey))).map((row) => row.lessonId));
  const next = rows.find((row) => !completed.has(row.id)) ?? rows[0];
  return { level: next.level, slug: next.slug, title: next.title, skill: next.skill, estimatedMinutes: next.estimatedMinutes };
}

async function suggestExam(goal: LearnerProfile["goal"]): Promise<ExamSuggestion | null> {
  if (goal === "communication") return null;
  const type = goal === "ielts" ? "IELTS" : "TOEIC";
  try {
    const exams = await listPublicExams(type);
    const preferred = exams.find((exam) => exam.mode === "PRACTICE") ?? exams[0];
    return preferred ? { slug: preferred.slug, title: preferred.title, type: preferred.type as "TOEIC" | "IELTS", mode: preferred.mode } : null;
  } catch {
    return null;
  }
}

/** Everything the "Today" page needs, or null when the learner has not completed onboarding. */
export async function buildTodayPlan(actor: Actor, now = new Date()): Promise<TodayPlan | null> {
  const profile = await findLearnerProfile(actor);
  if (!profile) return null;
  const [nextLesson, vocabularyDue, exam, mistakesDue] = await Promise.all([
    findNextLesson(actor, profile.cefrLevel),
    countDueVocabulary(actor, now),
    suggestExam(profile.goal),
    countOpenMistakes(actor)
  ]);
  return { profile, nextLesson, vocabularyDue, exam, minutesGoal: profile.minutesPerDay, mistakesDue };
}
