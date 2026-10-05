/**
 * The vocabulary catalogue in PostgreSQL, its only home. Used by the CMS (/admin/vocabulary)
 * and by the vocab:* scripts, so both apply the same rules and write the same history:
 *  - every change is checked with checkCatalogEntry and logged in vocabulary_revisions;
 *  - new words arrive as unreviewed DRAFT rows in the vocabulary batch, which goes to REVIEW;
 *  - publishing (batch APPROVED) releases only reviewed DRAFT words that pass the rules;
 *  - an edit to a published word is live at once (the editor is an admin, and the rules still apply).
 * Imports are relative (no "@/" alias) so the scripts can use this module too.
 */
import { createHash, randomUUID } from "node:crypto";
import { and, asc, count, eq, ilike, inArray, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { contentBatches, vocabulary, vocabularyExclusions, vocabularyRevisions } from "../../db/schema";
import { checkCatalogEntry, EDITOR_SOURCE, EXAMPLE_SOURCE, isSensePick, LEVELS, meaningFromChoice, wiktionarySource, type CatalogAttribution, type CatalogIssue, type SenseGroup, type SensePick, type Source } from "./catalog-rules";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the app's and the scripts' drizzle instances differ only in their schema type
export type CatalogDb = PostgresJsDatabase<any>;
type Status = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

/** Stable id derived from a key (same scheme as content pack D3, so ids never change). */
export function catalogId(key: string) {
  const hash = createHash("sha256").update(`e4f-d3:${key}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${(8 + (parseInt(hash[16]!, 16) & 3)).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
export const VOCABULARY_BATCH_ID = catalogId("batch:vocabulary");
export const wordId = (headword: string, partOfSpeech: string, level: string) => catalogId(`vocabulary:${headword}:${partOfSpeech}:${level}`);
export const VOCABULARY_BATCH = {
  source: "PostgreSQL vocabulary catalogue (/admin/vocabulary)",
  license: "Meanings and IPA: English Wiktionary, CC BY-SA 4.0 · Levels: Words-CEFR (MIT), Octanove C1/C2 (CC BY-SA 4.0) · Examples and editor wording: English 4 Free original",
  generatedBy: "Sourced data; example sentences AI-drafted (Claude, Anthropic); every word reviewed before publishing"
};

/** Creates the vocabulary batch row in a database that does not have it yet (new or rebuilt). */
export async function ensureVocabularyBatch(db: CatalogDb) {
  await db.insert(contentBatches).values({ id: VOCABULARY_BATCH_ID, ...VOCABULARY_BATCH, author: "English 4 Free", version: "catalogue", importedAt: new Date(), status: "DRAFT" }).onConflictDoUpdate({ target: contentBatches.id, set: VOCABULARY_BATCH });
}

export type CatalogRow = {
  id: string; headword: string; partOfSpeech: string | null; cefrLevel: string | null; ipa: string | null; meaning: string | null; example: string | null;
  attribution: CatalogAttribution; senseGroups: SenseGroup[]; senseChoice: SensePick[]; status: Status; reviewedBy: string | null; reviewedAt: Date | null; updatedAt: Date;
};
const rowColumns = {
  id: vocabulary.id, headword: vocabulary.headword, partOfSpeech: vocabulary.partOfSpeech, cefrLevel: vocabulary.cefrLevel, ipa: vocabulary.ipa, meaning: vocabulary.meaning, example: vocabulary.example,
  attribution: vocabulary.attribution, senseGroups: vocabulary.senseGroups, senseChoice: vocabulary.senseChoice, status: vocabulary.status, reviewedBy: vocabulary.reviewedBy, reviewedAt: vocabulary.reviewedAt, updatedAt: vocabulary.updatedAt
};
const toRow = (row: Record<string, unknown>) => ({ ...row, attribution: (row.attribution ?? {}) as CatalogAttribution, senseGroups: (row.senseGroups ?? []) as SenseGroup[], senseChoice: (row.senseChoice ?? [0]) as SensePick[] }) as CatalogRow;
/** Only the D3 catalogue is edited here; older demo words outside the batch stay archived. */
const inCatalog = eq(vocabulary.contentBatchId, VOCABULARY_BATCH_ID);

export type CatalogFilter = { level?: string; status?: Status; reviewed?: "yes" | "no"; q?: string; page?: number; pageSize?: number };

export async function listCatalog(db: CatalogDb, filter: CatalogFilter) {
  const conditions: SQL[] = [inCatalog];
  if (filter.level && (LEVELS as readonly string[]).includes(filter.level)) conditions.push(eq(vocabulary.cefrLevel, filter.level));
  if (filter.status) conditions.push(eq(vocabulary.status, filter.status));
  if (filter.reviewed === "yes") conditions.push(isNotNull(vocabulary.reviewedAt));
  if (filter.reviewed === "no") conditions.push(isNull(vocabulary.reviewedAt));
  if (filter.q?.trim()) conditions.push(or(ilike(vocabulary.headword, `${filter.q.trim()}%`), ilike(vocabulary.meaning, `%${filter.q.trim()}%`))!);
  const pageSize = filter.pageSize ?? 50;
  const page = Math.max(1, filter.page ?? 1);
  const where = and(...conditions);
  const [rows, [total]] = await Promise.all([
    db.select(rowColumns).from(vocabulary).where(where).orderBy(asc(vocabulary.cefrLevel), asc(vocabulary.headword)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ value: count() }).from(vocabulary).where(where)
  ]);
  return { rows: rows.map(toRow), total: total?.value ?? 0, page, pageSize };
}

export async function catalogSummary(db: CatalogDb) {
  const rows = await db.select({ level: vocabulary.cefrLevel, status: vocabulary.status, reviewed: sql<boolean>`${vocabulary.reviewedAt} IS NOT NULL`, value: count() }).from(vocabulary).where(inCatalog).groupBy(vocabulary.cefrLevel, vocabulary.status, sql`${vocabulary.reviewedAt} IS NOT NULL`);
  return rows.map((row) => ({ level: row.level ?? "", status: row.status as Status, reviewed: Boolean(row.reviewed), count: row.value }));
}

export async function getCatalogEntry(db: CatalogDb, id: string) {
  const [row] = await db.select(rowColumns).from(vocabulary).where(and(eq(vocabulary.id, id), inCatalog));
  if (!row) return null;
  const revisions = await db.select({ action: vocabularyRevisions.action, changes: vocabularyRevisions.changes, changedBy: vocabularyRevisions.changedBy, changedAt: vocabularyRevisions.changedAt }).from(vocabularyRevisions).where(eq(vocabularyRevisions.vocabularyId, id)).orderBy(sql`${vocabularyRevisions.changedAt} DESC`).limit(50);
  return { entry: toRow(row), revisions: revisions.map((revision) => ({ ...revision, changes: revision.changes as Record<string, [unknown, unknown]> })) };
}

/**
 * What an editor may change. senseChoice rebuilds the meaning from Wiktionary's groups;
 * meaningText replaces it with the editor's own wording (the meaning source becomes English 4 Free).
 * Hand-typed IPA or level likewise records English 4 Free as their source.
 */
export type CatalogPatch = { senseChoice?: SensePick[]; meaningText?: string; example?: string; ipa?: string; ipaUs?: string | null; cefrLevel?: string; markReviewed?: boolean };
export type CatalogUpdateResult = { ok: true; entry: CatalogRow } | { ok: false; issues: CatalogIssue[] };

/** Applies a patch to a word without saving it: the edited fields, or the reason it is rejected. */
export function applyPatch(current: CatalogRow, patch: CatalogPatch, actor: string, now = new Date()): CatalogUpdateResult {
  const next: CatalogRow = { ...current, attribution: { ...current.attribution, sources: { ...current.attribution.sources } } };
  const sources = next.attribution.sources!;
  const fail = (problem: string): CatalogUpdateResult => ({ ok: false, issues: [{ item: `vocab ${current.headword}`, problem }] });
  if (patch.senseChoice !== undefined) {
    if (!Array.isArray(patch.senseChoice) || !patch.senseChoice.every(isSensePick)) return fail("sense choice must be group indexes or \"group.word\"");
    try {
      const built = meaningFromChoice(current.senseGroups, patch.senseChoice);
      next.senseChoice = patch.senseChoice; next.meaning = built.meaning; next.attribution.sense = built.sense || current.attribution.sense;
      sources.meaning = wiktionarySource(current.headword, "meaning");
    } catch (error) { return fail(error instanceof Error ? error.message : String(error)); }
  }
  if (patch.meaningText !== undefined && patch.meaningText.trim() !== current.meaning) { next.meaning = patch.meaningText.trim(); sources.meaning = EDITOR_SOURCE; }
  if (patch.example !== undefined) { next.example = patch.example.trim(); sources.example = EXAMPLE_SOURCE; }
  if (patch.ipa !== undefined && patch.ipa.trim() !== current.ipa) { next.ipa = patch.ipa.trim(); sources.ipa = EDITOR_SOURCE; }
  if (patch.ipaUs !== undefined && (patch.ipaUs?.trim() || null) !== (current.attribution.ipaUs ?? null)) next.attribution.ipaUs = patch.ipaUs?.trim() || null;
  if (patch.cefrLevel !== undefined && patch.cefrLevel !== current.cefrLevel) { next.cefrLevel = patch.cefrLevel; sources.level = EDITOR_SOURCE; }
  if (patch.markReviewed) { next.reviewedBy = actor; next.reviewedAt = now; }
  const issues = checkCatalogEntry(next);
  return issues.length ? { ok: false, issues } : { ok: true, entry: next };
}

const tracked = ["cefrLevel", "ipa", "meaning", "example", "attribution", "senseChoice", "status", "reviewedBy"] as const;
function diff(before: CatalogRow, after: CatalogRow) {
  const changes: Record<string, [unknown, unknown]> = {};
  for (const field of tracked) if (JSON.stringify(before[field]) !== JSON.stringify(after[field])) changes[field] = [before[field], after[field]];
  return changes;
}

export async function updateCatalogEntry(db: CatalogDb, id: string, patch: CatalogPatch, actor: string): Promise<CatalogUpdateResult | null> {
  return db.transaction(async (tx) => {
    const [row] = await tx.select(rowColumns).from(vocabulary).where(and(eq(vocabulary.id, id), inCatalog)).for("update");
    if (!row) return null;
    const current = toRow(row);
    const now = new Date();
    const result = applyPatch(current, patch, actor, now);
    if (!result.ok) return result;
    const changes = diff(current, result.entry);
    if (!Object.keys(changes).length) return result;
    if (changes.cefrLevel) {
      const [clash] = await tx.select({ id: vocabulary.id }).from(vocabulary).where(and(eq(vocabulary.headword, current.headword), eq(vocabulary.partOfSpeech, current.partOfSpeech ?? ""), eq(vocabulary.cefrLevel, result.entry.cefrLevel!)));
      if (clash) return { ok: false, issues: [{ item: `vocab ${current.headword}`, problem: `${current.headword} (${current.partOfSpeech}) already exists at ${result.entry.cefrLevel}` }] };
    }
    const entry = result.entry;
    await tx.update(vocabulary).set({ cefrLevel: entry.cefrLevel, ipa: entry.ipa, meaning: entry.meaning, example: entry.example, attribution: entry.attribution, senseChoice: entry.senseChoice, reviewedBy: entry.reviewedBy, reviewedAt: entry.reviewedAt, tags: ["d3", (entry.cefrLevel ?? "").toLowerCase(), entry.partOfSpeech], updatedAt: now }).where(eq(vocabulary.id, id));
    const onlyReview = Object.keys(changes).every((field) => field === "reviewedBy");
    await tx.insert(vocabularyRevisions).values({ id: randomUUID(), vocabularyId: id, action: onlyReview ? "REVIEW" : "UPDATE", changes, changedBy: actor, changedAt: now });
    return { ok: true, entry: { ...entry, updatedAt: now } };
  });
}

/** Stops teaching a word: archives it and records the decision so the candidate script skips it. */
export async function excludeCatalogEntry(db: CatalogDb, id: string, reason: string, actor: string) {
  if (!reason.trim()) throw new Error("A reason is required");
  return db.transaction(async (tx) => {
    const [row] = await tx.select({ headword: vocabulary.headword, partOfSpeech: vocabulary.partOfSpeech, status: vocabulary.status }).from(vocabulary).where(and(eq(vocabulary.id, id), inCatalog));
    if (!row) return false;
    const now = new Date();
    await tx.update(vocabulary).set({ status: "ARCHIVED", updatedAt: now }).where(eq(vocabulary.id, id));
    await tx.insert(vocabularyExclusions).values({ headword: row.headword, partOfSpeech: row.partOfSpeech ?? "", reason: reason.trim(), decidedBy: actor, decidedAt: now }).onConflictDoUpdate({ target: [vocabularyExclusions.headword, vocabularyExclusions.partOfSpeech], set: { reason: reason.trim(), decidedBy: actor, decidedAt: now } });
    await tx.insert(vocabularyRevisions).values({ id: randomUUID(), vocabularyId: id, action: "EXCLUDE", changes: { status: [row.status, "ARCHIVED"], reason: [null, reason.trim()] }, changedBy: actor, changedAt: now });
    return true;
  });
}

/** A new word. Without Vietnamese sense groups its meaning starts empty, for an editor to write. */
/** ipaSource: null means the word's Wiktionary page. */
export type DraftEntry = { headword: string; partOfSpeech: string; cefrLevel: string; ipa: string; ipaUs: string | null; ipaSource?: Source | null; senseGroups: SenseGroup[]; gloss: string; levelSource: Source };

/** Adds new words as unreviewed DRAFT rows (no example yet) and sends the batch to REVIEW. */
export async function addDraftEntries(db: CatalogDb, entries: DraftEntry[], actor: string) {
  if (!entries.length) return 0;
  await ensureVocabularyBatch(db);
  return db.transaction(async (tx) => {
    const now = new Date();
    for (const entry of entries) {
      const choice: SensePick[] = entry.senseGroups.length ? [0] : [];
      const built = entry.senseGroups.length ? meaningFromChoice(entry.senseGroups, choice) : { meaning: "", sense: entry.gloss };
      const id = wordId(entry.headword, entry.partOfSpeech, entry.cefrLevel);
      const attribution: CatalogAttribution = { ipaUs: entry.ipaUs, sense: built.sense || entry.gloss, sources: { level: entry.levelSource, ...(entry.senseGroups.length ? { meaning: wiktionarySource(entry.headword, "meaning") } : {}), ipa: entry.ipaSource ?? wiktionarySource(entry.headword, "ipa") } };
      await tx.insert(vocabulary).values({ id, headword: entry.headword, partOfSpeech: entry.partOfSpeech, cefrLevel: entry.cefrLevel, ipa: entry.ipa, meaning: built.meaning || null, example: null, tags: ["d3", entry.cefrLevel.toLowerCase(), entry.partOfSpeech], attribution, senseGroups: entry.senseGroups, senseChoice: choice, status: "DRAFT", contentBatchId: VOCABULARY_BATCH_ID, createdAt: now, updatedAt: now });
      await tx.insert(vocabularyRevisions).values({ id: randomUUID(), vocabularyId: id, action: "CREATE", changes: { meaning: [null, built.meaning || null], ipa: [null, entry.ipa], cefrLevel: [null, entry.cefrLevel] }, changedBy: actor, changedAt: now });
    }
    await tx.update(contentBatches).set({ status: "REVIEW" }).where(eq(contentBatches.id, VOCABULARY_BATCH_ID));
    return entries.length;
  });
}

/** Every catalogue word that is not archived, with the rules' verdict. */
export async function checkCatalog(db: CatalogDb) {
  const rows = (await db.select(rowColumns).from(vocabulary).where(and(inCatalog, inArray(vocabulary.status, ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED"])))).map(toRow);
  return rows.map((row) => ({ row, issues: checkCatalogEntry(row) }));
}

/**
 * Publishes the reviewed DRAFT words that pass the rules. The batch must be APPROVED unless
 * `skipApproval` (throwaway test databases only). Unreviewed or failing words stay DRAFT, and
 * the batch goes back to REVIEW while any remain.
 */
export async function publishReviewed(db: CatalogDb, actor: string, options: { skipApproval?: boolean } = {}) {
  return db.transaction(async (tx) => {
    const [batch] = await tx.select({ status: contentBatches.status }).from(contentBatches).where(eq(contentBatches.id, VOCABULARY_BATCH_ID));
    if (!batch) throw new Error("The vocabulary batch does not exist in this database");
    if (batch.status !== "APPROVED" && !options.skipApproval) return { published: 0, waiting: 0, batchStatus: batch.status, refused: true as const };
    const drafts = (await tx.select(rowColumns).from(vocabulary).where(and(inCatalog, eq(vocabulary.status, "DRAFT")))).map(toRow);
    const ready = drafts.filter((row) => row.reviewedAt && checkCatalogEntry(row).length === 0);
    const now = new Date();
    for (let start = 0; start < ready.length; start += 500) {
      const ids = ready.slice(start, start + 500).map((row) => row.id);
      await tx.update(vocabulary).set({ status: "PUBLISHED", updatedAt: now }).where(inArray(vocabulary.id, ids));
      await tx.insert(vocabularyRevisions).values(ids.map((id) => ({ id: randomUUID(), vocabularyId: id, action: "PUBLISH", changes: { status: ["DRAFT", "PUBLISHED"] }, changedBy: actor, changedAt: now })));
    }
    const waiting = drafts.length - ready.length;
    const batchStatus = waiting ? "REVIEW" : "PUBLISHED";
    await tx.update(contentBatches).set({ status: batchStatus, reviewedBy: actor }).where(eq(contentBatches.id, VOCABULARY_BATCH_ID));
    return { published: ready.length, waiting, batchStatus, refused: false as const };
  });
}
