import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { auth } from "@/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillLabel } from "@/lib/skills-copy";
import { loadHomeShowcase, type HomeShowcase } from "@/modules/home/showcase";
import { buildStreakHeatmap, heatmapDayLabels, type StreakHeatmap } from "@/modules/progress/heatmap";
import { projectProgress, type ProgressEvent, type ProgressSnapshot } from "@/modules/progress/progress";
import { listProgressEvents } from "@/modules/progress/repository";
import { getRequestLearner } from "@/modules/auth/request-actor";
import type { LearnerRef } from "@/modules/learners/types";
import { findLearnerProfile } from "@/modules/onboarding/repository";
import { listPathLessons } from "@/modules/path/repository";

export const dynamic = "force-dynamic";

const cellTones = ["bg-band border border-line", "bg-emerald-200", "bg-emerald-300", "bg-emerald-500", "bg-emerald-700"];

export default async function HomePage() {
  const locale = await getLocale(); const messages = getMessages(locale); const { home, dashboard } = messages;
  const session = await auth().catch(() => null);
  let snapshot: ProgressSnapshot | null = null;
  let heatmap: StreakHeatmap | null = null;
  let vocabularyLearned = 0;
  let hasProfile = false;
  let learner: LearnerRef | null = null;
  try {
    learner = (await getRequestLearner(false)).learner;
    hasProfile = Boolean(await findLearnerProfile(learner));
  } catch {
    // No learner yet, or database unavailable; show the onboarding CTA.
  }
  if (session?.user?.id && learner) {
    try {
      const events: ProgressEvent[] = await listProgressEvents(learner);
      snapshot = projectProgress(events);
      heatmap = buildStreakHeatmap(events, new Date(), "Asia/Ho_Chi_Minh", locale);
      vocabularyLearned = new Set(events.filter((event) => event.type === "VOCAB_LEARNED").map((event) => event.sourceId).filter(Boolean)).size;
    } catch {
      // Database is optional in the local demo; skip the progress section.
    }
  }
  const [showcase, firstLesson] = await Promise.all([
    loadHomeShowcase().catch((): HomeShowcase | null => null),
    listPathLessons().then((lessons) => lessons[0] ?? null).catch(() => null)
  ]);
  const primary = hasProfile ? { href: "/today", label: home.todayPlan } : { href: "/onboarding", label: home.startPlan };
  const number = (value: number) => value.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
  const features: Array<{ key: keyof typeof home.features; href: string; icon: ReactNode; tone: string }> = [
    { key: "path", href: "/learn", icon: <RouteIcon />, tone: "bg-brand-soft text-brand" },
    { key: "listenRead", href: "/skills/listening", icon: <HeadphonesIcon />, tone: "bg-accent-navy/10 text-accent-navy" },
    { key: "speakWrite", href: "/skills/speaking", icon: <MicIcon />, tone: "bg-accent-terra/10 text-accent-terra" },
    { key: "vocab", href: "/vocabulary", icon: <BookIcon />, tone: "bg-accent-ochre/15 text-accent-ochre" },
    { key: "exams", href: "/exam-prep", icon: <TrophyIcon />, tone: "bg-brand-soft text-brand" },
    { key: "mistakes", href: "/mistakes", icon: <SparkIcon />, tone: "bg-accent-navy/10 text-accent-navy" }
  ];

  return <>
    <Section className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
      <div>
        <Eyebrow>{home.eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl">{home.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{home.description}</p>
        <div className="mt-9 flex flex-wrap items-center gap-5"><Link href={primary.href}><Button className="min-h-12 px-8 text-base">{primary.label}</Button></Link><Link className="text-sm font-bold text-brand hover:text-brand-deep" href="/learn">{home.viewPath} →</Link></div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">{home.trust.map((item) => <li key={item} className="flex items-center gap-2"><CheckIcon size={16} />{item}</li>)}</ul>
      </div>
      <ProductPreview home={home} locale={locale} showcase={showcase} firstLesson={firstLesson} />
    </Section>

    {snapshot && heatmap && <Section className="pt-0 sm:pt-0"><div className="flex flex-wrap items-end justify-between gap-4"><div><Eyebrow>{home.progressEyebrow}</Eyebrow><h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{home.progressTitle}</h2></div><Link className="text-sm font-bold text-brand hover:text-brand-deep" href="/dashboard">{home.viewDetail} →</Link></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric tone="bg-accent-ochre/15 text-accent-ochre" icon={<ZapIcon />} label={dashboard.xp} value={snapshot.xp} />
        <Metric tone="bg-accent-terra/10 text-accent-terra" icon={<FlameIcon />} label={dashboard.streak} value={snapshot.streakDays} />
        <Metric tone="bg-accent-navy/10 text-accent-navy" icon={<CheckIcon />} label={dashboard.activities} value={snapshot.eventsCount} />
        <Metric tone="bg-brand-soft text-brand" icon={<BookIcon />} label={home.vocabularyLearned} value={vocabularyLearned} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-xl font-bold">{home.heatmapTitle}</h3><p className="text-sm font-bold text-muted">{heatmap.activeDays} {home.activeDays}</p></div>
          <div className="mt-5 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-[3px] pl-9" aria-hidden="true">{heatmap.monthLabels.map((label, index) => <span className="w-3.5 text-[10px] font-bold text-muted" key={index}>{label}</span>)}</div>
            <div className="mt-1 flex min-w-max gap-[3px]">
              <div className="flex w-8 shrink-0 flex-col gap-[3px]" aria-hidden="true">{heatmapDayLabels(locale).map((label, index) => <span className="flex h-3.5 items-center text-[10px] font-semibold text-muted" key={label}>{index % 2 === 0 ? label : ""}</span>)}</div>
              {heatmap.weeks.map((week, weekIndex) => <div className="flex flex-col gap-[3px]" key={weekIndex}>{week.map((cell) => <span className={`size-3.5 rounded-[4px] ${cell.future ? "bg-transparent" : cellTones[cell.level]}`} key={cell.key} title={`${cell.key}: ${cell.count}`} />)}</div>)}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-1.5 text-xs font-semibold text-muted"><span className="mr-1">{home.few}</span>{cellTones.map((tone) => <span className={`size-3 rounded-[3px] ${tone}`} key={tone} />)}<span className="ml-1">{home.many}</span></div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10 text-center"><span className="grid size-14 place-items-center rounded-full bg-accent-terra/10 text-accent-terra"><FlameIcon size={28} /></span><p className="mt-4 font-serif text-6xl font-bold leading-none text-ink">{snapshot.streakDays}</p><p className="mt-3 text-sm font-bold text-muted">{home.dayStreak}</p><p className="mt-4 max-w-60 text-xs italic leading-5 text-muted">{home.streakNote}</p></Card>
      </div>
    </Section>}

    {showcase && <div className="border-y border-line bg-band"><Section className="py-10 sm:py-12">
      <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">{([["lessons", showcase.counts.lessons], ["words", showcase.counts.words], ["examQuestions", showcase.counts.examQuestions], ["topics", showcase.counts.topics]] as const).map(([key, value]) => <div key={key}><dt className="sr-only">{home.stats[key]}</dt><dd><span className="block font-serif text-4xl font-bold text-ink sm:text-5xl">{number(value)}</span><span className="mt-2 block text-sm font-semibold leading-5 text-muted">{home.stats[key]}</span></dd></div>)}</dl>
    </Section></div>}

    <Section>
      <Eyebrow>{home.stepsEyebrow}</Eyebrow>
      <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{home.stepsTitle}</h2>
      <ol className="mt-10 grid gap-5 lg:grid-cols-3">{home.steps.map((step, index) => <li key={step.title}><Card className="h-full"><span className="grid size-11 place-items-center rounded-full bg-brand font-serif text-xl font-bold text-white">{index + 1}</span><h3 className="mt-6 font-serif text-2xl font-bold">{step.title}</h3><p className="mt-3 leading-7 text-muted">{step.text}</p></Card></li>)}</ol>
    </Section>

    <Section className="pt-0">
      <Eyebrow>{home.featuresEyebrow}</Eyebrow>
      <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{home.featuresTitle}</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature) => <Link key={feature.key} href={feature.href} className="group block rounded-ui focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"><Card className="flex h-full gap-4 transition group-hover:-translate-y-1 group-hover:border-brand"><span className={`grid size-12 shrink-0 place-items-center rounded-full ${feature.tone}`}>{feature.icon}</span><div><h3 className="font-serif text-xl font-bold">{home.features[feature.key].title}</h3><p className="mt-2 text-sm leading-6 text-muted">{home.features[feature.key].text}</p></div></Card></Link>)}</div>
    </Section>

    <Section className="pt-0">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-ink px-7 py-12 text-white sm:px-12 sm:py-14">
        <div aria-hidden="true" className="absolute -right-20 -top-24 size-72 rounded-full bg-accent-ochre/25" />
        <div aria-hidden="true" className="absolute -bottom-28 right-40 size-56 rounded-full bg-brand/40" />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl"><h2 className="font-serif text-3xl font-bold sm:text-4xl">{hasProfile ? home.ctaReturningTitle : home.ctaTitle}</h2><p className="mt-3 text-lg leading-8 text-white/75">{hasProfile ? home.ctaReturningText : home.ctaText}</p></div>
          <Link href={primary.href}><Button className="min-h-12 bg-accent-ochre px-8 text-base text-ink hover:bg-[#dbb55f]">{primary.label}</Button></Link>
        </div>
      </div>
    </Section>
  </>;
}

