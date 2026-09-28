import { expect, test } from "@playwright/test";

test("TOEIC and IELTS catalogues expose published practice modes", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  await page.goto("/toeic");
  await expect(page.getByRole("heading", { name: "TOEIC practice", exact: true })).toBeVisible();
  expect(await page.getByRole("link", { name: "Start attempt" }).count()).toBeGreaterThanOrEqual(8);
  await expect(page.getByText("Mock test", { exact: true })).toBeVisible();
  await page.goto("/ielts");
  await expect(page.getByRole("heading", { name: "IELTS practice", exact: true })).toBeVisible();
  expect(await page.getByRole("link", { name: "Start attempt" }).count()).toBeGreaterThanOrEqual(4);
});

test("shared exam resumes, submits and keeps a review stable after refresh", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  const start = await page.request.post("/api/exam-engine/toeic-part-5-practice/attempts");
  expect(start.ok()).toBeTruthy();
  expect(JSON.stringify(await start.json())).not.toContain("correctOptionId");
  await page.goto("/exams/toeic-part-5-practice");
  const saved = page.waitForResponse((response) => response.url().includes("/answers") && response.request().method() === "PUT" && response.ok());
  await page.locator("fieldset", { hasText: "The board of directors" }).getByLabel("will review", { exact: true }).check();
  await saved;
  await page.reload();
  await expect(page.getByText(/RESUMED/)).toBeVisible();
  await expect(page.locator("fieldset", { hasText: "The board of directors" }).getByLabel("will review", { exact: true })).toBeChecked();
  await page.locator("fieldset", { hasText: "qualified for the position" }).getByLabel("highly", { exact: true }).check();
  await page.getByRole("button", { name: "Submit exam" }).click();
  await expect(page).toHaveURL(/\/results\//);
  await expect(page.getByRole("heading", { name: "Result: 2/15" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Result: 2/15" })).toBeVisible();
  await expect(page.getByText("Review your attempt")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: "TOEIC Part 5 practice: Incomplete sentences" })).toBeVisible();
});

test("the TOEIC full mock has all seven parts and two hundred questions", async ({ page }) => {
  const start = await page.request.post("/api/exam-engine/toeic-full-mock-1/attempts");
  expect(start.ok()).toBeTruthy();
  const body = await start.json() as { exam: { totalQuestions: number; parts: Array<{ partNumber: number; questions: unknown[] }> } };
  expect(body.exam.totalQuestions).toBe(200);
  expect(body.exam.parts.map((part) => [part.partNumber, part.questions.length])).toEqual([[1, 6], [2, 25], [3, 39], [4, 30], [5, 30], [6, 16], [7, 54]]);
});

test("IELTS Listening and Reading tests run through the same engine", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  for (const slug of ["ielts-listening-test-1", "ielts-reading-test-1"]) {
    await page.goto(`/exams/${slug}`);
    await expect(page.getByText("0/", { exact: false }).first()).toBeVisible();
    await page.getByRole("button", { name: "Submit exam" }).click();
    await expect(page.getByRole("heading", { name: "Result: 0/40" })).toBeVisible();
  }
});
