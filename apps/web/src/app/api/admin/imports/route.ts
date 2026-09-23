import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminActor } from "@/modules/auth/authorization";
import { createContentImport } from "@/modules/content-management/content-importer";
import { validateImportUpload } from "@/modules/content-management/local-import-storage";

const metadata = z.object({ targetType: z.enum(["LESSON", "EXAM"]), source: z.string().min(3).max(500), license: z.string().min(1).max(255), author: z.string().max(255).optional(), version: z.string().min(1).max(64) });

export async function POST(request: Request) {
  if (!(await getAdminActor()).isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 21 * 1024 * 1024) return NextResponse.json({ error: "File is too large" }, { status: 413 });
  try {
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "File is required" }, { status: 400 });
    const parsed = metadata.parse({ targetType: form.get("targetType"), source: String(form.get("source") ?? "").trim(), license: String(form.get("license") ?? "").trim(), author: String(form.get("author") ?? "").trim() || undefined, version: String(form.get("version") ?? "").trim() });
    const fileType = validateImportUpload(file.name, file.type, file.size);
    const result = await createContentImport({ ...parsed, fileName: file.name, contentType: file.type, fileType, bytes: new Uint8Array(await file.arrayBuffer()) });
    return NextResponse.json({ id: result.id, contentBatchId: result.contentBatchId, extractionKind: result.extraction.kind }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Import upload failed" }, { status: 400 }); }
}
