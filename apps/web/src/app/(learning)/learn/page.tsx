import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { getCefrLevelCopy } from "@/lib/cefr-levels";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillLabel } from "@/lib/skills-copy";
import { getRequestLearner } from "@/modules/auth/request-actor";
import type { LearnerRef } from "@/modules/learners/types";
import { findLearnerProfile } from "@/modules/onboarding/repository";
import { PATH_LEVELS, buildLevelPath, type LessonStatus } from "@/modules/path/path-order";
import { lessonHref, listCompletedLessonIds, listPathLessons } from "@/modules/path/repository";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Lộ trình học tiếng Anh A1–C2", description: "Lộ trình theo chủ đề cho từng trình độ CEFR: Ngữ pháp, Nghe, Đọc, Nói và Viết, luôn có gợi ý bài học tiếp theo." }, en: { title: "English learning path, A1–C2", description: "A topic-based path for every CEFR level with Grammar, Listening, Reading, Speaking and Writing lessons, always suggesting the next lesson." } }, "/learn");
}

export const dynamic = "force-dynamic";

const statusStyle: Record<LessonStatus, string> = {
  done: "bg-brand text-white",
  current: "border-2 border-brand bg-surface text-brand",
  todo: "border border-line bg-surface text-muted"
};

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = messages.pathPage;
  let learner: LearnerRef | null = null;
  let profileLevel: string | null = null;
  try {
    learner = (await getRequestLearner(false)).learner;
    profileLevel = (await findLearnerProfile(learner))?.cefrLevel ?? null;
  } catch {
    // A visitor without a learner sees the path without progress.
  }
  const requested = (await searchParams).level?.toUpperCase();
  const level = PATH_LEVELS.find((item) => item === requested) ?? PATH_LEVELS.find((item) => item === profileLevel) ?? "A1";
  const [lessons, completed] = await Promise.all([listPathLessons().catch(() => []), listCompletedLessonIds(learner).catch(() => new Set<string>())]);
  const path = buildLevelPath(lessons, completed, level);
  const levelCopy = getCefrLevelCopy(level, locale);
  const statusLabel: Record<LessonStatus, string> = { done: copy.statusDone, current: copy.statusCurrent, todo: copy.statusTodo };

  return <Section>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
    <p className="mt-4 max-w-2xl leading-7 text-muted">{copy.description}</p>

    <nav className="mt-8 flex gap-2 overflow-x-auto pb-1" aria-label={copy.title}>{PATH_LEVELS.map((item) => <Link key={item} href={`/learn?level=${item}`} aria-current={item === level ? "page" : undefined} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${item === level ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"}`}>{item}{item === profileLevel ? " ★" : ""}</Link>)}</nav>
    {profileLevel && <p className="mt-2 text-xs text-muted">★ {copy.yourLevel}</p>}

    <Card className="mt-6 bg-brand-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><LevelBadge>{level}</LevelBadge><h2 className="mt-3 font-serif text-3xl font-bold">{levelCopy.title}</h2><p className="mt-2 max-w-2xl leading-7 text-muted">{levelCopy.description}</p></div>
        {path.total > 0 && <p className="text-sm font-bold text-muted">{copy.progress.replace("{done}", String(path.completed)).replace("{total}", String(path.total))}</p>}
      </div>
      {path.total > 0 && <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={path.completed} aria-valuemin={0} aria-valuemax={path.total}><div className="h-full rounded-full bg-brand" style={{ width: `${Math.round((path.completed / path.total) * 100)}%` }} /></div>}
      <div className="mt-6">{path.next
        ? <Link href={lessonHref(path.next)}><Button>{copy.continue}: {path.next.title}</Button></Link>
        : <p className="font-bold text-brand-deep">{path.total ? copy.levelDone : copy.empty}</p>}</div>
    </Card>

    <ol className="mt-8 space-y-6">{path.units.map((unit, unitIndex) => <li key={unit.title}><Card>
      <h3 className="font-serif text-2xl font-bold"><span className="mr-2 text-muted">{unitIndex + 1}.</span>{unit.title}</h3>
      <ul className="mt-5 space-y-2">{unit.lessons.map((lesson) => <li key={lesson.id}><Link href={lessonHref(lesson)} className={`flex items-center gap-3 rounded-ui px-3 py-3 transition hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${lesson.status === "current" ? "bg-brand-soft/60" : ""}`}>
        <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${statusStyle[lesson.status]}`}>{lesson.status === "done" ? "✓" : lesson.status === "current" ? "▶" : ""}</span>
        <span className="min-w-0 flex-1"><span className="block font-semibold">{lesson.title}</span><span className="block text-xs text-muted">{lesson.skill ? getSkillLabel(locale, lesson.skill) : ""} · {lesson.estimatedMinutes} {messages.learning.minutes}</span></span>
        <span className="shrink-0 text-xs font-bold text-muted">{statusLabel[lesson.status]}</span>
      </Link></li>)}</ul>
    </Card></li>)}</ol>

    <Card className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <div><h3 className="font-serif text-2xl font-bold">{copy.vocabularyTitle.replace("{level}", level)}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-muted">{copy.vocabularyText.replace("{level}", level)}</p></div>
      <Link href={`/vocabulary?level=${level}`}><Button variant="secondary">{copy.vocabularyAction}</Button></Link>
    </Card>
  </Section>;
}
