import { expect, test } from "@playwright/test";

test("a new learner goes from the home page to their second lesson", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "Get started" }).first().click();
  await expect(page).toHaveURL(/\/onboarding$/u);

  await page.getByRole("button", { name: "Everyday communication" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^15/u }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "A1", exact: true }).click();
  await page.getByRole("button", { name: "Use this level" }).click();
  await expect(page.getByText("Suggested level")).toBeVisible();
  await page.getByRole("button", { name: "Start learning" }).click();

  await expect(page).toHaveURL(/\/today$/u);
  await expect(page.getByRole("heading", { name: "Today", exact: true })).toBeVisible();
  await expect(page.getByText("0/15 min")).toBeVisible();
  const continueLink = page.getByRole("link", { name: /^Continue: /u });
  const firstTitle = (await continueLink.textContent())!.replace(/^Continue: /u, "");
  await continueLink.click();
  await expect(page.getByRole("heading", { level: 1, name: firstTitle })).toBeVisible();

  for (const group of await page.locator("fieldset").all()) await group.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await expect(page.getByText("Completion saved")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Today" })).toBeVisible();
  const next = page.getByRole("link", { name: /^Next lesson: /u });
  const nextTitle = (await next.textContent())!.replace(/^Next lesson: /u, "");
  expect(nextTitle).not.toBe(firstTitle);
  await next.click();
  await expect(page.getByRole("heading", { level: 1, name: nextTitle })).toBeVisible();

  // The path marks the first lesson done and the second as next; Today now suggests it too.
  await page.goto("/learn");
  await expect(page.getByRole("link", { name: "A1 ★" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("1/", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(`^${firstTitle}.*Done$`, "u") })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(`^${nextTitle}.*Up next$`, "u") })).toBeVisible();
  await page.goto("/today");
  await expect(page.getByRole("link", { name: `Continue: ${nextTitle}` })).toBeVisible();
  await expect(page.getByText(/^([1-9]\d*)\/15 min$/u)).toBeVisible();
});

test("the header has four sections and an account menu with the learning profile", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  await page.request.post("/api/onboarding", { data: { goal: "ielts", minutesPerDay: 20, selfLevel: "B1" } });
  await page.goto("/today");
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(nav.getByRole("link")).toHaveText(["Today", "Path", "Practice", "Exam prep"]);
  await expect(nav.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Exam prep" }).click();
  await expect(page.getByRole("link", { name: "IELTS", exact: true })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Practice" }).click();
  await expect(page.getByRole("heading", { name: "Practise by skill" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link")).toHaveCount(8);

  await page.getByRole("button", { name: "Account" }).click();
  await expect(page.getByRole("menuitem", { name: "Progress" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Learning profile" }).click();
  await expect(page.getByRole("heading", { name: "Learning profile" })).toBeVisible();
  await page.getByRole("button", { name: "TOEIC preparation" }).click();
  await page.getByRole("button", { name: "30 min/day" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.goto("/exam-prep");
  await expect(page.getByRole("link", { name: "TOEIC", exact: true })).toHaveAttribute("aria-current", "page");
});
