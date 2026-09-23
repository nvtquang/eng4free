import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, resolve } from "node:path";

export const IMPORT_FILE_TYPES = ["XLSX", "CSV", "DOCX", "PDF"] as const;
export type ImportFileType = (typeof IMPORT_FILE_TYPES)[number];
const maxImportBytes = 20 * 1024 * 1024;

function directory() { return resolve(process.cwd(), ".local-imports"); }
function normalType(value: string) { return value.split(";", 1)[0].trim().toLowerCase(); }

export function detectImportFileType(fileName: string, contentType: string): ImportFileType {
  const extension = extname(fileName).toLowerCase();
  const type = normalType(contentType);
  if (extension === ".xlsx" && ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"].includes(type)) return "XLSX";
  if (extension === ".csv" && ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"].includes(type)) return "CSV";
  if (extension === ".docx" && ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"].includes(type)) return "DOCX";
  if (extension === ".pdf" && type === "application/pdf") return "PDF";
  throw new Error("Only .xlsx, .csv, .docx and .pdf content-source files are supported");
}

export function validateImportUpload(fileName: string, contentType: string, byteSize: number) {
  const fileType = detectImportFileType(fileName, contentType);
  if (byteSize <= 0 || byteSize > maxImportBytes) throw new Error("Import file must be between 1 byte and 20 MB");
  return fileType;
}

export async function saveLocalContentImport(input: { bytes: Uint8Array; fileType: ImportFileType }) {
  if (input.bytes.byteLength <= 0 || input.bytes.byteLength > maxImportBytes) throw new Error("Import file must be between 1 byte and 20 MB");
  const extension = input.fileType.toLowerCase();
  const filename = `${randomUUID()}.${extension}`;
  await mkdir(directory(), { recursive: true });
  await writeFile(resolve(directory(), filename), input.bytes);
  return { storageKey: `local-imports/${filename}`, byteSize: input.bytes.byteLength };
}

export async function readLocalContentImport(storageKey: string) {
  const match = /^local-imports\/([a-f0-9-]+\.(?:xlsx|csv|docx|pdf))$/u.exec(storageKey);
  if (!match) throw new Error("Invalid import storage key");
  return readFile(resolve(directory(), match[1]));
}
