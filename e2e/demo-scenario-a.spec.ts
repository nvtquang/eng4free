import { expect, test } from "@playwright/test";

/**
 * Demo scenario A (docs/roadmap/demo-acceptance.md): a beginner, as a guest, takes the placement
 * test, sets a goal, studies from Today, saves a word from the lesson and reviews it, retries a
 * mistake, checks progress, then signs in and keeps everything. It runs in Vietnamese, the
 * language the demo is given in.
 */
test("Kịch bản A: người mới bắt đầu, từ trang chủ đến tài khoản", async ({ page }) => {
  // A1–A3: placement test and goal, started from the home page.
  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "Bắt đầu học" }).first().click();
  await expect(page).toHaveURL(/\/onboarding$/u);
  await page.getByRole("button", { name: "Giao tiếp hằng ngày" }).click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: /^15/u }).click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Làm bài kiểm tra xếp lớp" }).click();
  for (let question = 1; question <= 20; question++) {
    await expect(page.getByText(`Câu ${question}/20`)).toBeVisible();
    await page.getByRole("radio").nth(1).check();
    await page.getByRole("button", { name: "Tiếp tục" }).click();
  }
  await expect(page.getByRole("heading", { name: "Nói và Viết: tự đánh giá" })).toBeVisible();
  await page.getByRole("group", { name: "Nói" }).getByRole("radio").first().check();
  await page.getByRole("group", { name: "Viết" }).getByRole("radio").first().check();
  await page.getByRole("button", { name: "Xem kết quả" }).click();
  await expect(page.getByText("Trình độ đề xuất")).toBeVisible();
  await expect(page.getByText(/Trả lời đúng \d+\/20 câu/u)).toBeVisible();
  await page.getByRole("button", { name: "Bắt đầu học" }).click();

  // A4: Today suggests the next lesson and shows the daily goal; the profile survives a reload.
  await expect(page).toHaveURL(/\/today$/u);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hôm nay", exact: true })).toBeVisible();
  await expect(page.getByText("0/15 phút")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Học tiếp: /u })).toBeVisible();

  // A5: an A2 listening lesson with a real recording; completing it earns XP.
  await page.goto("/learn?level=A2");
  await page.getByRole("link", { name: /^Listen: booking a table by phone/u }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Listen: booking a table by phone" })).toBeVisible();
  await expect(page.locator("audio").first()).toHaveAttribute("src", /\/demo-media\/audio\/.+\.mp3$/u);
  // Answer keys cycle through the positions, so always taking the first option leaves some mistakes.
  for (const group of await page.locator("fieldset").all()) await group.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Hoàn thành bài học" }).click();
  await expect(page.getByText("Đã lưu hoàn thành")).toBeVisible();
  await expect(page.getByText(/câu sai đã được thêm vào sổ lỗi sai/u)).toBeVisible();

  // A6: save a word from the lesson, then review it with flashcards.
  const words = page.getByRole("region", { name: "Từ mới trong bài" });
  await expect(words).toBeVisible();
  const firstWord = words.getByRole("listitem").first();
  const headword = (await firstWord.locator("p").first().innerText()).trim();
  await firstWord.getByRole("button", { name: "Thêm vào sổ từ" }).click();
  await expect(firstWord.getByRole("button", { name: "Đã thêm" })).toBeDisabled();
  await words.getByRole("link", { name: /Ôn sổ từ/u }).click();
  await expect(page).toHaveURL(/\/vocabulary\?deck=due$/u);
  await expect(page.getByRole("status").filter({ hasText: "từ trong sổ từ đang đến hạn ôn" })).toContainText("1 từ");
  await expect(page.getByText(headword, { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Tốt" }).click();
  await expect(page.getByText("Đã ôn: 1")).toBeVisible();

  // A7: retry a mistake from the notebook.
  await page.goto("/mistakes");
  await expect(page.getByRole("heading", { name: "Sổ lỗi sai" })).toBeVisible();
  await expect(page.getByText(/\d+ câu cần luyện/u)).toBeVisible();
  await page.getByRole("main").getByRole("radio").first().check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await expect(page.getByText(/Chính xác! Đã xoá khỏi sổ lỗi\.|Chưa đúng\./u)).toBeVisible();

  // A8: the dashboard reflects what was just done.
  await page.goto("/dashboard");
  await expect(page.getByText("Hoàn thành bài nghe").first()).toBeVisible();
  await expect(page.getByText("1 ngày", { exact: true })).toBeVisible();

  // A9: signing in keeps the guest's progress (the demo account stands in for Google sign-in).
  await page.goto("/login");
  await page.getByRole("button", { name: "Vào tài khoản demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/u);
  await page.goto("/learn?level=A2");
  await expect(page.getByRole("link", { name: /^Listen: booking a table by phone.*Đã học$/u })).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText("Hoàn thành bài nghe").first()).toBeVisible();
});
