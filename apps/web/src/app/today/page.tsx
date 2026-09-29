import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { getLocale, getMessages } from "@/lib/i18n";
import { getRequestActor } from "@/modules/auth/request-actor";
import { buildTodayPlan, type TodayPlan } from "@/modules/today/recommendations";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const locale = await getLocale();
  const copy = getMessages(locale).today;
  let plan: TodayPlan | null = null;
  try {
    const { actor } = await getRequestActor(false);
    plan = await buildTodayPlan(actor);
  } catch {
    // No learner cookie yet; treated the same as no profile.
  }

  if (!plan) {
    return <Section className="max-w-2xl">
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{copy.emptyTitle}</h1>
      <p className="mt-4 leading-7 text-muted">{copy.emptyText}</p>
      <div className="mt-8"><Link href="/onboarding"><Button>{copy.setup}</Button></Link></div>
    </Section>;
  }

  const goalLabels: Record<TodayPlan["profile"]["goal"], string> = { communication: copy.goalCommunication, toeic: copy.goalToeic, ielts: copy.goalIelts };

  return <Section>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-serif text-4xl font-bold sm:text-5xl">{copy.title}</h1><p className="mt-3 leading-7 text-muted">{copy.greeting}</p></div>
      <Link className="text-sm font-bold text-brand hover:text-brand-deep" href="/onboarding">{copy.redo} →</Link>
    </div>

    <div className="mt-6 flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold"><span className="text-muted">{copy.levelLabel}</span><LevelBadge>{plan.profile.cefrLevel}</LevelBadge></span>
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold"><span className="text-muted">{copy.goalLabel}</span>{goalLabels[plan.profile.goal]}</span>
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-brand-deep">{copy.goalMinutes.replace("{minutes}", String(plan.minutesGoal))}</span>
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <Card className="flex flex-col">
        <h2 className="font-serif text-2xl font-bold">{copy.nextLessonTitle}</h2>
        {plan.nextLesson
          ? <><p className="mt-4 flex-1 text-lg font-bold">{plan.nextLesson.title}</p><div className="mt-4 flex items-center gap-2 text-sm text-muted"><LevelBadge>{plan.nextLesson.level}</LevelBadge><span>{plan.nextLesson.estimatedMinutes} {getMessages(locale).learning.minutes}</span></div><Link className="mt-6" href={`/learn/${plan.nextLesson.level.toLowerCase()}/${plan.nextLesson.slug}`}><Button>{copy.startLesson}</Button></Link></>
          : <p className="mt-4 flex-1 leading-7 text-muted">{copy.noLesson}</p>}
      </Card>

      <Card className="flex flex-col">
        <h2 className="font-serif text-2xl font-bold">{copy.vocabularyTitle}</h2>
        {plan.vocabularyDue > 0
          ? <><p className="mt-4 flex-1"><span className="font-serif text-5xl font-bold text-brand">{plan.vocabularyDue}</span></p><p className="text-sm text-muted">{copy.vocabularyDue.replace("{count}", String(plan.vocabularyDue))}</p><Link className="mt-6" href="/vocabulary"><Button>{copy.reviewNow}</Button></Link></>
          : <><p className="mt-4 flex-1 leading-7 text-muted">{copy.vocabularyNone}</p><Link className="mt-6" href="/vocabulary"><Button variant="secondary">{copy.learnVocabulary}</Button></Link></>}
      </Card>

      {plan.exam && <Card className="flex flex-col">
        <h2 className="font-serif text-2xl font-bold">{copy.examTitle}</h2>
        <p className="mt-4 flex-1 text-lg font-bold">{plan.exam.title}</p>
        <Link className="mt-6" href={`/exams/${plan.exam.slug}`}><Button variant="secondary">{copy.practiceExam}</Button></Link>
      </Card>}

      <Card className="flex flex-col">
        <h2 className="font-serif text-2xl font-bold">{copy.mistakesTitle}</h2>
        {plan.mistakesDue > 0
          ? <><p className="mt-4 flex-1"><span className="font-serif text-5xl font-bold text-brand">{plan.mistakesDue}</span></p><p className="text-sm text-muted">{copy.mistakesDue.replace("{count}", String(plan.mistakesDue))}</p><Link className="mt-6" href="/mistakes"><Button>{copy.practiceMistakes}</Button></Link></>
          : <p className="mt-4 flex-1 leading-7 text-muted">{copy.mistakesNone}</p>}
      </Card>
    </div>
  </Section>;
}
