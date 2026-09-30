import { and, asc, eq } from "drizzle-orm";
import { IpaSoundSchema, MinimalPairSchema, ShadowingItemSchema, type IpaSound, type MinimalPair, type ShadowingItem } from "@english4free/content-schemas";
import { createDatabase } from "@/db/client";
import { pronunciationItems } from "@/db/schema";

export type PronunciationContent = { sounds: IpaSound[]; pairs: MinimalPair[]; shadowing: ShadowingItem[] };

/** Published IPA sounds, minimal pairs and shadowing sentences in authored order; rows that fail validation are skipped. */
export async function listPronunciationContent(): Promise<PronunciationContent> {
  const db = createDatabase();
  const empty: PronunciationContent = { sounds: [], pairs: [], shadowing: [] };
  if (!db) return empty;
  const rows = await db.select({ kind: pronunciationItems.kind, slug: pronunciationItems.slug, content: pronunciationItems.content }).from(pronunciationItems).where(and(eq(pronunciationItems.status, "PUBLISHED"))).orderBy(asc(pronunciationItems.sortOrder));
  for (const row of rows) {
    const content = row.content as Record<string, unknown>;
    if (row.kind === "SOUND") { const parsed = IpaSoundSchema.safeParse(content); if (parsed.success) empty.sounds.push(parsed.data); }
    if (row.kind === "PAIR") { const parsed = MinimalPairSchema.safeParse({ id: row.slug, ...content }); if (parsed.success) empty.pairs.push(parsed.data); }
    if (row.kind === "SHADOW") { const parsed = ShadowingItemSchema.safeParse({ id: row.slug, ...content }); if (parsed.success) empty.shadowing.push(parsed.data); }
  }
  return empty;
}
