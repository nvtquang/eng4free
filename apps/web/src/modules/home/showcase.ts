import { and, asc, count, eq, inArray, isNotNull } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { courseLevels, courseUnits, examParts, exams, lessonBlocks, lessons, questions, topics, vocabulary } from "@/db/schema";

/** Real numbers and samples for the home page, so it shows what is actually in the app. */
export type HomeShowcase = {
  counts: { lessons: number; words: number; examQuestions: number; topics: number };
  word: { headword: string; ipa: string | null; meaning: string; level: string } | null;
  /** A practice question from a lesson (never from the placement bank, so no test item is exposed). */
  question: { lesson: string; prompt: string; options: string[] } | null;
};

export async function loadHomeShowcase(): Promise<HomeShowcase | null> {
  const db = createDatabase();
  if (!db) return null;
  const [[lessonCount], [wordCount], [questionCount], [topicCount], [word], [question]] = await Promise.all([
    db.select({ value: count() }).from(lessons).where(eq(lessons.status, "PUBLISHED")),
    db.select({ value: count() }).from(vocabulary).where(eq(vocabulary.status, "PUBLISHED")),
    db.select({ value: count() }).from(questions).innerJoin(examParts, eq(questions.examPartId, examParts.id)).innerJoin(exams, eq(examParts.examId, exams.id)).where(and(eq(questions.status, "PUBLISHED"), eq(exams.status, "PUBLISHED"))),
    db.select({ value: count() }).from(topics).where(and(eq(topics.status, "PUBLISHED"), inArray(topics.kind, ["FREE_SPEAKING", "FREE_WRITING"]))),
    db.select({ headword: vocabulary.headword, ipa: vocabulary.ipa, meaning: vocabulary.meaning, level: vocabulary.cefrLevel }).from(vocabulary)
      .where(and(eq(vocabulary.status, "PUBLISHED"), eq(vocabulary.cefrLevel, "B1"), isNotNull(vocabulary.ipa))).orderBy(asc(vocabulary.headword)).limit(1).offset(40),
    db.select({ lesson: lessons.title, content: lessonBlocks.content }).from(lessonBlocks)
      .innerJoin(lessons, eq(lessonBlocks.lessonId, lessons.id)).innerJoin(courseUnits, eq(lessons.unitId, courseUnits.id)).innerJoin(courseLevels, eq(courseUnits.courseLevelId, courseLevels.id))
      .where(and(eq(lessonBlocks.type, "QUESTION_SET"), eq(lessons.status, "PUBLISHED"), eq(lessons.skill, "GRAMMAR"), eq(courseLevels.cefrLevel, "B1"))).orderBy(asc(courseUnits.sortOrder), asc(lessons.createdAt)).limit(1)
  ]);
  const content = (question?.content as { questions?: Array<{ prompt?: string; options?: Array<{ text: string }> }> } | undefined)?.questions?.[0];
  return {
    counts: { lessons: lessonCount?.value ?? 0, words: wordCount?.value ?? 0, examQuestions: questionCount?.value ?? 0, topics: topicCount?.value ?? 0 },
    word: word?.meaning && word.level ? { headword: word.headword, ipa: word.ipa, meaning: word.meaning, level: word.level } : null,
    question: content?.prompt && content.options ? { lesson: question!.lesson, prompt: content.prompt, options: content.options.map((option) => option.text) } : null
  };
}
