import { and, desc, eq, or } from "drizzle-orm";
import type { LearnerRef } from "@/modules/learners/types";
import { createDatabase } from "@/db/client";
import { attempts, exams } from "@/db/schema";
export type AttemptHistoryItem = { id: string; examSlug: string; examTitle: string; status: "SUBMITTED" | "EXPIRED"; rawScore: number | null; totalQuestions: number; submittedAt: Date | null };
export async function listAttemptHistory(learner: LearnerRef): Promise<AttemptHistoryItem[]> {
  const db = createDatabase();
  if (!db) return [];
  return db.select({ id: attempts.id, examSlug: exams.slug, examTitle: exams.title, status: attempts.status, rawScore: attempts.rawScore, totalQuestions: attempts.totalQuestions, submittedAt: attempts.submittedAt })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .where(and(eq(attempts.learnerId, learner.learnerId), or(eq(attempts.status, "SUBMITTED"), eq(attempts.status, "EXPIRED"))))
    .orderBy(desc(attempts.submittedAt))
    .limit(20) as Promise<AttemptHistoryItem[]>;
}
