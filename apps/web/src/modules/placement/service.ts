import { randomUUID } from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import { createDatabase, type Database } from "@/db/client";
import { placementAttempts, placementItems } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";
import { demoAudioUrl } from "@/modules/media/demo-audio";
import { CEFR_ORDER, DEFAULT_START_LEVEL, PLACEMENT_SKILLS, PLACEMENT_TOTAL, advance, isCefrLevel, isFinished, pendingItem, placementResult, recordAnswer, type BankItem, type CefrLevel, type PlacementResult, type PlacementSkill, type PlacementState } from "./adaptive";

export class PlacementNotFoundError extends Error {}
export class PlacementConflictError extends Error {}

type StoredContent = { prompt: string; options: Array<{ id: string; text: string }>; passage?: string; playbackText?: string };
/** What the browser sees for the current question: no answer key, and no listening script when a recording exists. */
export type PublicPlacementQuestion = { itemId: string; skill: PlacementSkill; prompt: string; options: Array<{ id: string; text: string }>; passage?: string; audioUrl?: string; playbackText?: string };
export type SelfAssessedSkills = { SPEAKING: CefrLevel; WRITING: CefrLevel };
export type CompletedPlacement = PlacementResult & { selfAssessed: SelfAssessedSkills };
export type PlacementView = { attemptId: string; answered: number; total: number; question: PublicPlacementQuestion | null; finished: boolean; result: CompletedPlacement | null };
export type CanDoStatement = { skill: "SPEAKING" | "WRITING"; level: CefrLevel; canDo: { vi: string; en: string } };

function database(): Database {
  const db = createDatabase();
  if (!db) throw new Error("Database unavailable");
  return db;
}

async function loadBank(db: Database): Promise<BankItem[]> {
  const rows = await db.select({ id: placementItems.id, skill: placementItems.skill, level: placementItems.cefrLevel }).from(placementItems)
    .where(and(eq(placementItems.status, "PUBLISHED"), inArray(placementItems.skill, [...PLACEMENT_SKILLS])));
  return rows.flatMap((row) => isCefrLevel(row.level) ? [{ id: row.id, skill: row.skill as PlacementSkill, level: row.level }] : []);
}

async function publicQuestion(db: Database, state: PlacementState): Promise<PublicPlacementQuestion | null> {
  const pending = pendingItem(state);
  if (!pending) return null;
  const [row] = await db.select({ content: placementItems.content }).from(placementItems).where(eq(placementItems.id, pending.itemId));
  if (!row) return null;
  const content = row.content as StoredContent;
  const audioUrl = demoAudioUrl(content.playbackText);
  return {
    itemId: pending.itemId,
    skill: pending.skill,
    prompt: content.prompt,
    options: content.options,
    ...(content.passage ? { passage: content.passage } : {}),
    // Without a generated recording the browser reads the script aloud instead.
    ...(audioUrl ? { audioUrl } : content.playbackText ? { playbackText: content.playbackText } : {})
  };
}

async function toView(db: Database, row: { id: string; state: unknown; result: unknown }): Promise<PlacementView> {
  const state = row.state as PlacementState;
  const answered = state.asked.filter((item) => item.correct !== null).length;
  return { attemptId: row.id, answered, total: PLACEMENT_TOTAL, question: await publicQuestion(db, state), finished: isFinished(state), result: (row.result as CompletedPlacement | null) ?? null };
}

async function ownedAttempt(db: Database, learner: LearnerRef, attemptId: string) {
  const [row] = await db.select().from(placementAttempts).where(and(eq(placementAttempts.id, attemptId), eq(placementAttempts.learnerId, learner.learnerId)));
  if (!row) throw new PlacementNotFoundError("Placement attempt not found");
  return row;
}

/** Starts a new placement run at the self-assessed level (B1 when none). */
export async function startPlacement(learner: LearnerRef, startLevel?: CefrLevel): Promise<PlacementView> {
  const db = database();
  const bank = await loadBank(db);
  if (!bank.length) throw new PlacementNotFoundError("The placement test has no published questions");
  const state = advance(bank, { startLevel: startLevel ?? DEFAULT_START_LEVEL, asked: [] });
  const [row] = await db.insert(placementAttempts).values({ id: randomUUID(), learnerId: learner.learnerId, state }).returning();
  return toView(db, row!);
}

