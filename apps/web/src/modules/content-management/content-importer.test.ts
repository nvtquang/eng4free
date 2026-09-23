import { describe, expect, it } from "vitest";
import { ContentImportLessonMappingSchema } from "@english4free/content-schemas";
import { extractImportFile } from "./content-importer";
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
