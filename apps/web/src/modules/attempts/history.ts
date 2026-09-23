import { and, desc, eq, or } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { attempts, exams } from "@/db/schema";
export type AttemptHistoryItem = { id: string; examSlug: string; examTitle: string; status: "SUBMITTED" | "EXPIRED"; rawScore: number | null; totalQuestions: number; submittedAt: Date | null };
export async function listAttemptHistory(actor: { userId: string | null; guestId: string }): Promise<AttemptHistoryItem[]> {
  const db = createDatabase();
  if (!db) return [];
  const owner = actor.userId ? or(eq(attempts.userId, actor.userId), eq(attempts.guestId, actor.guestId)) : eq(attempts.guestId, actor.guestId);
  return db.select({ id: attempts.id, examSlug: exams.slug, examTitle: exams.title, status: attempts.status, rawScore: attempts.rawScore, totalQuestions: attempts.totalQuestions, submittedAt: attempts.submittedAt })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .where(and(owner, or(eq(attempts.status, "SUBMITTED"), eq(attempts.status, "EXPIRED"))))
    .orderBy(desc(attempts.submittedAt))
    .limit(20) as Promise<AttemptHistoryItem[]>;
}
