import { weakestSkill, type PracticeSkill } from "@/lib/practice-links";
import type { LearnerRef } from "@/modules/learners/types";
import { findLearnerProfile, type LearnerProfile } from "@/modules/onboarding/repository";
import { listPublicExams } from "@/modules/exams/exam-engine";
import { countOpenMistakes } from "@/modules/mistakes/repository";
import { nextInPath, type PathLesson } from "@/modules/path/path-order";
import { listCompletedLessonIds, listPathLessons } from "@/modules/path/repository";
import { listProgressEvents } from "@/modules/progress/repository";
import { estimateStudyMinutes } from "@/modules/progress/study-minutes";
import { countDueVocabulary } from "@/modules/vocabulary/review-schedule";

export type ExamSuggestion = { slug: string; title: string; type: "TOEIC" | "IELTS"; mode: string };
export type TodayPlan = {
  profile: LearnerProfile;
  nextLesson: PathLesson | null;
  vocabularyDue: number;
  exam: ExamSuggestion | null;
  minutesGoal: number;
  minutesToday: number;
  mistakesDue: number;
  weakSkill: { skill: PracticeSkill; level: string } | null;
};

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
export async function buildTodayPlan(learner: LearnerRef, now = new Date()): Promise<TodayPlan | null> {
  const profile = await findLearnerProfile(learner);
  if (!profile) return null;
  const [pathLessons, completed, vocabularyDue, exam, mistakesDue, events] = await Promise.all([
    listPathLessons(),
    listCompletedLessonIds(learner),
    countDueVocabulary(learner, now),
    suggestExam(profile.goal),
    countOpenMistakes(learner),
    listProgressEvents(learner)
  ]);
  return {
    profile,
    nextLesson: nextInPath(pathLessons, completed, profile.cefrLevel),
    vocabularyDue,
    exam,
    minutesGoal: profile.minutesPerDay,
    minutesToday: estimateStudyMinutes(events, now),
    mistakesDue,
    weakSkill: weakestSkill(profile.skillLevels)
  };
}
