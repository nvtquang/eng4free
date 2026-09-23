import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 375, height: 667 }, { width: 390, height: 844 }]) {
  test(`navigation and lesson remain usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/learn/a1/introduce-yourself");
    await expect(page.getByRole("heading", { name: /Introduce yourself|Giới thiệu bản thân/ })).toBeVisible();
    await page.getByRole("button", { name: /Open menu|Mở menu/ }).click();
    await expect(page.getByRole("navigation", { name: /Mobile navigation|Điều hướng di động/ })).toBeVisible();
  });
}

test("locale switch renders Vietnamese and English navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "Learn", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "VI", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("exam and CMS forms follow Vietnamese and English locale", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "vi" } });
  await page.goto("/exams/ielts-reading-demo");
  await expect(page.getByRole("button", { name: "Nộp bài" })).toBeVisible();
  await expect(page.getByText("Phần 1", { exact: true }).first()).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Quy trình nội dung" })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Content workflow" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lesson Builder" })).toBeVisible();
});
