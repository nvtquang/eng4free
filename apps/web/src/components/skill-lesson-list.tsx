import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/ui/level-badge";
import { Eyebrow, Section } from "@/components/ui/section";
import type { Locale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { getRequestActor } from "@/modules/auth/request-actor";
import { listLessonCompletionHistory, listPublishedLessonCatalog } from "@/modules/lessons/repository";

type LessonSkill = "LISTENING" | "READING" | "GRAMMAR";

/** Published lessons for one skill, grouped by CEFR level, followed by the learner's completion history. */
export async function SkillLessonList({ locale, skill, eyebrow, title, intro }: { locale: Locale; skill: LessonSkill; eyebrow: string; title: string; intro: string }) {
  const copy = getSkillsCopy(locale);
  const lessons = ((await listPublishedLessonCatalog().catch(() => null)) ?? []).filter((lesson) => lesson.skill === skill);
  let history: Awaited<ReturnType<typeof listLessonCompletionHistory>> = [];
  try { history = await listLessonCompletionHistory((await getRequestActor(false)).actor, skill); } catch { /* No learner cookie yet. */ }
  const completed = new Set(history.map((item) => item.title));
  const minutes = locale === "vi" ? "phút" : "min";
  return <Section>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{title}</h1>
    <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{intro}</p>
    {lessons.length === 0 && <p className="mt-10 text-muted">{copy.noLessons}</p>}
    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{lessons.map((lesson) => <Card className="flex flex-col" key={`${lesson.level}/${lesson.slug}`}>
      <div className="flex items-center justify-between gap-3"><LevelBadge>{lesson.level}</LevelBadge>{completed.has(lesson.title) && <span className="text-xs font-bold text-brand">✓ {copy.completed}</span>}</div>
      <h2 className="mt-4 flex-1 font-serif text-2xl font-bold">{lesson.title}</h2>
      <p className="mt-2 text-sm text-muted">{lesson.estimatedMinutes} {minutes}</p>
      <Link className="mt-5 inline-flex" href={`/learn/${lesson.level.toLowerCase()}/${lesson.slug}`}><Button>{copy.openExercise}</Button></Link>
    </Card>)}</div>
    <h2 className="mt-12 font-serif text-3xl font-bold">{copy.history}</h2>
    <div className="mt-5 space-y-3">{history.length === 0 && <p className="text-muted">{copy.noHistory}</p>}{history.map((item) => <Card className="p-4" key={item.id}><p className="font-bold">{item.title}</p><p className="text-sm text-muted">{item.rawScore}/{item.totalQuestions} · {new Date(item.completedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}</p></Card>)}</div>
  </Section>;
}
