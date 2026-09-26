import { expect, test, type Page } from "@playwright/test";

async function useEnglish(page: Page) { await page.request.post("/api/locale", { data: { locale: "en" } }); }
const question = (page: Page, text: string | RegExp) => page.locator("fieldset", { hasText: text });

test("IELTS practice test covers every common question type and scores a perfect attempt", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/exams/ielts-practice-test-1");
  await expect(page.getByText("0/10 answered")).toBeVisible();

  // Form completion (four blanks, one question).
  for (const [blank, value] of [[1, "brennan"], [2, "Thursday"], [3, "7:15"], [4, "25"]] as const) await page.getByLabel(`Question 1–4 · Blank ${blank}`).fill(value);
  await question(page, "Which TWO things").getByLabel(/a towel/).check();
  await question(page, "Which TWO things").getByLabel(/a padlock/).check();
  await expect(question(page, "Which TWO things").getByLabel(/goggles/)).toBeDisabled();
  await question(page, "How do most people travel").getByLabel("by bus").check();
  await page.getByRole("combobox", { name: "The evening swimming class" }).selectOption("c");
  await page.getByRole("combobox", { name: "The Saturday beginners' class" }).selectOption("a");
  await page.getByRole("combobox", { name: "Swimming goggles" }).selectOption("b");
  for (const [paragraph, heading] of [["B", "b"], ["C", "a"], ["D", "e"], ["E", "c"]] as const) await page.getByRole("combobox", { name: `Paragraph ${paragraph}` }).selectOption(heading);
  await question(page, "already popular twenty years ago").getByLabel("False", { exact: true }).check();
  await question(page, "fewer pesticides").getByLabel("True", { exact: true }).check();
  await question(page, "Paris study").getByLabel("Not Given").check();
  for (const [blank, value] of [[1, "alone"], [2, "flower beds"], [3, "Training Course"], [4, "habitat loss"]] as const) await page.getByLabel(`Question 18–21 · Blank ${blank}`).fill(value);
  const lastSave = page.waitForResponse((response) => response.url().includes("/answers") && response.request().method() === "PUT" && response.ok() && (JSON.parse(response.request().postData() ?? "{}") as { answers?: unknown[] }).answers?.length === 10);
  await question(page, "main conclusion").getByLabel(/Green space matters more/).check();
  await expect(page.getByText("10/10 answered")).toBeVisible();

  // Autosave restores structured answers after a reload.
  await lastSave;
  await page.reload();
  await expect(page.getByLabel("Question 1–4 · Blank 1")).toHaveValue("brennan");
  await expect(page.getByRole("combobox", { name: "Paragraph D" })).toHaveValue("e");
  await expect(page.getByText("10/10 answered")).toBeVisible();

  await page.getByRole("button", { name: "Submit exam" }).click();
  await expect(page).toHaveURL(/\/results\//u);
  await expect(page.getByRole("heading", { name: "Result: 22/22" })).toBeVisible();
  await expect(page.getByText(/Accepted: 7\.15 \/ 7:15/u)).toBeVisible();
});

test("dictation and sentence ordering are answered and scored in the browser", async ({ page }) => {
  await useEnglish(page);
  await page.goto("/exams/ielts-skills-drill-dictation-order");
  await page.getByLabel("Question 1", { exact: true }).fill("the library closes at 9.30 on fridays");
  await page.getByLabel("Question 2", { exact: true }).fill("Please remember to bring your student card to the first seminar!");
  const tips = ["First, read the instructions carefully.", "Next, look at the questions before you read the passage.", "Then, scan the passage for key words from each question.", "Finally, check that every answer fits the word limit."];
  const list = question(page, "Put the exam tips in a logical order").locator("ol > li");
  for (const [target, text] of tips.entries()) {
    for (let current = (await list.allInnerTexts()).findIndex((item) => item.includes(text)); current > target; current -= 1) await page.getByRole("button", { name: `Move up: ${text}` }).click();
  }
  await expect(list.first()).toContainText(tips[0]!);
  await page.getByRole("button", { name: "Submit exam" }).click();
  await expect(page).toHaveURL(/\/results\//u);
  await expect(page.getByRole("heading", { name: /Result: 3\/4/u })).toBeVisible();
});

test("admin authors a non-MCQ question that a learner can answer", async ({ page, request }) => {
  const token = Date.now();
  const create = async (operation: string, payload: Record<string, unknown>) => { const response = await request.post("/api/admin/operations", { data: { operation, payload } }); expect(response.ok(), await response.text()).toBeTruthy(); return response.json(); };
  const batch = await create("batch", { source: `https://english4free.local/e2e/${token}`, license: "Original E2E content", version: "1" });
  const exam = await create("exam", { contentBatchId: batch.id, slug: `e2e-exam-${token}`, title: "E2E Gap Fill", type: "IELTS", mode: "PRACTICE", durationSeconds: 300, partNumber: 1, partTitle: "Reading", skill: "READING" });
  const invalid = await request.post("/api/admin/operations", { data: { operation: "question", payload: { examPartId: exam.partId, explanation: "x", authoring: { type: "FILL_BLANK", prompt: "___ and ___", acceptedAnswers: "one" } } } });
  expect(invalid.status()).toBe(400);
  await create("question", { examPartId: exam.partId, explanation: "The notice says Room B12.", tags: ["e2e"], authoring: { type: "FILL_BLANK", prompt: "The meeting is in room ___.", acceptedAnswers: "B12 | B 12" } });
  for (const status of ["REVIEW", "APPROVED", "PUBLISHED"]) expect((await request.post("/api/admin/content/transition", { data: { batchId: batch.id, nextStatus: status } })).ok()).toBeTruthy();
  await create("publishExam", { examId: exam.examId });
  await useEnglish(page);
  await page.goto(`/exams/e2e-exam-${token}`);
  await page.getByLabel("Question 1 · Blank 1").fill(" b12 ");
  await page.getByRole("button", { name: "Submit exam" }).click();
  await expect(page.getByRole("heading", { name: "Result: 1/1" })).toBeVisible();
});
