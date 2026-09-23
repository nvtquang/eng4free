import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { getLocale, getMessages } from "@/lib/i18n";
import { cefrPath } from "@/modules/courses/cefr-path";
import { listPublishedLessonCatalog } from "@/modules/lessons/repository";

export default async function LearnPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = messages.learning;
  const catalog = await listPublishedLessonCatalog();
  return <Section><Eyebrow>{copy.eyebrow}</Eyebrow><h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold tracking-tight sm:text-6xl">{copy.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{copy.description}</p><div className="mt-12 grid gap-5 lg:grid-cols-2">{cefrPath.map((level) => {
    const published = catalog?.filter((lesson) => lesson.level === level.level) ?? [];
    const displayLessons = published.length > 0 ? published.map((lesson) => ({ slug: lesson.slug, title: lesson.title, minutes: lesson.estimatedMinutes })) : level.lessons.map((lesson) => ({ slug: lesson.slug, title: lesson.title[locale], minutes: lesson.minutes }));
    return <Card key={level.level}><div className="flex items-start justify-between gap-4"><div><LevelBadge>{level.level}</LevelBadge><h2 className="mt-4 font-serif text-3xl font-bold">{level.title[locale]}</h2></div><span className="text-sm font-bold text-muted">{displayLessons.length} {copy.lessons}</span></div><p className="mt-4 leading-7 text-muted">{level.description[locale]}</p><div className="mt-7 space-y-2 border-t border-line pt-5">{displayLessons.map((lesson) => <Link key={lesson.slug} href={`/learn/${level.level.toLowerCase()}/${lesson.slug}`} className="flex items-center justify-between rounded-ui px-3 py-2 text-sm font-semibold hover:bg-brand-soft"><span>{lesson.title}</span><span className="text-muted">{lesson.minutes} {copy.minutes}</span></Link>)}</div><Link className="mt-6 inline-flex" href={`/learn/${level.level.toLowerCase()}/${displayLessons[0].slug}`}><Button>{copy.continue}</Button></Link></Card>;
  })}</div></Section>;
}
