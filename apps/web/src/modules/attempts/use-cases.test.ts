import { describe, expect, it } from "vitest";
import { InMemoryAttemptRepository } from "./repository";
import { autosaveAttemptAnswers, startToeicPart5Attempt, submitToeicPart5Attempt } from "./use-cases";

describe("TOEIC Part 5 attempt use cases", () => {
  it("autosaves a learner answer and scores it only at submission", async () => {
    const repository = new InMemoryAttemptRepository();
    const actor = { guestId: "ca0cfeda-bf7b-4d8b-ae0a-b86b1f879a8a", userId: null };
    const { attempt, exam } = await startToeicPart5Attempt(repository, actor);
    const firstQuestion = exam.questions[0]!;

    await autosaveAttemptAnswers(repository, attempt.id, actor, [{ questionId: firstQuestion.id, selectedOptionId: "a" }]);
    const result = await submitToeicPart5Attempt(repository, attempt.id, actor, []);

    expect(result.attempt.status).toBe("SUBMITTED");
    expect(result.attempt.rawScore).toBe(1);
    expect(result.results[0]).toMatchObject({ correct: true, explanation: "After 'Please', use the base form of the verb." });
  });

  it("rejects an option that does not belong to the question", async () => {
    const repository = new InMemoryAttemptRepository();
    const actor = { guestId: "ca0cfeda-bf7b-4d8b-ae0a-b86b1f879a8a", userId: null };
    const { attempt, exam } = await startToeicPart5Attempt(repository, actor);
    await expect(autosaveAttemptAnswers(repository, attempt.id, actor, [{ questionId: exam.questions[0]!.id, selectedOptionId: "invalid" }])).rejects.toThrow("Invalid answer");
  });

  it("binds a signed-in attempt to its user instead of another guest cookie", async () => {
    const repository = new InMemoryAttemptRepository();
    const owner = { guestId: "ca0cfeda-bf7b-4d8b-ae0a-b86b1f879a8a", userId: "6a373d9f-4bc4-40e0-9c3c-6da9ab4c64a1" };
    const intruder = { guestId: "88743d0f-7510-40e8-8e1f-b2dcab6d01a2", userId: "6f9974b5-02f1-46e7-b43f-bdd00a175a14" };
    const { attempt, exam } = await startToeicPart5Attempt(repository, owner);
    await expect(autosaveAttemptAnswers(repository, attempt.id, intruder, [{ questionId: exam.questions[0]!.id, selectedOptionId: "a" }])).rejects.toThrow("Attempt not found");
  });
});
