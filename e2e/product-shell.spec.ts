import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

/** The E2E server writes sign-in emails here (E4F_MAIL_OUTBOX) instead of sending them. */
function outboxFile(email: string) {
  return resolve(__dirname, "../apps/web/.local-mail", `${email.toLowerCase().replace(/[^a-z0-9@._-]/gu, "_")}.json`);
}

async function completeLesson(page: Page) {
  await page.goto("/learn/c1/nuance");
  for (const group of await page.locator("fieldset").all()) await group.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Hoàn thành bài học" }).click();
  await expect(page.getByText("Đã lưu hoàn thành")).toBeVisible();
}

test("unknown pages show a translated 404 inside the site layout", async ({ page }) => {
  const response = await page.goto("/khong-co-trang-nay");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang này" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();
  await page.getByRole("link", { name: "Về trang chủ" }).click();
  await expect(page).toHaveURL(/\/$/u);
  expect((await page.goto("/exams/khong-co-de-nay"))?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang này" })).toBeVisible();
});

test("pages have their own title, canonical URL, hreflang and share image", async ({ page }) => {
  await page.goto("/toeic");
  await expect(page).toHaveTitle("Luyện thi TOEIC Listening & Reading · English 4 Free");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/toeic$/u);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/toeic\?lang=en$/u);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og-image\.png$/u);
  const image = await page.request.get((await page.locator('meta[property="og:image"]').getAttribute("content"))!.replace(/^https?:\/\/[^/]+/u, ""));
  expect(image.headers()["content-type"]).toContain("image/png");

  await page.goto("/learn/b2/grammar-passive-voice");
  await expect(page).toHaveTitle(/\(B2\) · English 4 Free$/u);
  await page.goto("/exams/toeic-mini-test-1");
  await expect(page).toHaveTitle("TOEIC Mini Test 1 · English 4 Free");
  await page.goto("/dashboard");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/u);
});

test("?lang=en serves the English version and keeps it", async ({ page }) => {
  await page.goto("/toeic?lang=en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "TOEIC practice", exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/toeic\?lang=en$/u);
  await page.goto("/ielts");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/ielts?lang=vi");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("the sitemap lists lessons and tests with their English alternates", async ({ page }) => {
  const xml = await (await page.request.get("/sitemap.xml")).text();
  expect(xml).toMatch(/<loc>[^<]+\/learn\/a1\/[^<]+<\/loc>/u);
  expect(xml).toContain("/exams/toeic-mini-test-1</loc>");
  expect(xml).toContain('hreflang="en" href="http');
  expect(xml).toContain("/terms</loc>");
  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /dashboard");
});

test("terms are linked from the footer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Điều khoản" }).click();
  await expect(page.getByRole("heading", { name: "Điều khoản sử dụng" })).toBeVisible();
  await expect(page).toHaveTitle("Điều khoản sử dụng · English 4 Free");
});

test("a guest downloads their data and deletes it", async ({ page }) => {
  await completeLesson(page);
  await page.goto("/profile");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Tải dữ liệu về" }).click();
  const file = await (await download).path();
  const data = JSON.parse(readFileSync(file, "utf8")) as { account: unknown; learning: { completedLessons: Array<{ slug: string }>; activity: unknown[] } };
  expect(data.account).toBeNull();
  expect(data.learning.completedLessons.map((lesson) => lesson.slug)).toContain("nuance");
  expect(data.learning.activity.length).toBeGreaterThan(0);

  const confirm = page.getByRole("button", { name: "Xoá vĩnh viễn" });
  await expect(confirm).toBeDisabled();
  await page.getByLabel("Gõ “xoá” để xác nhận").fill("xoá");
  await confirm.click();
  await expect(page).toHaveURL(/\/$/u);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Chưa có hoạt động học" })).toBeVisible();
});

test("email sign-in sends a one-time link, keeps guest progress and can delete the account", async ({ page }) => {
  const email = `learner-${Date.now()}@example.com`;
  rmSync(outboxFile(email), { force: true });
  await completeLesson(page);

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Gửi link đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "Kiểm tra hộp thư của bạn" })).toBeVisible();
  await expect.poll(() => existsSync(outboxFile(email))).toBe(true);
  const { url } = JSON.parse(readFileSync(outboxFile(email), "utf8")) as { url: string };
  await page.goto(url);
  await expect(page).toHaveURL(/\/dashboard$/u);
  await expect(page.getByText("Hoàn thành bài nghe").first()).toBeVisible();
  // The link works only once.
  await page.context().clearCookies();
  await page.goto(url);
  await expect(page.getByText(/^Chưa đăng nhập được\./u)).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Gửi link đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "Kiểm tra hộp thư của bạn" })).toBeVisible();
  await expect.poll(() => (JSON.parse(readFileSync(outboxFile(email), "utf8")) as { url: string }).url).not.toBe(url);
  await page.goto((JSON.parse(readFileSync(outboxFile(email), "utf8")) as { url: string }).url);
  await expect(page).toHaveURL(/\/dashboard$/u);
  // Signing in again reaches the same learner, so the earlier lesson is still there.
  await expect(page.getByText("Hoàn thành bài nghe").first()).toBeVisible();

  const exported = await page.request.get("/api/account/export");
  expect(((await exported.json()) as { account: { email: string } }).account.email).toBe(email);
  await page.goto("/profile");
  await page.getByLabel("Gõ “xoá” để xác nhận").fill("xoá");
  await page.getByRole("button", { name: "Xoá vĩnh viễn" }).click();
  await expect(page).toHaveURL(/\/$/u);
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  // Signed out, and nothing of the deleted account is left (the browser may already be a new guest).
  const after = await (await page.request.get("/api/account/export")).json() as { account?: unknown };
  expect(after.account ?? null).toBeNull();
});
