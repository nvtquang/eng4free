import { expect, test, type APIRequestContext } from "@playwright/test";

type StartedExam = { attempt: { id: string }; exam: { parts: Array<{ questions: Array<{ id: string; type: string; content: { prompt?: string; options?: Array<{ id: string; text: string }> } }> }> } };

async function startExam(request: APIRequestContext, slug: string): Promise<StartedExam> {
  const response = await request.post(`/api/exam-engine/${slug}/attempts`);
  expect(response.ok()).toBeTruthy();
  return await response.json() as StartedExam;
}

test("the old Part 5 route opens the shared exam runner", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  await page.goto("/toeic/practice/part-5");
  await expect(page).toHaveURL(/\/exams\/toeic-part-5-practice$/);
  await expect(page.getByRole("button", { name: "Submit exam" })).toBeVisible();
});

test("Part 5 attempts carry no answer key and the tutor only explains stored answers", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  const started = await startExam(page.request, "toeic-part-5-practice");
  expect(JSON.stringify(started)).not.toContain("correctOptionId");
  const [first, second] = started.exam.parts[0]!.questions;
  const optionId = first!.content.options![0]!.id;
  const saved = await page.request.put(`/api/exam-engine/attempts/${started.attempt.id}/answers`, { data: { answers: [{ questionId: first!.id, selectedOptionId: optionId }] } });
  expect(saved.ok()).toBeTruthy();

  // Before submitting, the tutor refuses to explain anything.
  expect((await page.request.post("/api/ai/tutor", { data: { attemptId: started.attempt.id, questionId: first!.id } })).status()).toBe(404);

  expect((await page.request.post(`/api/exam-engine/attempts/${started.attempt.id}/submit`, { data: { answers: [] } })).ok()).toBeTruthy();

  // An unanswered question and a question from another exam are both rejected.
  expect((await page.request.post("/api/ai/tutor", { data: { attemptId: started.attempt.id, questionId: second!.id } })).status()).toBe(404);
  const other = await startExam(page.request, "toeic-full-mock-1");
  const foreign = other.exam.parts.flatMap((part) => part.questions).find((question) => question.type === "MCQ")!;
  expect((await page.request.post("/api/ai/tutor", { data: { attemptId: started.attempt.id, questionId: foreign.id } })).status()).toBe(404);

  const tutor = await page.request.post("/api/ai/tutor", { data: { attemptId: started.attempt.id, questionId: first!.id } });
  expect(tutor.ok()).toBeTruthy();
  expect(await tutor.json()).toMatchObject({ providerUsed: false });
  const history = await page.request.get(`/api/ai/tutor?attemptId=${started.attempt.id}`);
  expect((await history.json() as { feedback: Array<{ questionId: string; learnerAnswer: string }> }).feedback).toEqual([expect.objectContaining({ questionId: first!.id, learnerAnswer: optionId })]);

  // The review page offers the tutor under each answered multiple-choice question.
  await page.goto(`/exams/toeic-part-5-practice/results/${started.attempt.id}`);
  await expect(page.getByRole("heading", { name: "Result:", exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ask AI Tutor" })).toHaveCount(1);
  await expect(page.getByText("Official explanation", { exact: true })).toBeVisible();
});
