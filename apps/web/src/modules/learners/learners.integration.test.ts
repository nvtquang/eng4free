import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { learnerLinks, learnerProfiles, learners, lessonCompletions, lessons, progressEvents, vocabulary, vocabularyReviews } from "@/db/schema";
import { mergeLearners } from "./merge";
import { addLink, createLinkedLearner, findLinkedLearner } from "./repository";

/** Runs only with LEARNERS_TEST_DATABASE_URL pointing at a disposable database (e.g. english4free_e2e). */
const url = process.env.LEARNERS_TEST_DATABASE_URL;
const client = url ? postgres(url, { prepare: false, max: 2 }) : null;
const db = client ? drizzle(client, { schema }) : null;
const created: string[] = [];

afterAll(async () => {
  if (db && created.length) await db.delete(learners).where(inArray(learners.id, created));
  await client?.end();
});

const fsrs = { dueAt: new Date(), lastReview: null, difficulty: 5, stability: 1, retrievability: 1, elapsedDays: 0, scheduledDays: 1, learningSteps: 0, repetitions: 1, lapses: 0, fsrsState: 1 };

describe.skipIf(!db)("learner links and merging (database)", () => {
  it("links a guest and an account to one learner without moving data", async () => {
    const guestId = randomUUID(); const userId = randomUUID();
    const learnerId = await createLinkedLearner(db!, "GUEST", guestId); created.push(learnerId);
    await addLink(db!, "USER", userId, learnerId);
    expect(await findLinkedLearner(db!, "USER", userId)).toBe(learnerId);
    expect(await findLinkedLearner(db!, "GUEST", guestId)).toBe(learnerId);
  });

  it("merges two learners: moves rows, keeps the newer duplicate, re-points links and deletes the source", async () => {
    const from = await createLinkedLearner(db!, "GUEST", randomUUID());
    const into = await createLinkedLearner(db!, "USER", randomUUID()); created.push(into);
    const [word] = await db!.select({ id: vocabulary.id }).from(vocabulary).limit(1);
    const [lesson] = await db!.select({ id: lessons.id }).from(lessons).limit(1);
    const older = new Date(Date.UTC(2026, 0, 1)); const newer = new Date(Date.UTC(2026, 5, 1));
    await db!.insert(vocabularyReviews).values([{ id: randomUUID(), learnerId: from, vocabularyId: word!.id, ...fsrs, repetitions: 9, updatedAt: newer }, { id: randomUUID(), learnerId: into, vocabularyId: word!.id, ...fsrs, repetitions: 1, updatedAt: older }]);
    await db!.insert(lessonCompletions).values([{ id: randomUUID(), learnerId: from, lessonId: lesson!.id, rawScore: 1, totalQuestions: 5, updatedAt: older }, { id: randomUUID(), learnerId: into, lessonId: lesson!.id, rawScore: 4, totalQuestions: 5, updatedAt: newer }]);
    await db!.insert(learnerProfiles).values({ id: randomUUID(), learnerId: from, goal: "toeic", cefrLevel: "B1", minutesPerDay: 20 });
    await db!.insert(progressEvents).values({ id: randomUUID(), learnerId: from, type: "LESSON_COMPLETED", idempotencyKey: `merge-test:${randomUUID()}` });

    await mergeLearners(db!, from, into);

    const reviews = await db!.select().from(vocabularyReviews).where(eq(vocabularyReviews.learnerId, into));
    expect(reviews.filter((row) => row.vocabularyId === word!.id).map((row) => row.repetitions)).toEqual([9]);
    const completions = await db!.select().from(lessonCompletions).where(eq(lessonCompletions.learnerId, into));
    expect(completions.filter((row) => row.lessonId === lesson!.id).map((row) => row.rawScore)).toEqual([4]);
    expect((await db!.select().from(learnerProfiles).where(eq(learnerProfiles.learnerId, into))).map((row) => row.goal)).toEqual(["toeic"]);
    expect((await db!.select().from(progressEvents).where(eq(progressEvents.learnerId, into))).length).toBe(1);
    expect(await db!.select().from(learners).where(eq(learners.id, from))).toEqual([]);
    expect((await db!.select().from(learnerLinks).where(eq(learnerLinks.learnerId, into))).map((row) => row.kind).sort()).toEqual(["GUEST", "USER"]);
  });
});
