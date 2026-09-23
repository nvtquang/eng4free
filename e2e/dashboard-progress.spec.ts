import { expect, test } from "@playwright/test";

test("lesson completion produces idempotent XP isolated to its guest", async ({ page, browser }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  await page.goto("/learn/c1/nuance");
  for (const fieldset of await page.locator("fieldset").all()) {
    await fieldset.locator("input[type=radio]").first().check();
  }
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await expect(page.getByText("Completion saved")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByText("Lesson completed", { exact: true })).toBeVisible();
  await expect(page.getByText("Listening completed", { exact: true })).toBeVisible();
  await expect(page.getByText("40", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("40", { exact: true })).toBeVisible();

  await page.goto("/learn/c1/nuance");
  for (const fieldset of await page.locator("fieldset").all()) {
    await fieldset.locator("input[type=radio]").first().check();
  }
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await page.goto("/dashboard");
  await expect(page.getByText("40", { exact: true })).toBeVisible();

  const isolatedContext = await browser.newContext({
    baseURL: "http://127.0.0.1:3100",
    extraHTTPHeaders: { "x-e4f-admin-token": "local-e2e-only" }
  });
  const isolatedPage = await isolatedContext.newPage();
  await isolatedPage.request.post("/api/locale", { data: { locale: "en" } });
  await isolatedPage.goto("/dashboard");
  await expect(isolatedPage.getByRole("heading", { name: "No learning activity yet" })).toBeVisible();
  await isolatedContext.close();
});
