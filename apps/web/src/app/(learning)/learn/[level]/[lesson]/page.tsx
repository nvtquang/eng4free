import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonRunner } from "@/components/lesson-runner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { getLesson } from "@/modules/courses/cefr-path";
import { findPublishedLesson } from "@/modules/lessons/repository";

export default async function LessonPage({ params }: { params: Promise<{ level: string; lesson: string }> }) {
  const { level, lesson: slug } = await params;
  const locale = await getLocale();
  const copy = getMessages(locale).learning;
  const publishedLesson = await findPublishedLesson(level, slug);
  if (publishedLesson) return <Section className="max-w-4xl"><Eyebrow>{level.toUpperCase()} · {publishedLesson.skill ?? "GENERAL"}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{publishedLesson.title}</h1><p className="mt-5 text-lg text-muted">{publishedLesson.estimatedMinutes} {copy.minutes}</p><LessonRunner lessonId={publishedLesson.id} blocks={publishedLesson.blocks} locale={locale} /></Section>;
  const lesson = getLesson(level, slug);
  if (!lesson) notFound();
  return <Section className="max-w-4xl"><Eyebrow>{level.toUpperCase()} · {lesson.skill}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{lesson.title[locale]}</h1><p className="mt-5 text-lg text-muted">{lesson.minutes} {copy.minutes}</p><Card className="mt-12"><p className="text-sm font-bold text-brand">{copy.lessonProgress}</p><h2 className="mt-8 font-serif text-2xl font-bold">{copy.startLesson}</h2><p className="mt-3 leading-7 text-muted">{locale === "vi" ? "Bài học này chưa được xuất bản trong bản demo local." : "This lesson has not been published in the local demo yet."}</p><Link className="mt-7 inline-flex" href="/learn"><Button>{copy.continue}</Button></Link></Card></Section>;
}
