import { expect, test } from "@playwright/test";

/**
 * Demo scenario B (docs/roadmap/demo-acceptance.md): a TOEIC learner browses the catalogue,
 * practises Part 1 and Part 3 with real recordings, takes the mini test (timer, autosave,
 * resume after a reload), reviews the estimated score and the results by part, asks the AI
 * tutor about a wrong answer and finds the attempt in the history. Runs in Vietnamese.
 */
test("Kịch bản B: người luyện TOEIC", async ({ page }) => {
  // B1: the catalogue groups full mock, mini test and part practice.
  await page.goto("/toeic");
  await expect(page.getByRole("heading", { name: "Luyện TOEIC", exact: true })).toBeVisible();
  for (const mode of ["Thi thử", "Mini test", "Luyện tập"]) await expect(page.getByText(mode, { exact: true }).first()).toBeVisible();
  expect(await page.getByRole("link", { name: "Bắt đầu làm bài" }).count()).toBeGreaterThanOrEqual(9);

  // B2: Part 1 has a photograph and a recording; Part 3 conversations have recordings too.
  await page.goto("/exams/toeic-part-1-practice");
  const photo = page.getByRole("img", { name: "Photograph for question 1" });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator("audio").first()).toHaveAttribute("src", /\/demo-media\/audio\/.+\.mp3$/u);
  await page.goto("/exams/toeic-part-3-practice");
  await expect(page.locator('audio[src$=".mp3"]')).toHaveCount(3);

  // B3: the mini test has a timer, saves answers as they are given and resumes after a reload.
  await page.goto("/exams/toeic-mini-test-1");
  await expect(page.getByRole("heading", { name: "TOEIC Mini Test 1" })).toBeVisible();
  await expect(page.getByText("0/22 đã trả lời")).toBeVisible();
  await expect(page.getByText(/^\d{1,3}:\d{2}$/u).first()).toBeVisible();
  const saved = page.waitForResponse((response) => response.url().includes("/answers") && response.request().method() === "PUT" && response.ok());
  await page.locator("fieldset").first().getByRole("radio").nth(1).check();
  await saved;
  await page.reload();
  await expect(page.getByText("TIẾP TỤC")).toBeVisible();
  await expect(page.locator("fieldset").first().getByRole("radio").nth(1)).toBeChecked();
  await expect(page.getByText("1/22 đã trả lời")).toBeVisible();
  for (const group of (await page.locator("fieldset").all()).slice(1)) await group.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Nộp bài" }).click();

  // B4: an estimated TOEIC score and the results by part.
  await expect(page).toHaveURL(/\/exams\/toeic-mini-test-1\/results\//u);
  await expect(page.getByRole("heading", { name: /^Kết quả: \d+\/22$/u })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Điểm quy đổi ước tính" })).toBeVisible();
  await expect(page.getByText("Tổng", { exact: true })).toBeVisible();
  const byPart = page.getByRole("heading", { name: "Kết quả theo phần" }).locator("..");
  await expect(byPart.getByRole("listitem")).toHaveCount(5);
  await expect(byPart.getByText(/^\d+\/\d+ · \d+%$/u).first()).toBeVisible();

  // B5: the AI tutor explains a wrong answer; without an AI key it shows the official explanation honestly.
  const wrong = page.locator("div", { has: page.getByText("0/1 điểm", { exact: true }) }).getByRole("button", { name: "Hỏi trợ giảng AI" }).first();
  await wrong.click();
  await expect(page.getByText("Lời giải chính thức").first()).toBeVisible();

  // B6: the attempt is in the history, reachable from the TOEIC page and the dashboard.
  await page.goto("/toeic");
  await page.getByRole("link", { name: "Lịch sử làm đề" }).click();
  await expect(page.getByText("TOEIC Mini Test 1").first()).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /TOEIC Mini Test 1/u }).first()).toBeVisible();

  // B7: the full mock has all 200 questions.
  await page.goto("/exams/toeic-full-mock-1");
  await expect(page.getByText("0/200 đã trả lời")).toBeVisible();
});
