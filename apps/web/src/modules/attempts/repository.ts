import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createDatabase } from "@/db/client";
import { attemptAnswers, attempts } from "@/db/schema";
import type { Attempt, AttemptRepository, SavedAnswer } from "./types";

function cloneAttempt(attempt: Attempt): Attempt {
  return { ...attempt, answers: attempt.answers.map((answer) => ({ ...answer })) };
}

export class InMemoryAttemptRepository implements AttemptRepository {
  private readonly attempts = new Map<string, Attempt>();

  async create(input: Omit<Attempt, "id" | "submittedAt" | "rawScore" | "answers">): Promise<Attempt> {
    const attempt: Attempt = { ...input, id: randomUUID(), submittedAt: null, rawScore: null, answers: [] };
    this.attempts.set(attempt.id, attempt);
    return cloneAttempt(attempt);
  }

  async findById(id: string): Promise<Attempt | null> {
    const attempt = this.attempts.get(id);
    return attempt ? cloneAttempt(attempt) : null;
  }

  async saveAnswers(id: string, answers: SavedAnswer[]): Promise<Attempt> {
    const attempt = this.attempts.get(id);
    if (!attempt || attempt.status !== "IN_PROGRESS") throw new Error("Attempt is not editable");
    for (const answer of answers) {
      const index = attempt.answers.findIndex((saved) => saved.questionId === answer.questionId);
      if (index >= 0) attempt.answers[index] = answer;
      else attempt.answers.push(answer);
    }
    return cloneAttempt(attempt);
  }

  async submit(id: string, rawScore: number): Promise<Attempt> {
    const attempt = this.attempts.get(id);
    if (!attempt || attempt.status !== "IN_PROGRESS") throw new Error("Attempt is not submittable");
    attempt.status = "SUBMITTED";
    attempt.rawScore = rawScore;
    attempt.submittedAt = new Date();
    return cloneAttempt(attempt);
  }
}

class PostgresAttemptRepository implements AttemptRepository {
  constructor(private readonly db: NonNullable<ReturnType<typeof createDatabase>>) {}

  async create(input: Omit<Attempt, "id" | "submittedAt" | "rawScore" | "answers">): Promise<Attempt> {
    const id = randomUUID();
    await this.db.insert(attempts).values({ id, examId: input.examId, userId: input.userId, guestId: input.guestId, status: input.status, startedAt: input.startedAt, totalQuestions: input.totalQuestions });
    return { ...input, id, submittedAt: null, rawScore: null, answers: [] };
  }

  async findById(id: string): Promise<Attempt | null> {
    const [attempt] = await this.db.select().from(attempts).where(eq(attempts.id, id)).limit(1);
    if (!attempt || !attempt.guestId) return null;
    const saved = await this.db.select().from(attemptAnswers).where(eq(attemptAnswers.attemptId, id));
    return { id: attempt.id, examId: attempt.examId, userId: attempt.userId, guestId: attempt.guestId, status: attempt.status, startedAt: attempt.startedAt, submittedAt: attempt.submittedAt, rawScore: attempt.rawScore, totalQuestions: attempt.totalQuestions, answers: saved.map(({ questionId, selectedOptionId }) => ({ questionId, selectedOptionId })) };
  }

  async saveAnswers(id: string, savedAnswers: SavedAnswer[]): Promise<Attempt> {
    const attempt = await this.findById(id);
    if (!attempt || attempt.status !== "IN_PROGRESS") throw new Error("Attempt is not editable");
    for (const answer of savedAnswers) {
      await this.db.insert(attemptAnswers).values({ attemptId: id, questionId: answer.questionId, selectedOptionId: answer.selectedOptionId }).onConflictDoUpdate({ target: [attemptAnswers.attemptId, attemptAnswers.questionId], set: { selectedOptionId: answer.selectedOptionId, updatedAt: new Date() } });
    }
    return (await this.findById(id))!;
  }

  async submit(id: string, rawScore: number): Promise<Attempt> {
    const attempt = await this.findById(id);
    if (!attempt || attempt.status !== "IN_PROGRESS") throw new Error("Attempt is not submittable");
    const submittedAt = new Date();
    await this.db.update(attempts).set({ status: "SUBMITTED", rawScore, submittedAt, updatedAt: submittedAt }).where(and(eq(attempts.id, id), eq(attempts.status, "IN_PROGRESS")));
    return (await this.findById(id))!;
  }
}

const memoryRepository = new InMemoryAttemptRepository();

export function getAttemptRepository(): AttemptRepository {
  const db = createDatabase();
  if (db) return new PostgresAttemptRepository(db);
  if (process.env.NODE_ENV === "production" && process.env.E4F_USE_IN_MEMORY !== "true") throw new Error("DATABASE_URL is required in production");
  return memoryRepository;
}
