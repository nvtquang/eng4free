import { expect, test } from "@playwright/test";

test("admin imports a CSV question bank, maps columns and publishes the resulting exam", async ({ page, request }) => {
  await page.request.post("/api/locale", { data: { locale: "en" } });
  const token = Date.now();
  const csv = [
    "part_number,part_title,skill,question,option_a,option_b,correct_option,explanation,tags",
    "5,Sentence completion,READING,She ___ English every day.,studies,study,A,Third-person singular uses studies.,grammar;present-simple"
  ].join("\n");
  const upload = await request.post("/api/admin/imports", {
    multipart: {
      targetType: "EXAM", source: `https://english4free.local/import/${token}`, license: "Original E2E content", version: "1",
      file: { name: "questions.csv", mimeType: "text/csv", buffer: Buffer.from(csv) }
    }
  });
  expect(upload.ok(), await upload.text()).toBeTruthy();
  const staged = await upload.json() as { id: string; contentBatchId: string };
  const apply = await request.post(`/api/admin/imports/${staged.id}/apply`, {
    data: {
      target: "EXAM", slug: `csv-import-${token}`, title: "CSV imported practice", type: "TOEIC", mode: "PRACTICE", durationSeconds: 300,
      sheetName: "Sheet1", defaultPartNumber: 5, defaultPartTitle: "Sentence completion", defaultSkill: "READING",
      columns: { partNumber: "part_number", partTitle: "part_title", skill: "skill", question: "question", optionA: "option_a", optionB: "option_b", correctOption: "correct_option", explanation: "explanation", tags: "tags" }
    }
  });
  expect(apply.ok(), await apply.text()).toBeTruthy();
  const result = await apply.json() as { examId: string; examSlug: string; questionCount: number };
  expect(result.questionCount).toBe(1);
  for (const nextStatus of ["REVIEW", "APPROVED", "PUBLISHED"]) {
    const transition = await request.post("/api/admin/content/transition", { data: { batchId: staged.contentBatchId, nextStatus } });
    expect(transition.ok(), await transition.text()).toBeTruthy();
  }
  const publish = await request.post("/api/admin/operations", { data: { operation: "publishExam", payload: { examId: result.examId } } });
  expect(publish.ok(), await publish.text()).toBeTruthy();
  await page.goto(`/exams/${result.examSlug}`);
  await page.locator("fieldset input[type=radio]").first().check();
  await page.getByRole("button", { name: "Submit exam" }).click();
  await expect(page.getByText(/Result: 1\/1/)).toBeVisible();
});
