import { expect, test, type Page } from "@playwright/test";

async function useEnglish(page: Page) { await page.request.post("/api/locale", { data: { locale: "en" } }); }
const openLinks = (page: Page) => page.getByRole("link", { name: "Open exercise" });

test("lesson pages list several lessons for every skill", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/grammar");
  expect(await openLinks(page).count()).toBeGreaterThanOrEqual(24);
  // Reading and Listening show one CEFR level at a time, with more lessons at the lower levels.
  for (const path of ["/skills/reading", "/skills/listening"]) {
    for (const [level, minimum] of [["A1", 6], ["A2", 5], ["B1", 4], ["B2", 3], ["C1", 2], ["C2", 2]] as const) {
      await page.goto(`${path}?level=${level}`);
      expect(await openLinks(page).count(), `${path} ${level}`).toBeGreaterThanOrEqual(minimum);
    }
  }
  // Speaking and Writing are topic browsers: category tabs, then topics that open one at a time.
  for (const path of ["/skills/speaking", "/skills/writing"]) {
    await page.goto(path);
    expect(await page.locator("button[aria-pressed]").count(), path).toBeGreaterThanOrEqual(10);
    expect(await page.locator("button[aria-expanded]").count(), path).toBeGreaterThanOrEqual(4);
  }
  // The path shows one level at a time.
  for (const level of ["a1", "a2", "b1", "b2", "c1", "c2"]) {
    await page.goto(`/learn?level=${level.toUpperCase()}`);
    expect(await page.locator(`ol a[href^="/learn/${level}/"]`).count(), level).toBeGreaterThanOrEqual(8);
  }
});

test("a D3 grammar lesson has explanation, examples and practice", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/learn/b2/grammar-passive-voice");
  await expect(page.getByRole("heading", { name: "Form and use" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Common mistakes" })).toBeVisible();
  expect(await page.locator("fieldset").count()).toBe(8);
});

test("vocabulary shows sourced meanings, paging and attribution", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/vocabulary?level=B1");
  expect(await page.locator('nav a[href^="/vocabulary?level=B1&page="]').count()).toBeGreaterThanOrEqual(5);
  await expect(page.getByText(/English Wiktionary \(via kaikki\.org\) \(CC BY-SA 4\.0\)/u)).toBeVisible();
  await expect(page.getByRole("link", { name: "English Wiktionary (via kaikki.org)" }).first()).toHaveAttribute("href", /en\.wiktionary\.org\/wiki\//u);
  await page.goto("/vocabulary?level=B1&page=2");
  await expect(page.locator('nav a[aria-current="page"][href^="/vocabulary"]')).toHaveText("2");
});

test("IELTS Writing and Speaking offer several tasks", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/ielts/writing");
  expect(await page.locator('a[href^="/ielts/writing?prompt="]').count()).toBeGreaterThanOrEqual(6);
  await page.goto("/ielts/writing?prompt=task-1-broadband-households");
  await expect(page.getByRole("img", { name: /Line graph: broadband households/u })).toBeVisible();
  await expect(page.getByText("The graph below shows the percentage of households")).toBeVisible();
  await page.goto("/ielts/speaking");
  expect(await page.locator('a[href^="/ielts/speaking?set="]').count()).toBeGreaterThanOrEqual(5);
  await expect(page.getByText("You should say:")).toBeVisible();
});

test("exam catalogues are no longer thin", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/toeic");
  expect(await page.getByRole("link", { name: "Start attempt" }).count()).toBeGreaterThanOrEqual(8);
  await expect(page.getByText("TOEIC Full Mock Test 1")).toBeVisible();
  await page.goto("/ielts");
  expect(await page.getByRole("link", { name: "Start attempt" }).count()).toBeGreaterThanOrEqual(4);
});