/** A small, real look at the app: the first lesson on the path, a flashcard and a lesson practice question. */
function ProductPreview({ home, locale, showcase, firstLesson }: { home: ReturnType<typeof getMessages>["home"]; locale: "vi" | "en"; showcase: HomeShowcase | null; firstLesson: { level: string; title: string; unitTitle: string; skill: string | null; estimatedMinutes: number } | null }) {
  return <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
    <div className="absolute -right-6 -top-8 size-40 rounded-full bg-accent-ochre/20" />
    <div className="absolute -bottom-10 -left-8 size-36 rounded-full bg-accent-terra/15" />
    <div className="relative space-y-4">
      {firstLesson && <Card className="bg-brand text-white shadow-card">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-white/70">{home.previewLesson}</p>
        <p className="mt-3 font-serif text-2xl font-bold">{firstLesson.title}</p>
        <p className="mt-2 text-sm text-white/80">{firstLesson.level} · {firstLesson.unitTitle}{firstLesson.skill ? ` · ${getSkillLabel(locale, firstLesson.skill)}` : ""} · {firstLesson.estimatedMinutes} {home.minutes}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-2/5 rounded-full bg-accent-ochre" /></div>
      </Card>}
      <div className="grid gap-4 sm:grid-cols-[.9fr_1.1fr]">
        {showcase?.word && <Card className="sm:translate-y-3">
          <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.16em] text-muted">{home.previewWord}</p><LevelBadge>{showcase.word.level}</LevelBadge></div>
          <p className="mt-4 font-serif text-3xl font-bold">{showcase.word.headword}</p>
          {showcase.word.ipa && <p className="mt-1 text-sm text-muted">{showcase.word.ipa}</p>}
          <p className="mt-4 border-t border-line pt-3 text-sm font-semibold">{showcase.word.meaning}</p>
        </Card>}
        {showcase?.question && <Card>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-muted">{home.previewQuestion}</p>
          <p className="mt-1 text-xs text-muted">{showcase.question.lesson}</p>
          <p className="mt-3 font-semibold leading-6">{showcase.question.prompt}</p>
          <ul className="mt-3 space-y-2 text-sm">{showcase.question.options.map((option) => <li key={option} className="rounded-ui border border-line px-3 py-2">{option}</li>)}</ul>
        </Card>}
      </div>
    </div>
  </div>;
}

function Metric({ tone, icon, label, value }: { tone: string; icon: ReactNode; label: string; value: string | number }) { return <Card className="flex items-center gap-4"><span className={`grid size-11 shrink-0 place-items-center rounded-full ${tone}`}>{icon}</span><div className="min-w-0"><p className="font-serif text-3xl font-bold leading-none text-ink">{value}</p><p className="mt-2 truncate text-sm font-bold text-muted">{label}</p></div></Card>; }

const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function ZapIcon({ size = 20 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>; }
function FlameIcon({ size = 20 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" /></svg>; }
function CheckIcon({ size = 20 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>; }
function BookIcon({ size = 22 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>; }
function RouteIcon({ size = 22 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg>; }
function HeadphonesIcon({ size = 22 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></svg>; }
function MicIcon({ size = 22 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><path d="M12 18v4" /></svg>; }
function TrophyIcon({ size = 22 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>; }
function SparkIcon({ size = 22 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3" /></svg>; }
