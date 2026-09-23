import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { isS3StorageConfigured } from "@/modules/media/s3-media-service";

export async function GET() {
  const database = createDatabase();
  let databaseReachable = false;
  if (database) {
    try {
      await database.execute(sql`select 1`);
      databaseReachable = true;
    } catch {
      databaseReachable = false;
    }
  }
  const body = {
    status: databaseReachable ? "ok" : "degraded",
    service: "english-4-free-web",
    integrations: {
      database: { configured: Boolean(database), reachable: databaseReachable },
      objectStorage: { configured: isS3StorageConfigured() },
      googleOAuth: { configured: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) },
      aiWriting: { configured: Boolean(process.env.AI_WRITING_PROVIDER_URL) },
      aiTutor: { configured: Boolean(process.env.AI_TUTOR_PROVIDER_URL) },
      speech: { configured: Boolean(process.env.SPEECH_SERVICE_URL) }
    }
  };
  return NextResponse.json(body, { status: databaseReachable ? 200 : 503 });
}
