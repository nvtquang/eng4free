import { expect, test } from "@playwright/test";

test("pronunciation has usable IPA listening and shadowing controls", async ({ page }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  await page.goto("/pronunciation");
  await expect(page.getByRole("heading", { name: "IPA chart" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Listen" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Listen to the pair" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Play target sentence" })).toBeVisible();
});

test("anonymous learner identity is created before the first activity", async ({ page }) => {
  await page.goto("/");
  await expect.poll(async () => (await page.context().cookies()).some((cookie) => cookie.name === "e4f_guest_id")).toBeTruthy();
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Tiến độ học của bạn|Your learning progress/ })).toBeVisible();
});
