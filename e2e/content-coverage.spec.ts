import { expect, test, type Page } from "@playwright/test";

async function useEnglish(page: Page) { await page.request.post("/api/locale", { data: { locale: "en" } }); }
const openLinks = (page: Page) => page.getByRole("link", { name: "Open exercise" });

test("lesson pages list several lessons for every skill", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/grammar");
  expect(await openLinks(page).count()).toBeGreaterThanOrEqual(24);
  for (const path of ["/skills/reading", "/skills/listening", "/skills/speaking", "/skills/writing"]) {
    await page.goto(path);
    expect(await openLinks(page).count(), path).toBeGreaterThanOrEqual(6);
  }
  await page.goto("/learn");
  for (const level of ["a1", "a2", "b1", "b2", "c1", "c2"]) expect(await page.locator(`a[href^="/learn/${level}/"]`).count(), level).toBeGreaterThanOrEqual(8);
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
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText("2");
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
