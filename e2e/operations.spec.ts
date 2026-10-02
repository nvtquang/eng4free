import { expect, test } from "@playwright/test";

test("pages carry a Content-Security-Policy built at run time", async ({ page }) => {
  const response = await page.goto("/toeic");
  const policy = response?.headers()["content-security-policy"] ?? "";
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain("frame-ancestors 'none'");
  expect(response?.headers()["strict-transport-security"]).toContain("max-age=");
});

test("browser errors and product events reach the admin operations page", async ({ page }) => {
  const message = `E2E browser error ${Date.now()}`;
  expect((await page.request.post("/api/telemetry/error", { data: { message, path: "/toeic" } })).ok()).toBeTruthy();
  expect((await page.request.post("/api/telemetry/error", { data: { path: "/toeic" } })).status()).toBe(400);
  expect((await page.request.post("/api/onboarding", { data: { goal: "ielts", minutesPerDay: 20, selfLevel: "B1" } })).ok()).toBeTruthy();

  // The E2E server accepts the test admin header (playwright.config.ts).
  await page.goto("/admin/operations");
  await expect(page.getByRole("heading", { name: "Vận hành", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Phễu người học" })).toBeVisible();
  await expect(page.getByText("Hoàn tất thiết lập").first()).toBeVisible();
  await expect(page.getByText(message)).toBeVisible();
  await expect(page.getByText("onboarding_completed", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Ngân sách · Nhận xét và trợ giảng$/u)).toBeVisible();
});

test("the operations page is for admins only", async ({ browser }) => {
  // New contexts inherit the suite's admin header, so send a wrong token instead.
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3100", extraHTTPHeaders: { "x-e4f-admin-token": "not-the-token" } });
  const page = await context.newPage();
  await page.goto("/admin/operations");
  await expect(page.getByRole("heading", { name: "Cần quyền quản trị." })).toBeVisible();
  await context.close();
});
