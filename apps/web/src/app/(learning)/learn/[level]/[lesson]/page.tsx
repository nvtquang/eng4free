import { notFound } from "next/navigation";
import { LessonRunner } from "@/components/lesson-runner";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillLabel } from "@/lib/skills-copy";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { findPublishedLesson } from "@/modules/lessons/repository";
import { lessonAfter } from "@/modules/path/path-order";
import { lessonHref, listCompletedLessonIds, listPathLessons } from "@/modules/path/repository";

export const dynamic = "force-dynamic";

/** The lesson to offer when this one is finished, following the path. */
async function nextLessonAfter(lessonId: string) {
  let learner = null;
  try { learner = (await getRequestLearner(false)).learner; } catch { /* A visitor without a learner follows the plain path order. */ }
  const [lessons, completed] = await Promise.all([listPathLessons(), listCompletedLessonIds(learner)]);
  const next = lessonAfter(lessons, completed, lessonId);
  return next ? { href: lessonHref(next), title: next.title } : null;
}

export default async function LessonPage({ params }: { params: Promise<{ level: string; lesson: string }> }) {
  const { level, lesson: slug } = await params;
  const locale = await getLocale();
  const copy = getMessages(locale).learning;
  const publishedLesson = await findPublishedLesson(level, slug);
  if (publishedLesson) return <Section className="max-w-4xl"><Eyebrow>{level.toUpperCase()}{publishedLesson.skill ? " · " + getSkillLabel(locale, publishedLesson.skill) : ""}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{publishedLesson.title}</h1><p className="mt-5 text-lg text-muted">{publishedLesson.estimatedMinutes} {copy.minutes}</p><LessonRunner lessonId={publishedLesson.id} blocks={publishedLesson.blocks} locale={locale} nextLesson={await nextLessonAfter(publishedLesson.id)} /></Section>;
  notFound();
}
