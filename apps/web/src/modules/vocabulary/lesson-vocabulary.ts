import { and, eq, inArray } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { vocabulary, vocabularyReviews } from "@/db/schema";
import type { LearnerRef } from "@/modules/learners/types";
import type { LearnerLessonBlock } from "@/modules/lessons/repository";
import { PATH_LEVELS } from "@/modules/path/path-order";
import { findWordsInText } from "./lesson-words";

export type LessonWord = { id: string; headword: string; partOfSpeech: string | null; ipa: string | null; meaning: string | null; saved: boolean };

const MAX_WORDS = 8;

/** What a learner reads and hears in a lesson; answer keys are not part of learner blocks. */
function lessonText(blocks: LearnerLessonBlock[]): string {
  return blocks.map((block) => {
    if (block.type === "RICH_TEXT") return `${block.content.heading} ${block.content.body}`;
    if (block.type === "MEDIA") return `${block.content.heading} ${block.content.transcript}`;
    return [block.content.instruction, ...block.content.questions.flatMap((question) => [question.prompt, ...question.options.map((option) => option.text)])].join(" ");
  }).join("\n");
}

/**
 * Published vocabulary at the lesson's level (and the level below when that finds few) that
 * appears in the lesson, so the learner can save it to the review deck while studying.
 */
export async function listLessonWords(level: string, blocks: LearnerLessonBlock[], learner: LearnerRef | null): Promise<LessonWord[]> {
  const db = createDatabase();
  if (!db) return [];
  const index = PATH_LEVELS.indexOf(level.toUpperCase() as (typeof PATH_LEVELS)[number]);
  if (index < 0) return [];
  const text = lessonText(blocks);
  const columns = { id: vocabulary.id, headword: vocabulary.headword, partOfSpeech: vocabulary.partOfSpeech, ipa: vocabulary.ipa, meaning: vocabulary.meaning };
  const atLevel = (cefr: string) => db.select(columns).from(vocabulary).where(and(eq(vocabulary.status, "PUBLISHED"), eq(vocabulary.cefrLevel, cefr))).orderBy(vocabulary.headword);
  let words = findWordsInText(text, await atLevel(PATH_LEVELS[index]!), MAX_WORDS);
  if (words.length < 3 && index > 0) words = [...words, ...findWordsInText(text, await atLevel(PATH_LEVELS[index - 1]!), MAX_WORDS - words.length)];
  if (!words.length) return [];
  const saved = learner ? new Set((await db.select({ id: vocabularyReviews.vocabularyId }).from(vocabularyReviews).where(and(eq(vocabularyReviews.learnerId, learner.learnerId), inArray(vocabularyReviews.vocabularyId, words.map((word) => word.id))))).map((row) => row.id)) : new Set<string>();
  return words.map((word) => ({ ...word, saved: saved.has(word.id) }));
}
