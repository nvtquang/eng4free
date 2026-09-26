import { expect, test, type Page } from "@playwright/test";

async function useEnglish(page: Page) { await page.request.post("/api/locale", { data: { locale: "en" } }); }

test("listening attempts receive generated recordings, never the script", async ({ page }) => {
  for (const slug of ["ielts-practice-test-1", "ielts-skills-drill-dictation-order", "toeic-full-demo"]) {
    const start = await page.request.post(`/api/exam-engine/${slug}/attempts`);
    expect(start.ok()).toBeTruthy();
    const body = JSON.stringify(await start.json());
    expect(body).toContain("/demo-media/audio/");
    expect(body).not.toContain("playbackText");
  }
  const ielts = JSON.stringify(await (await page.request.post("/api/exam-engine/ielts-practice-test-1/attempts")).json());
  expect(ielts).not.toContain("Brennan");
  const dictation = JSON.stringify(await (await page.request.post("/api/exam-engine/ielts-skills-drill-dictation-order/attempts")).json());
  expect(dictation).not.toContain("half past nine");
});

test("TOEIC Part 1 shows its photograph, plays a limited recording and reveals the script after submitting", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/exams/toeic-part-1-demo");
  const photo = page.getByRole("img", { name: /TOEIC Part 1 photograph/u });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const audio = page.locator("audio");
  await expect(audio).toHaveAttribute("src", /\/demo-media\/audio\/.+\.mp3$/u);
  const audioResponse = await page.request.get((await audio.getAttribute("src"))!);
  expect(audioResponse.headers()["content-type"]).toContain("audio/mpeg");

  await page.getByRole("button", { name: "Play audio (0/2)" }).click();
  await expect(page.getByRole("button", { name: "Playing…" })).toBeDisabled();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0.2);

  await page.locator("fieldset", { hasText: "Look at the picture" }).getByLabel("B", { exact: true }).check();
  await page.getByRole("button", { name: "Submit exam" }).click();
  await expect(page.getByRole("heading", { name: "Result: 1/1" })).toBeVisible();
  await page.getByText("Transcript", { exact: true }).click();
  await expect(page.locator("details")).toContainText("(B) She's placing a book on a shelf.");
  await expect(page.locator("audio[controls]")).toHaveAttribute("src", /\/demo-media\/audio\//u);
});

test("lesson listening falls back to browser speech when the recording cannot load", async ({ page }) => {
  await useEnglish(page);
  await page.route("**/demo-media/audio/**", (route) => route.fulfill({ status: 404, body: "" }));
  await page.goto("/learn/c1/nuance");
  await expect(page.getByRole("button", { name: "Play demo audio" })).toBeVisible();
});
