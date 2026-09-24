import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { isS3StorageConfigured } from "@/modules/media/s3-media-service";
import { isGeminiConfigured } from "@/modules/ai-foundation/gemini-provider";

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
      gemini: { configured: isGeminiConfigured(), model: process.env.GEMINI_MODEL?.trim() || null },
      aiWriting: { configured: isGeminiConfigured() },
      aiTutor: { configured: isGeminiConfigured() },
      aiSpeaking: {
        configured: isGeminiConfigured(),
        mode: "push-to-talk",
        transcriptionModel: process.env.GEMINI_TRANSCRIBE_MODEL?.trim() || null
      },
      speech: { configured: Boolean(process.env.SPEECH_SERVICE_URL) }
    }
  };
  return NextResponse.json(body, { status: databaseReachable ? 200 : 503 });
}
