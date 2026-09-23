import { randomUUID } from "node:crypto";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import * as XLSX from "xlsx";
import { and, asc, eq } from "drizzle-orm";
import { ContentImportApplySchema, type ContentImportApply } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { contentBatches, contentImports, courseUnits, examParts, exams, lessonBlocks, lessons, passages, questions } from "@/db/schema";
import { saveLocalContentImport, type ImportFileType } from "./local-import-storage";

export type SpreadsheetSheet = { name: string; headers: string[]; rows: Array<Record<string, string>> };
export type ImportExtraction = { kind: "SPREADSHEET"; sheets: SpreadsheetSheet[] } | { kind: "DOCUMENT"; text: string; sections: string[]; pageCount?: number };
export type ContentImportSummary = { id: string; fileName: string; fileType: string; targetType: string; status: string; source: string; createdAt: Date; result: Record<string, unknown> };
export type ContentImportDetail = ContentImportSummary & { contentBatchId: string; extraction: ImportExtraction; mapping: Record<string, unknown>; error: string | null };

function dbOrThrow() { const db = createDatabase(); if (!db) throw new Error("DATABASE_URL is required for content import"); return db; }
function stringCell(value: unknown) { return typeof value === "string" ? value.trim() : value === null || value === undefined ? "" : String(value).trim(); }
function limitText(value: string) { return value.replace(/\u0000/gu, "").trim().slice(0, 30_000); }
function uniqueHeaders(row: unknown[]) { const used = new Set<string>(); return row.map((item, index) => { const original = stringCell(item) || `Column ${index + 1}`; let header = original; let number = 2; while (used.has(header)) header = `${original} ${number++}`; used.add(header); return header; }); }
function asDocument(text: string, pageCount?: number): ImportExtraction { const clean = limitText(text); if (!clean) throw new Error("No readable text was found in this document"); return { kind: "DOCUMENT", text: clean, sections: clean.split(/\n\s*\n/gu).map((item) => item.trim()).filter(Boolean).slice(0, 200), pageCount }; }

export async function extractImportFile(fileType: ImportFileType, bytes: Uint8Array): Promise<ImportExtraction> {
  if (fileType === "XLSX" || fileType === "CSV") {
    const workbook = XLSX.read(bytes, { type: "array", raw: false, dense: false });
    const sheets = workbook.SheetNames.slice(0, 20).map((name) => {
      const sheet = workbook.Sheets[name];
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
      const headers = uniqueHeaders(matrix[0] ?? []);
      if (!headers.length) return { name, headers: [], rows: [] };
      const rows = matrix.slice(1, 5001).map((cells) => Object.fromEntries(headers.map((header, index) => [header, limitText(stringCell(cells[index]))]))).filter((row) => Object.values(row).some(Boolean));
      return { name, headers, rows };
    });
    if (!sheets.some((sheet) => sheet.headers.length)) throw new Error("Spreadsheet has no header row");
    return { kind: "SPREADSHEET", sheets };
  }
  if (fileType === "DOCX") return asDocument((await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value);
  const parser = new PDFParse({ data: Buffer.from(bytes) });
  try {
    const parsed = await parser.getText();
    return asDocument(parsed.text, parsed.total);
  } finally { await parser.destroy(); }
}

export async function createContentImport(input: { fileName: string; contentType: string; fileType: ImportFileType; bytes: Uint8Array; targetType: "LESSON" | "EXAM"; source: string; license: string; author?: string; version: string }) {
  const extraction = await extractImportFile(input.fileType, input.bytes);
  const stored = await saveLocalContentImport({ bytes: input.bytes, fileType: input.fileType });
  const db = dbOrThrow(); const importId = randomUUID(); const batchId = randomUUID(); const now = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(contentBatches).values({ id: batchId, source: input.source, license: input.license, author: input.author, version: input.version, importedAt: now, status: "DRAFT" });
    await tx.insert(contentImports).values({ id: importId, contentBatchId: batchId, fileName: input.fileName, fileType: input.fileType, contentType: input.contentType, byteSize: stored.byteSize, storageKey: stored.storageKey, targetType: input.targetType, status: "EXTRACTED", extraction, mapping: {}, result: {}, createdAt: now, updatedAt: now });
  });
  return { id: importId, contentBatchId: batchId, extraction };
}

