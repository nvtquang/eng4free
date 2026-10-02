import { expect, test } from "@playwright/test";

/**
 * Demo scenario C (docs/roadmap/demo-acceptance.md): an IELTS learner finds all four skills,
 * takes the Reading and Listening tests, gets band estimates, drafts and submits a Task 2 essay,
 * and records a Part 2 long turn after the one-minute preparation. The demo account then shows
 * the same flows with feedback history. Runs in Vietnamese, without an AI key, so every AI
 * screen must say honestly that feedback is unavailable.
 */
test("Kịch bản C: người luyện IELTS", async ({ page, context }) => {
  // C1: all four skills are offered.
  await page.goto("/ielts");
  for (const href of ["/exams/ielts-listening-test-1", "/exams/ielts-reading-test-1", "/ielts/writing", "/ielts/speaking"]) {
    await expect(page.locator(`main a[href^="${href}"]`).first()).toBeVisible();
  }

  // C2: Reading mixes True/False/Not Given, matching and gap-fill questions; C4: a band estimate.
  await page.goto("/exams/ielts-reading-test-1");
  await expect(page.getByText(/^0\/\d+ đã trả lời$/u)).toBeVisible();
  await expect(page.getByRole("main").getByRole("combobox").first()).toBeVisible();
  await expect(page.getByRole("main").getByRole("textbox").first()).toBeVisible();
  expect(await page.getByRole("radio").count()).toBeGreaterThan(10);
  await page.getByRole("main").getByRole("textbox").first().fill("library");
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByRole("heading", { name: /^Kết quả: \d+\/40$/u })).toBeVisible();
  await expect(page.getByText(/^Đọc · Band$/u)).toBeVisible();

  // C3: Listening plays generated recordings with a play limit.
  await page.goto("/exams/ielts-listening-test-1");
  await expect(page.locator('audio[src$=".mp3"]').first()).toBeAttached();
  await expect(page.getByRole("button", { name: "Phát audio (0/2)" })).toHaveCount(4);
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByRole("heading", { name: /^Kết quả: \d+\/40$/u })).toBeVisible();
  await expect(page.getByText(/^Nghe · Band$/u)).toBeVisible();

  // C5: a Task 2 essay is drafted, survives a reload, and is submitted with its revision history.
  await page.goto("/ielts/writing?prompt=task-2-public-transport-or-roads");
  const editor = page.locator("textarea");
  await editor.fill("Governments should invest in public transport because buses and trains move more people with less pollution.");
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByText("Đã lưu", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Bản nháp", { exact: true }).first()).toBeVisible();
  await page.locator("aside").getByRole("button").first().click();
  await expect(editor).toHaveValue(/invest in public transport/u);
  await editor.fill("Governments should invest in public transport because buses and trains move more people with less pollution. New roads soon fill with traffic again.");
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Đã nộp", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Phiên bản: 2/u)).toBeVisible();
  await expect(page.getByText("Chưa thể tạo phản hồi AI. Bài đã được lưu trong lịch sử.")).toBeVisible();

  // C6: Part 2 shows the cue card, a one-minute preparation timer, then a speaking clock capped at two minutes.
  await context.grantPermissions(["microphone"], { origin: "http://127.0.0.1:3100" });
  await page.goto("/ielts/speaking?set=speaking-hometown-and-places");
  await expect(page.getByText("Describe a place in your town or city that you enjoy visiting.")).toBeVisible();
  await page.getByRole("button", { name: "Chuẩn bị (1:00)" }).click();
  await expect(page.getByRole("timer").first()).toHaveText(/0:5\d|1:00/u);
  await page.getByRole("button", { name: "Tôi đã sẵn sàng" }).click();
  await page.getByRole("button", { name: "Nhấn để nói" }).first().click();
  await expect(page.getByRole("timer").first()).toHaveText(/^0:0\d \/ 2:00$/u);
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Dừng ghi âm" }).click();
  await page.getByRole("button", { name: "Lưu bản ghi" }).click();
  await expect(page.getByText("Bản ghi đã được lưu. Nhận xét AI tạm thời chưa có; bạn vẫn có thể nghe lại bản ghi trong lịch sử.")).toBeVisible();

  // The demo account's history shows real feedback on its essay, across two revisions.
  await page.goto("/login");
  await page.getByRole("button", { name: "Vào tài khoản demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/u);
  await page.goto("/ielts/writing?prompt=task-2-public-transport-or-roads");
  const reviewed = page.locator("aside article", { hasText: "Phản hồi luyện tập từ AI" }).first();
  await expect(reviewed).toContainText("Đã nộp");
  await expect(reviewed).toContainText("Phiên bản: 2");
  await reviewed.getByRole("button", { name: "Mở lại" }).click();
  await expect(page.getByText(/^Không phải band IELTS chính thức: /u)).toBeVisible();
});
