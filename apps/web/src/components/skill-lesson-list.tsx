import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/ui/level-badge";
import { Pill } from "@/components/ui/pill";
import { Eyebrow, Section } from "@/components/ui/section";
import type { Locale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { getRequestActor } from "@/modules/auth/request-actor";
import { listLessonCompletionHistory, listPublishedLessonCatalog, type PublishedLessonCatalogItem } from "@/modules/lessons/repository";

type LessonSkill = "LISTENING" | "READING" | "GRAMMAR" | "SPEAKING" | "WRITING";
const levels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function LessonGrid({ locale, lessons, completed }: { locale: Locale; lessons: PublishedLessonCatalogItem[]; completed: Set<string> }) {
  const copy = getSkillsCopy(locale);
  const minutes = locale === "vi" ? "phút" : "min";
  if (lessons.length === 0) return <p className="mt-6 text-muted">{copy.noLessons}</p>;
  return <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{lessons.map((lesson) => <Card className="flex flex-col" key={`${lesson.level}/${lesson.slug}`}>
    <div className="flex items-center justify-between gap-3"><LevelBadge>{lesson.level}</LevelBadge>{completed.has(lesson.title) && <span className="text-xs font-bold text-brand">✓ {copy.completed}</span>}</div>
    <h2 className="mt-4 flex-1 font-serif text-2xl font-bold">{lesson.title}</h2>
    <p className="mt-2 text-sm text-muted">{lesson.estimatedMinutes} {minutes}</p>
    <Link className="mt-5 inline-flex" href={`/learn/${lesson.level.toLowerCase()}/${lesson.slug}`}><Button>{copy.openExercise}</Button></Link>
  </Card>)}</div>;
}

/** Published lessons for one skill as a card grid, ordered by CEFR level. */
export async function SkillLessonCards({ locale, skill, completed = new Set<string>() }: { locale: Locale; skill: LessonSkill; completed?: Set<string> }) {
  const lessons = ((await listPublishedLessonCatalog().catch(() => null)) ?? []).filter((lesson) => lesson.skill === skill);
  return <LessonGrid locale={locale} lessons={lessons} completed={completed} />;
}

/**
 * Published lessons for one skill followed by the learner's completion history. With
 * `level`, the lessons are shown one CEFR level at a time behind a level selector.
 */
export async function SkillLessonList({ locale, skill, eyebrow, title, intro, level, basePath }: { locale: Locale; skill: LessonSkill; eyebrow: string; title: string; intro: string; level?: string; basePath?: string }) {
  const copy = getSkillsCopy(locale);
  let history: Awaited<ReturnType<typeof listLessonCompletionHistory>> = [];
  try { history = await listLessonCompletionHistory((await getRequestActor(false)).actor, skill); } catch { /* No learner cookie yet. */ }
  const completed = new Set(history.map((item) => item.title));
  const lessons = ((await listPublishedLessonCatalog().catch(() => null)) ?? []).filter((lesson) => lesson.skill === skill);
  const selected = level && basePath ? (levels.find((item) => item === level.toUpperCase()) ?? "A1") : null;

  return <Section>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{title}</h1>
    <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{intro}</p>
    {selected && basePath
      ? <>
        <nav className="mt-8 flex gap-2 overflow-x-auto pb-1" aria-label={copy.lessonsTitle}>{levels.map((item) => {
          const count = lessons.filter((lesson) => lesson.level === item).length;
          return <Pill key={item} href={`${basePath}?level=${item}`} active={item === selected} ariaCurrent className="shrink-0">{item} <span className="ml-1.5 opacity-70">{count}</span></Pill>;
        })}</nav>
        <LessonGrid locale={locale} lessons={lessons.filter((lesson) => lesson.level === selected)} completed={completed} />
      </>
      : <div className="mt-4"><LessonGrid locale={locale} lessons={lessons} completed={completed} /></div>}
    <h2 className="mt-12 font-serif text-3xl font-bold">{copy.history}</h2>
    <div className="mt-5 space-y-3">{history.length === 0 && <p className="text-muted">{copy.noHistory}</p>}{history.map((item) => <Card className="p-4" key={item.id}><p className="font-bold">{item.title}</p><p className="text-sm text-muted">{item.rawScore}/{item.totalQuestions} · {new Date(item.completedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}</p></Card>)}</div>
  </Section>;
}