function toSummary(row: typeof contentImports.$inferSelect & { source: string }): ContentImportSummary { return { id: row.id, fileName: row.fileName, fileType: row.fileType, targetType: row.targetType, status: row.status, source: row.source, createdAt: row.createdAt, result: row.result as Record<string, unknown> }; }
export async function listContentImports(): Promise<ContentImportSummary[] | null> { const db = createDatabase(); if (!db) return null; const rows = await db.select({ id: contentImports.id, fileName: contentImports.fileName, fileType: contentImports.fileType, targetType: contentImports.targetType, status: contentImports.status, source: contentBatches.source, createdAt: contentImports.createdAt, result: contentImports.result }).from(contentImports).innerJoin(contentBatches, eq(contentImports.contentBatchId, contentBatches.id)).orderBy(asc(contentImports.createdAt)); return rows.map((row) => toSummary({ ...row, contentBatchId: "", contentType: "", byteSize: 0, storageKey: "", extraction: {}, mapping: {}, error: null, updatedAt: row.createdAt } as typeof contentImports.$inferSelect & { source: string })); }
export async function findContentImport(id: string): Promise<ContentImportDetail | null> { const db = createDatabase(); if (!db) return null; const [row] = await db.select({ id: contentImports.id, contentBatchId: contentImports.contentBatchId, fileName: contentImports.fileName, fileType: contentImports.fileType, targetType: contentImports.targetType, status: contentImports.status, source: contentBatches.source, createdAt: contentImports.createdAt, extraction: contentImports.extraction, mapping: contentImports.mapping, result: contentImports.result, error: contentImports.error }).from(contentImports).innerJoin(contentBatches, eq(contentImports.contentBatchId, contentBatches.id)).where(eq(contentImports.id, id)); return row ? { ...toSummary({ ...row, contentType: "", byteSize: 0, storageKey: "", updatedAt: row.createdAt } as typeof contentImports.$inferSelect & { source: string }), contentBatchId: row.contentBatchId, extraction: row.extraction as ImportExtraction, mapping: row.mapping as Record<string, unknown>, error: row.error } : null; }

function validateDocumentImport(item: ContentImportDetail) { if (item.status === "READY_FOR_REVIEW") return null; if (item.status !== "EXTRACTED" || item.extraction.kind !== "DOCUMENT") throw new Error("This import is not a staged Word/PDF document"); return item.extraction; }
export async function applyLessonImport(raw: ContentImportApply) {
  const input = ContentImportApplySchema.parse(raw); if (input.target !== "LESSON") throw new Error("Expected lesson mapping"); const item = await findContentImport(input.importId); if (!item) throw new Error("Import not found"); const extraction = validateDocumentImport(item); if (!extraction) return item.result;
  const db = dbOrThrow(); const [unit] = await db.select({ id: courseUnits.id }).from(courseUnits).where(eq(courseUnits.id, input.unitId)); if (!unit) throw new Error("Selected course unit was not found"); const lessonId = randomUUID(); const availableSections = extraction.sections.length ? extraction.sections : [extraction.text]; const sections = input.sectionIndexes ? input.sectionIndexes.map((index) => availableSections[index]).filter((section): section is string => Boolean(section)) : availableSections;
  if (!sections.length || (input.sectionIndexes && sections.length !== input.sectionIndexes.length)) throw new Error("Select one or more valid document sections");
  await db.transaction(async (tx) => { await tx.insert(lessons).values({ id: lessonId, unitId: input.unitId, slug: input.slug, title: input.title, skill: input.skill, estimatedMinutes: input.estimatedMinutes, contentBatchId: item.contentBatchId, status: "DRAFT" }); await tx.insert(lessonBlocks).values(sections.map((body, index) => ({ id: randomUUID(), lessonId, type: "RICH_TEXT" as const, sortOrder: index + 1, schemaVersion: 1, content: { heading: index === 0 ? input.title : `Section ${index + 1}`, body } }))); await tx.update(contentImports).set({ status: "READY_FOR_REVIEW", mapping: input, result: { lessonId, lessonSlug: input.slug }, updatedAt: new Date() }).where(eq(contentImports.id, item.id)); });
  return { lessonId, lessonSlug: input.slug };
}

