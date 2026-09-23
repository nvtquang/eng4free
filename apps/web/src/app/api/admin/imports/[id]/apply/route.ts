import { NextResponse } from "next/server";
import { ContentImportApplySchema } from "@english4free/content-schemas";
import { getAdminActor } from "@/modules/auth/authorization";
import { applyExamImport, applyLessonImport } from "@/modules/content-management/content-importer";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminActor()).isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const body: unknown = await request.json(); const input = ContentImportApplySchema.parse({ ...(body as Record<string, unknown>), importId: (await params).id });
    const result = input.target === "LESSON" ? await applyLessonImport(input) : await applyExamImport(input);
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not apply import mapping" }, { status: 400 }); }
}
