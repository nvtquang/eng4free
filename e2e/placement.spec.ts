import { expect, test } from "@playwright/test";

type View = { attemptId: string; answered: number; total: number; finished: boolean; question: { itemId: string; skill: string; options: Array<{ id: string }> } | null };

test("placement questions carry no answer key and only the pending question can be answered", async ({ page }) => {
  const start = await page.request.post("/api/placement", { data: { startLevel: "A2" } });
  expect(start.ok()).toBeTruthy();
  const view = await start.json() as View;
  const raw = JSON.stringify(view);
  expect(raw).not.toContain("correctOptionId");
  expect(raw).not.toContain("explanation");
  expect(view).toMatchObject({ answered: 0, total: 20, finished: false, question: { skill: "GRAMMAR" } });

  const other = await (await page.request.post("/api/placement", { data: {} })).json() as View;
  expect((await page.request.post(`/api/placement/${view.attemptId}/answer`, { data: { itemId: other.question!.itemId, optionId: "a" } })).status()).toBe(409);
  expect((await page.request.post(`/api/placement/${view.attemptId}/complete`, { data: { speaking: "B1", writing: "B1" } })).status()).toBe(409);
  expect((await page.request.post("/api/onboarding", { data: { goal: "toeic", minutesPerDay: 15, placementAttemptId: view.attemptId } })).status()).toBe(409);

  const answered = await (await page.request.post(`/api/placement/${view.attemptId}/answer`, { data: { itemId: view.question!.itemId, optionId: view.question!.options[0]!.id } })).json() as View;
  expect(answered.answered).toBe(1);
  expect(JSON.stringify(answered)).not.toMatch(/"correct"/u);
});

test("a new learner completes onboarding with the adaptive placement test", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "TOEIC preparation" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^20/u }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Take the placement test" }).click();

  for (let question = 1; question <= 20; question++) {
    await expect(page.getByText(`Question ${question}/20`)).toBeVisible();
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "Speaking and Writing: self-assessment" })).toBeVisible();
  await page.getByRole("group", { name: "Speaking" }).getByRole("radio").nth(2).check();
  await page.getByRole("group", { name: "Writing" }).getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "See my result" }).click();

  await expect(page.getByText("Level by skill")).toBeVisible();
  await expect(page.getByText(/\d+\/20 questions correct/u)).toBeVisible();
  const skills = page.locator("dl > div");
  await expect(skills).toHaveCount(6);
  await expect(skills.filter({ hasText: "Speaking" }).locator("dd")).toHaveText("B1");
  await expect(skills.filter({ hasText: "Writing" }).locator("dd")).toHaveText("A2");
  for (const skill of ["Grammar", "Vocabulary", "Reading", "Listening"]) await expect(skills.filter({ hasText: skill }).locator("dd")).toHaveText(/^(A1|A2|B1|B2|C1|C2)$/u);

  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(page).toHaveURL(/\/today/u);
});
