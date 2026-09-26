import { describe, expect, it } from "vitest";
import { ContentImportLessonMappingSchema } from "@english4free/content-schemas";
import { extractImportFile, parseQuestions } from "./content-importer";
import { detectImportFileType, validateImportUpload } from "./local-import-storage";

describe("content importer staging", () => {
  it("accepts only supported source extensions and MIME types", () => {
    expect(detectImportFileType("questions.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).toBe("XLSX");
    expect(detectImportFileType("lesson.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("DOCX");
    expect(() => validateImportUpload("malware.exe", "application/octet-stream", 10)).toThrow("Only .xlsx");
  });

  it("extracts a CSV header and rows into non-lossy staging data", async () => {
    const extraction = await extractImportFile("CSV", new TextEncoder().encode("question,option_a,option_b,correct_option\nChoose.,Yes,No,A\n"));
    expect(extraction.kind).toBe("SPREADSHEET");
    if (extraction.kind === "SPREADSHEET") {
      expect(extraction.sheets[0]?.headers).toEqual(["question", "option_a", "option_b", "correct_option"]);
      expect(extraction.sheets[0]?.rows[0]).toMatchObject({ question: "Choose.", correct_option: "A" });
    }
  });

  it("requires at least one selected document section when section mapping is supplied", () => {
    const base = { importId: "00000000-0000-4000-8000-000000000000", target: "LESSON" as const, unitId: "00000000-0000-4000-8000-000000000001", slug: "imported-reading", title: "Imported reading", skill: "READING" as const, estimatedMinutes: 15 };
    expect(ContentImportLessonMappingSchema.safeParse({ ...base, sectionIndexes: [0, 2] }).success).toBe(true);
    expect(ContentImportLessonMappingSchema.safeParse({ ...base, sectionIndexes: [] }).success).toBe(false);
  });
});

describe("spreadsheet question rows", () => {
  const mapping = { importId: "00000000-0000-4000-8000-000000000000", target: "EXAM" as const, slug: "mixed", title: "Mixed", type: "IELTS" as const, mode: "PRACTICE" as const, durationSeconds: 600, sheetName: "Sheet1", defaultPartNumber: 1, defaultPartTitle: "Practice", defaultSkill: "READING" as const,
    columns: { questionType: "type", question: "question", optionA: "a", optionB: "b", optionC: "c", optionD: "d", correctOption: "correct", acceptedAnswers: "accepted", items: "items", wordLimit: "limit", explanation: "explanation" } };
  const row = (values: Record<string, string>) => ({ type: "", question: "", a: "", b: "", c: "", d: "", correct: "", accepted: "", items: "", limit: "", explanation: "", ...values });

  it("builds every question type from one sheet", () => {
    const parsed = parseQuestions([
      row({ question: "Pick one.", a: "Yes", b: "No", correct: "A) Yes" }),
      row({ type: "choose two", question: "Choose TWO.", a: "w", b: "x", c: "y", d: "z", correct: "B, D" }),
      row({ type: "TFNG", question: "Trees reduce noise.", correct: "Not given" }),
      row({ type: "gap fill", question: "Room ___", accepted: "B12 | b 12", limit: "2" }),
      row({ type: "matching headings", question: "Match.", items: "Paragraph A | Paragraph B", a: "Heading 1", b: "Heading 2", correct: "B, A" }),
      row({ type: "ordering", question: "Order.", items: "one | two | three" }),
      row({ type: "dictation", question: "Write.", accepted: "Hello there." })
    ], mapping);
    expect(parsed.map((item) => item.question.type)).toEqual(["MCQ", "MULTI_SELECT", "TRUE_FALSE", "FILL_BLANK", "MATCHING", "ORDERING", "DICTATION"]);
    expect(parsed[3]?.question.content).toMatchObject({ prompt: "Room {{1}}", wordLimit: 2 });
  });

  it("reports the row, type and reason for invalid rows", () => {
    expect(() => parseQuestions([row({ type: "gap fill", question: "___ and ___", accepted: "only one" })], mapping)).toThrow(/Row 2 \(FILL_BLANK\): The prompt has 2 blank/u);
    expect(() => parseQuestions([row({ type: "essay", question: "Write." })], mapping)).toThrow(/unknown question type "essay"/u);
  });
});
