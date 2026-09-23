import { expect, test } from "@playwright/test";

test("learner receives no answer key before submit", async ({ request }) => {
  const response = await request.post("/api/exams/d049d8e2-0a0d-4303-95fb-d4f97126dc53/attempts");
  expect(response.ok()).toBeTruthy();
  const payload = await response.json() as { exam: unknown };
  expect(JSON.stringify(payload.exam)).not.toContain("correctOptionId");
});

test("TOEIC Part 5 can start and display its countdown", async ({ page }) => {
  await page.goto("/toeic/practice/part-5");
  await expect(page.getByRole("heading", { name: "TOEIC Part 5 Starter" })).toBeVisible();
  await expect(page.locator(".timer")).toHaveText(/03:0[0-9]/);
});
