import { notFound } from "next/navigation";
import { LessonRunner } from "@/components/lesson-runner";
import { LessonWords } from "@/components/lesson-words";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillLabel } from "@/lib/skills-copy";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { findPublishedLesson } from "@/modules/lessons/repository";
import { lessonAfter } from "@/modules/path/path-order";
import { lessonHref, listCompletedLessonIds, listPathLessons } from "@/modules/path/repository";
import type { LearnerRef } from "@/modules/learners/types";
import { listLessonWords } from "@/modules/vocabulary/lesson-vocabulary";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ level: string; lesson: string }> }) {
  const { level, lesson: slug } = await params;
  const lesson = await findPublishedLesson(level, slug).catch(() => null);
  if (!lesson) return { title: "404", robots: { index: false } };
  const cefr = level.toUpperCase();
  return pageMetadata({
    vi: { title: `${lesson.title} (${cefr})`, description: `Bài ${getSkillLabel("vi", lesson.skill ?? "").toLowerCase() || "học"} trình độ ${cefr}, khoảng ${lesson.estimatedMinutes} phút: lý thuyết, ví dụ và bài tập có lời giải.` },
    en: { title: `${lesson.title} (${cefr})`, description: `A ${cefr} ${getSkillLabel("en", lesson.skill ?? "").toLowerCase() || "English"} lesson of about ${lesson.estimatedMinutes} minutes, with explanations, examples and practice with answers.` }
  }, `/learn/${level.toLowerCase()}/${slug}`);
}

/** The lesson to offer when this one is finished, following the path. */
async function nextLessonAfter(lessonId: string, learner: LearnerRef | null) {
  const [lessons, completed] = await Promise.all([listPathLessons(), listCompletedLessonIds(learner)]);
  const next = lessonAfter(lessons, completed, lessonId);
  return next ? { href: lessonHref(next), title: next.title } : null;
}

export default async function LessonPage({ params }: { params: Promise<{ level: string; lesson: string }> }) {
  const { level, lesson: slug } = await params;
  const locale = await getLocale();
  const publishedLesson = await findPublishedLesson(level, slug);
  let learner: LearnerRef | null = null;
  try { learner = (await getRequestLearner(false)).learner; } catch { /* A visitor without a learner follows the plain path order and has no wordbook yet. */ }
  const messages = getMessages(locale);
  if (publishedLesson) return <Section className="max-w-4xl"><Eyebrow>{level.toUpperCase()}{publishedLesson.skill ? " · " + getSkillLabel(locale, publishedLesson.skill) : ""}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{publishedLesson.title}</h1><p className="mt-5 text-lg text-muted">{publishedLesson.estimatedMinutes} {messages.learning.minutes}</p><LessonRunner lessonId={publishedLesson.id} blocks={publishedLesson.blocks} locale={locale} nextLesson={await nextLessonAfter(publishedLesson.id, learner)} /><LessonWords words={await listLessonWords(level, publishedLesson.blocks, learner)} copy={messages.wordbook} /></Section>;
  notFound();
}
