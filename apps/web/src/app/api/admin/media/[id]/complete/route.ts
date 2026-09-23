import { NextResponse } from "next/server";
import { getAdminActor } from "@/modules/auth/authorization";
import { MediaStorageNotConfiguredError, MediaUploadValidationError } from "@/modules/media/media-service";
import { getConfiguredMediaService } from "@/modules/media/s3-media-service";

type Context = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: Context) {
  const actor = await getAdminActor();
  if (!actor.isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { id } = await context.params;
  try {
    return NextResponse.json(await getConfiguredMediaService().finalizeUpload({ mediaId: id }));
  } catch (error) {
    if (error instanceof MediaStorageNotConfiguredError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof MediaUploadValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Could not finalize upload" }, { status: 500 });
  }
}