export async function getPlacement(learner: LearnerRef, attemptId: string): Promise<PlacementView> {
  const db = database();
  return toView(db, await ownedAttempt(db, learner, attemptId));
}

/** Grades the answer to the pending question on the server and queues the next one. */
export async function answerPlacement(learner: LearnerRef, attemptId: string, itemId: string, optionId: string): Promise<PlacementView> {
  const db = database();
  const bank = await loadBank(db);
  const row = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(placementAttempts).where(and(eq(placementAttempts.id, attemptId), eq(placementAttempts.learnerId, learner.learnerId))).for("update");
    if (!current) throw new PlacementNotFoundError("Placement attempt not found");
    if (current.completedAt) throw new PlacementConflictError("This placement test is already complete");
    const state = current.state as PlacementState;
    if (pendingItem(state)?.itemId !== itemId) throw new PlacementConflictError("That question is not the one being asked");
    const [item] = await tx.select({ content: placementItems.content, answer: placementItems.answer }).from(placementItems).where(eq(placementItems.id, itemId));
    const options = (item?.content as StoredContent | undefined)?.options ?? [];
    if (!options.some((option) => option.id === optionId)) throw new PlacementConflictError("Unknown option");
    const correct = (item!.answer as { correctOptionId?: string }).correctOptionId === optionId;
    const next = advance(bank, recordAnswer(state, itemId, correct));
    const [updated] = await tx.update(placementAttempts).set({ state: next, updatedAt: new Date() }).where(eq(placementAttempts.id, current.id)).returning();
    return updated!;
  });
  return toView(db, row);
}

/** Finishes a run: scores the four skills and stores the Speaking/Writing self-assessment. */
export async function completePlacement(learner: LearnerRef, attemptId: string, selfAssessed: SelfAssessedSkills): Promise<CompletedPlacement> {
  const db = database();
  const current = await ownedAttempt(db, learner, attemptId);
  if (current.result) return current.result as CompletedPlacement;
  const state = current.state as PlacementState;
  if (!isFinished(state)) throw new PlacementConflictError("Answer every question before finishing");
  const result: CompletedPlacement = { ...placementResult(state), selfAssessed };
  await db.update(placementAttempts).set({ result, completedAt: new Date(), updatedAt: new Date() }).where(eq(placementAttempts.id, current.id));
  return result;
}

/** The learner's completed placement run with this id, used when onboarding saves the profile. */
export async function findCompletedPlacement(learner: LearnerRef, attemptId: string): Promise<CompletedPlacement | null> {
  const db = createDatabase();
  if (!db) return null;
  const [row] = await db.select({ result: placementAttempts.result }).from(placementAttempts).where(and(eq(placementAttempts.id, attemptId), eq(placementAttempts.learnerId, learner.learnerId)));
  return (row?.result as CompletedPlacement | null) ?? null;
}

/** Published can-do statements for the Speaking and Writing self-assessment, A1 to C2. */
export async function listCanDoStatements(): Promise<CanDoStatement[]> {
  const db = createDatabase();
  if (!db) return [];
  const rows = await db.select({ skill: placementItems.skill, level: placementItems.cefrLevel, content: placementItems.content }).from(placementItems)
    .where(and(eq(placementItems.status, "PUBLISHED"), inArray(placementItems.skill, ["SPEAKING", "WRITING"])));
  return rows.flatMap((row) => isCefrLevel(row.level) ? [{ skill: row.skill as "SPEAKING" | "WRITING", level: row.level, canDo: (row.content as { canDo: { vi: string; en: string } }).canDo }] : [])
    .sort((a, b) => a.skill.localeCompare(b.skill) || CEFR_ORDER.indexOf(a.level) - CEFR_ORDER.indexOf(b.level));
}
