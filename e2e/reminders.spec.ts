import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const repoRoot = resolve(__dirname, "..");
const outbox = (email: string, kind?: string) => resolve(repoRoot, "apps/web/.local-mail", `${email.toLowerCase().replace(/[^a-z0-9@._-]/gu, "_")}${kind ? `.${kind}` : ""}.json`);
type Mail = { subject: string; text: string; headers: Record<string, string>; url?: string; unsubscribeUrl?: string; oneClickUrl?: string; sentAt: string };
const readMail = (email: string, kind?: string) => JSON.parse(readFileSync(outbox(email, kind), "utf8")) as Mail;

/** Runs the hourly job as cron would, at 19:05 Vietnam time today. */
function runReminders() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  return execFileSync(pnpm, ["-s", "maintenance:reminders", "--", `--at=${today}T19:05:00+07:00`], { cwd: repoRoot, encoding: "utf8", shell: process.platform === "win32", env: { ...process.env, E4F_MAIL_OUTBOX: "true", APP_URL: "http://127.0.0.1:3100" } });
}

async function signInByEmail(page: Page, email: string) {
  rmSync(outbox(email), { force: true });
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Gửi link đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "Kiểm tra hộp thư của bạn" })).toBeVisible();
  await expect.poll(() => existsSync(outbox(email))).toBe(true);
  await page.goto(readMail(email).url!);
  await expect(page).toHaveURL(/\/dashboard$/u);
}

test("a signed-in learner turns on email reminders, gets one a day and can unsubscribe", async ({ page }) => {
  test.setTimeout(120_000);
  const email = `reminder-${Date.now()}@example.com`;
  rmSync(outbox(email, "reminder"), { force: true });
  await signInByEmail(page, email);
  expect((await page.request.post("/api/onboarding", { data: { goal: "ielts", minutesPerDay: 20, selfLevel: "B1" } })).ok()).toBeTruthy();

  // Today invites a learner who has not chosen yet.
  await page.goto("/today");
  await page.getByRole("link", { name: "Bật email nhắc học" }).click();
  await expect(page).toHaveURL(/\/profile#reminders$/u);
  const card = page.locator("#reminders");
  await expect(card).toContainText(email);
  await card.getByLabel("Gửi email nhắc học cho tôi").check();
  await card.getByLabel("Giờ nhận (giờ Việt Nam)").selectOption("19");
  await card.getByRole("button", { name: "Lưu" }).click();
  await expect(card.getByText("Đã lưu.")).toBeVisible();
  await page.goto("/today");
  await expect(page.getByRole("link", { name: "Bật email nhắc học" })).toHaveCount(0);

  // The hourly job sends today's reminder once, with a one-click unsubscribe header.
  expect(runReminders()).toMatch(/[1-9]\d* sent/u);
  const mail = readMail(email, "reminder");
  expect(mail.subject).toContain("Hôm nay học tiếng Anh");
  expect(mail.text).toContain("http://127.0.0.1:3100/today");
  expect(mail.text).toContain("Bài tiếp theo:");
  expect(mail.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  runReminders();
  expect(readMail(email, "reminder").sentAt).toBe(mail.sentAt);

  // A forged one-click request is refused; the unsubscribe page asks before turning reminders off.
  expect((await page.request.post(`${mail.oneClickUrl!.split("&t=")[0]}&t=forged`)).status()).toBe(400);
  await page.goto(mail.unsubscribeUrl!);
  await page.getByRole("button", { name: "Tắt email nhắc học" }).click();
  await expect(page.getByRole("heading", { name: "Đã tắt email nhắc học" })).toBeVisible();
  await page.goto("/profile");
  await expect(page.locator("#reminders").getByLabel("Gửi email nhắc học cho tôi")).not.toBeChecked();
  expect((await page.request.post(mail.oneClickUrl!)).ok()).toBeTruthy();
});

test("guests are asked to sign in before reminders can be turned on", async ({ page }) => {
  await page.request.post("/api/onboarding", { data: { goal: "toeic", minutesPerDay: 15, selfLevel: "A2" } });
  await page.goto("/profile");
  await expect(page.locator("#reminders")).toContainText("Đăng nhập để nhận email nhắc học");
  expect((await page.request.put("/api/reminders", { data: { enabled: true, hour: 19 } })).status()).toBe(401);
});
