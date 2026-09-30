import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { getLocale, getMessages } from "@/lib/i18n";
import { practiceHref } from "@/lib/practice-links";
import { getSkillLabel } from "@/lib/skills-copy";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { lessonHref } from "@/modules/path/repository";
import { buildTodayPlan, type TodayPlan } from "@/modules/today/recommendations";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = messages.today;
  let plan: TodayPlan | null = null;
  try {
    plan = await buildTodayPlan((await getRequestLearner(false)).learner);
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
  const minutesShare = Math.min(100, Math.round((plan.minutesToday / Math.max(1, plan.minutesGoal)) * 100));
  const next = plan.nextLesson;
  const weakLabel = plan.weakSkill ? messages.onboarding.skills[plan.weakSkill.skill] : "";

  return <Section>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-serif text-4xl font-bold sm:text-5xl">{copy.title}</h1><p className="mt-3 leading-7 text-muted">{copy.greeting}</p></div>
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2"><span className="text-muted">{copy.levelLabel}</span><LevelBadge>{plan.profile.cefrLevel}</LevelBadge></span>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2"><span className="text-muted">{copy.goalLabel}</span>{goalLabels[plan.profile.goal]}</span>
        <Link className="px-2 text-brand hover:text-brand-deep" href="/profile">{copy.profileLink} →</Link>
      </div>
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Card className="flex flex-col justify-between bg-brand-soft">
        {next
          ? <>
            <div>
              <p className="text-sm font-bold text-brand">{copy.continueHint}</p>
              <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{next.title}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted"><LevelBadge>{next.level}</LevelBadge><span>{next.unitTitle}</span>{next.skill && <span>· {getSkillLabel(locale, next.skill)}</span>}<span>· {next.estimatedMinutes} {messages.learning.minutes}</span></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3"><Link href={lessonHref(next)}><Button className="min-h-12 px-8 text-base">{copy.continueLabel}: {next.title}</Button></Link><Link href="/learn"><Button variant="secondary" className="min-h-12">{copy.openPath}</Button></Link></div>
          </>
          : <><p className="leading-7 text-muted">{copy.allDone}</p><div className="mt-6"><Link href="/learn"><Button variant="secondary">{copy.openPath}</Button></Link></div></>}
      </Card>

      <Card>
        <h2 className="font-serif text-2xl font-bold">{copy.minutesTitle}</h2>
        <p className="mt-4 font-serif text-4xl font-bold text-brand">{copy.minutesProgress.replace("{done}", String(plan.minutesToday)).replace("{goal}", String(plan.minutesGoal))}</p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-band" role="progressbar" aria-label={copy.minutesTitle} aria-valuenow={plan.minutesToday} aria-valuemin={0} aria-valuemax={plan.minutesGoal}><div className="h-full rounded-full bg-brand" style={{ width: `${minutesShare}%` }} /></div>
        <p className="mt-3 text-sm font-bold text-ink">{minutesShare >= 100 ? copy.minutesDone : ""}</p>
        <p className="mt-1 text-xs text-muted">{copy.minutesNote}</p>
      </Card>
    </div>

    <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="flex flex-col">
        <h2 className="font-serif text-xl font-bold">{copy.vocabularyTitle}</h2>
        {plan.vocabularyDue > 0
          ? <><p className="mt-4 flex-1 text-sm text-muted"><span className="block font-serif text-4xl font-bold text-brand">{plan.vocabularyDue}</span>{copy.vocabularyDue.replace("{count}", String(plan.vocabularyDue))}</p><Link className="mt-5" href="/vocabulary"><Button>{copy.reviewNow}</Button></Link></>
          : <><p className="mt-4 flex-1 text-sm leading-6 text-muted">{copy.vocabularyNone}</p><Link className="mt-5" href={`/vocabulary?level=${plan.profile.cefrLevel}`}><Button variant="secondary">{copy.learnVocabulary}</Button></Link></>}
      </Card>

      <Card className="flex flex-col">
        <h2 className="font-serif text-xl font-bold">{copy.mistakesTitle}</h2>
        {plan.mistakesDue > 0
          ? <><p className="mt-4 flex-1 text-sm text-muted"><span className="block font-serif text-4xl font-bold text-brand">{plan.mistakesDue}</span>{copy.mistakesDue.replace("{count}", String(plan.mistakesDue))}</p><Link className="mt-5" href="/mistakes"><Button>{copy.practiceMistakes}</Button></Link></>
          : <p className="mt-4 flex-1 text-sm leading-6 text-muted">{copy.mistakesNone}</p>}
      </Card>

      <Card className="flex flex-col">
        <h2 className="font-serif text-xl font-bold">{copy.weakTitle}</h2>
        {plan.weakSkill
          ? <><p className="mt-4 flex-1 text-sm leading-6 text-muted">{copy.weakText.replace("{skill}", weakLabel).replace("{level}", plan.weakSkill.level)}</p><Link className="mt-5" href={practiceHref(plan.weakSkill.skill, plan.weakSkill.level)}><Button variant="secondary">{copy.weakAction.replace("{skill}", weakLabel)}</Button></Link></>
          : <><p className="mt-4 flex-1 text-sm leading-6 text-muted">{copy.weakNone}</p><Link className="mt-5" href="/onboarding"><Button variant="secondary">{copy.takePlacement}</Button></Link></>}
      </Card>

      <Card className="flex flex-col">
        <h2 className="font-serif text-xl font-bold">{copy.examTitle}</h2>
        {plan.exam
          ? <><p className="mt-4 flex-1 font-bold">{plan.exam.title}</p><Link className="mt-5" href={`/exams/${plan.exam.slug}`}><Button variant="secondary">{copy.practiceExam}</Button></Link></>
          : <p className="mt-4 flex-1 text-sm leading-6 text-muted">{messages.examPrep.description}</p>}
        <Link className="mt-3 text-sm font-bold text-brand hover:text-brand-deep" href="/exam-prep">{copy.allExams} →</Link>
      </Card>
    </div>
  </Section>;
}
