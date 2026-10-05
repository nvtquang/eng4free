import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.request.post("/api/locale", { data: { locale: "en" } }); });

test("admin edits a word in the vocabulary catalogue, with rules and history", async ({ page }) => {
  await page.goto("/admin/vocabulary?level=B1&status=PUBLISHED");
  await expect(page.getByRole("heading", { name: "Vocabulary", exact: true })).toBeVisible();
  const first = page.locator('table a[href^="/admin/vocabulary/"]').first();
  const headword = (await first.textContent())!.trim();
  await first.click();
  await expect(page.getByRole("heading", { name: headword, exact: true })).toBeVisible();

  const example = page.getByLabel("Example sentence");
  await example.fill("Far too short.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/too short|does not use/u);

  await example.fill(`Our teacher explained the word ${headword} with a clear example.`);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  await page.reload();
  await expect(page.getByText(/^UPDATE · e2e-admin@local\.test/u).first()).toBeVisible();
  await expect(page.getByLabel("Example sentence")).toHaveValue(`Our teacher explained the word ${headword} with a clear example.`);
});

test("admin excludes a word, which archives it", async ({ page }) => {
  await page.goto("/admin/vocabulary?level=C1&status=PUBLISHED");
  await page.locator('table a[href^="/admin/vocabulary/"]').first().click();
  await page.getByRole("button", { name: "Exclude this word" }).click();
  await page.getByLabel("Reason (required)").fill("E2E: wrong sense for learners");
  await page.getByRole("button", { name: "Confirm exclusion" }).click();
  await expect(page.getByText("This word is excluded.")).toBeVisible();
  await expect(page.getByText(/^EXCLUDE · e2e-admin@local\.test/u)).toBeVisible();
});
