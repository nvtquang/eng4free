import { scoreMcq } from "@english4free/scoring-core";
import type { AttemptActor, AttemptRepository, SavedAnswer } from "./types";
import { TOEIC_PART_5_EXAM_ID, findToeicPart5Question, getToeicPart5LearnerExam, toeicPart5Questions } from "@/modules/exams/toeic-part-5";

function canAccessAttempt(actor: AttemptActor, attempt: { userId: string | null; guestId: string }) {
  return attempt.userId ? actor.userId === attempt.userId : actor.guestId === attempt.guestId;
}

export async function startToeicPart5Attempt(repository: AttemptRepository, actor: AttemptActor) {
  const exam = getToeicPart5LearnerExam();
  const attempt = await repository.create({ examId: TOEIC_PART_5_EXAM_ID, userId: actor.userId, guestId: actor.guestId, status: "IN_PROGRESS", startedAt: new Date(), totalQuestions: exam.questions.length });
  return { attempt, exam };
}

export async function autosaveAttemptAnswers(repository: AttemptRepository, attemptId: string, actor: AttemptActor, answers: SavedAnswer[]) {
  const attempt = await repository.findById(attemptId);
  if (!attempt || !canAccessAttempt(actor, attempt)) throw new Error("Attempt not found");
  if (attempt.examId !== TOEIC_PART_5_EXAM_ID) throw new Error("Unsupported exam");

  for (const answer of answers) {
    const question = findToeicPart5Question(answer.questionId);
    if (!question || !question.content.options.some((option) => option.id === answer.selectedOptionId)) {
      throw new Error("Invalid answer for this exam");
    }
  }
  return repository.saveAnswers(attemptId, answers);
}

export async function submitToeicPart5Attempt(repository: AttemptRepository, attemptId: string, actor: AttemptActor, submittedAnswers: SavedAnswer[]) {
  await autosaveAttemptAnswers(repository, attemptId, actor, submittedAnswers);
  const attempt = await repository.findById(attemptId);
  if (!attempt || !canAccessAttempt(actor, attempt)) throw new Error("Attempt not found");

  const results = toeicPart5Questions.map((question) => {
    const answer = attempt.answers.find((saved) => saved.questionId === question.id);
    const score = answer ? scoreMcq(question, answer.selectedOptionId) : { correct: false, earnedPoints: 0, availablePoints: 1 };
    return { questionId: question.id, selectedOptionId: answer?.selectedOptionId ?? null, ...score, explanation: question.explanation };
  });
  const rawScore = results.reduce((total, result) => total + result.earnedPoints, 0);
  const completed = await repository.submit(attemptId, rawScore);
  return { attempt: completed, results };
}
