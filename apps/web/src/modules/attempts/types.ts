export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";

export type SavedAnswer = { questionId: string; selectedOptionId: string };

export type Attempt = {
  id: string;
  examId: string;
  userId: string | null;
  guestId: string;
  status: AttemptStatus;
  startedAt: Date;
  submittedAt: Date | null;
  rawScore: number | null;
  totalQuestions: number;
  answers: SavedAnswer[];
};

export type AttemptActor = { guestId: string; userId: string | null };

export type AttemptRepository = {
  create(input: Omit<Attempt, "id" | "submittedAt" | "rawScore" | "answers">): Promise<Attempt>;
  findById(id: string): Promise<Attempt | null>;
  saveAnswers(id: string, answers: SavedAnswer[]): Promise<Attempt>;
  submit(id: string, rawScore: number): Promise<Attempt>;
};