type DraftQuestion = { partNumber: number; partTitle: string; skill: "LISTENING" | "READING"; passageTitle?: string; passage?: string; prompt: string; options: Array<{ id: string; text: string }>; correctOptionId: string; explanation: string; tags: string[] };
function headerValue(row: Record<string, string>, header: string | undefined) { return header ? row[header]?.trim() ?? "" : ""; }
function normalizeCorrect(value: string) { const normalized = value.trim().toLowerCase(); const single = /^([a-d])(?:[.)\s].*)?$/u.exec(normalized); return single?.[1] ?? normalized; }
function parseQuestions(rows: Array<Record<string, string>>, input: Extract<ContentImportApply, { target: "EXAM" }>) {
  const invalid: string[] = []; const questions = rows.map((row, index): DraftQuestion | null => { const c = input.columns; const prompt = headerValue(row, c.question); const optionValues = [["a", headerValue(row, c.optionA)], ["b", headerValue(row, c.optionB)], ["c", headerValue(row, c.optionC)], ["d", headerValue(row, c.optionD)]] as const; const options = optionValues.filter(([, text]) => text).map(([id, text]) => ({ id, text })); const correctOptionId = normalizeCorrect(headerValue(row, c.correctOption)); const partNumber = Number(headerValue(row, c.partNumber) || input.defaultPartNumber); const rawSkill = (headerValue(row, c.skill) || input.defaultSkill).toUpperCase(); if (!prompt || options.length < 2 || !options.some((option) => option.id === correctOptionId) || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 7 || !["LISTENING", "READING"].includes(rawSkill)) { invalid.push(`Row ${index + 2}: question, two options, valid correct option, part number and LISTENING/READING skill are required`); return null; } return { partNumber, partTitle: headerValue(row, c.partTitle) || input.defaultPartTitle, skill: rawSkill as "LISTENING" | "READING", passageTitle: headerValue(row, c.passageTitle) || undefined, passage: headerValue(row, c.passage) || undefined, prompt, options, correctOptionId, explanation: headerValue(row, c.explanation) || "Review the source material before continuing.", tags: headerValue(row, c.tags).split(",").map((tag) => tag.trim()).filter(Boolean) }; }).filter((item): item is DraftQuestion => Boolean(item));
  if (invalid.length) throw new Error(`Import validation failed. ${invalid.slice(0, 10).join(" ")}`); if (!questions.length) throw new Error("No question rows were found in the selected sheet"); return questions;
}
export async function applyExamImport(raw: ContentImportApply) {
  const input = ContentImportApplySchema.parse(raw); if (input.target !== "EXAM") throw new Error("Expected exam mapping"); const item = await findContentImport(input.importId); if (!item) throw new Error("Import not found"); if (item.status === "READY_FOR_REVIEW") return item.result; if (item.status !== "EXTRACTED" || item.extraction.kind !== "SPREADSHEET") throw new Error("This import is not a staged spreadsheet"); const sheet = item.extraction.sheets.find((candidate) => candidate.name === input.sheetName); if (!sheet) throw new Error("Selected spreadsheet sheet was not found"); const allowedHeaders = new Set(sheet.headers); for (const header of Object.values(input.columns)) if (header && !allowedHeaders.has(header)) throw new Error(`Mapped column not found: ${header}`); const draftQuestions = parseQuestions(sheet.rows, input); const db = dbOrThrow(); const examId = randomUUID(); const partByNumber = new Map<number, string>(); const passageByKey = new Map<string, string>();
  await db.transaction(async (tx) => { await tx.insert(exams).values({ id: examId, slug: input.slug, title: input.title, type: input.type, mode: input.mode, durationSeconds: input.durationSeconds, contentBatchId: item.contentBatchId, status: "DRAFT" }); for (const question of draftQuestions) { let partId = partByNumber.get(question.partNumber); if (!partId) { partId = randomUUID(); partByNumber.set(question.partNumber, partId); await tx.insert(examParts).values({ id: partId, examId, partNumber: question.partNumber, title: question.partTitle, sortOrder: question.partNumber, skill: question.skill }); } let passageId: string | undefined; if (question.passage) { const key = `${partId}:${question.passageTitle ?? ""}:${question.passage}`; passageId = passageByKey.get(key); if (!passageId) { passageId = randomUUID(); passageByKey.set(key, passageId); await tx.insert(passages).values({ id: passageId, examPartId: partId, title: question.passageTitle ?? null, content: question.passage, sortOrder: passageByKey.size }); } } await tx.insert(questions).values({ id: randomUUID(), examPartId: partId, passageId, schemaVersion: 1, type: "MCQ", content: { prompt: question.prompt, options: question.options }, answer: { correctOptionId: question.correctOptionId }, explanation: question.explanation, tags: question.tags, status: "DRAFT", contentBatchId: item.contentBatchId }); } await tx.update(contentImports).set({ status: "READY_FOR_REVIEW", mapping: input, result: { examId, examSlug: input.slug, partCount: partByNumber.size, questionCount: draftQuestions.length }, updatedAt: new Date() }).where(and(eq(contentImports.id, item.id), eq(contentImports.status, "EXTRACTED"))); });
  return { examId, examSlug: input.slug, partCount: partByNumber.size, questionCount: draftQuestions.length };
}
