import Link from "next/link";
import { cookies } from "next/headers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { auth } from "@/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { cefrPath } from "@/modules/courses/cefr-path";
import { buildStreakHeatmap, heatmapDayLabels, type StreakHeatmap } from "@/modules/progress/heatmap";
import { projectProgress, type ProgressEvent, type ProgressSnapshot } from "@/modules/progress/progress";
import { listProgressEvents } from "@/modules/progress/repository";
import { guestCookieName } from "@/modules/auth/request-actor";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const cellTones = ["bg-band border border-line", "bg-emerald-200", "bg-emerald-300", "bg-emerald-500", "bg-emerald-700"];

export default async function HomePage() {
  const locale = await getLocale(); const messages = getMessages(locale); const { home, common, dashboard } = messages;
  const session = await auth().catch(() => null);
  let snapshot: ProgressSnapshot | null = null;
  let heatmap: StreakHeatmap | null = null;
  let vocabularyLearned = 0;
  if (session?.user?.id) {
    try {
      const guestId = (await cookies()).get(guestCookieName)?.value ?? "";
      const events: ProgressEvent[] = await listProgressEvents({ userId: session.user.id, guestId });
      snapshot = projectProgress(events);
      heatmap = buildStreakHeatmap(events, new Date(), "Asia/Ho_Chi_Minh", locale);
      vocabularyLearned = new Set(events.filter((event) => event.type === "VOCAB_LEARNED").map((event) => event.sourceId).filter(Boolean)).size;
    } catch {
      // Database is optional in the local demo; skip the progress section.
    }
  }
  return <><Section className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-32"><div><Eyebrow>{home.eyebrow}</Eyebrow><h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl">{home.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{home.description}</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/learn"><Button>{common.start}</Button></Link><Link href="/toeic"><Button variant="secondary">{home.secondary}</Button></Link></div></div><div className="relative overflow-hidden rounded-[1.25rem] border border-line bg-brand p-7 text-white shadow-card sm:p-10"><div className="absolute -right-16 -top-14 size-52 rounded-full bg-ochre/90" /><div className="absolute -bottom-16 -left-14 size-48 rounded-full bg-terra/90" /><div className="relative"><p className="text-sm font-bold uppercase tracking-[.16em] text-white/75">{home.level}</p><p className="mt-5 font-serif text-4xl font-bold">A1 → C2</p><p className="mt-3 max-w-sm text-base leading-7 text-white/85">{home.levelsDescription}</p><div className="mt-10 grid grid-cols-3 gap-3">{levels.map((level) => <div className="rounded-ui border border-white/20 bg-white/10 px-3 py-4 text-center text-sm font-bold" key={level}>{level}</div>)}</div></div></div></Section>
    {snapshot && heatmap && <Section className="pb-0 sm:pb-0"><div className="flex flex-wrap items-end justify-between gap-4"><div><Eyebrow>{home.progressEyebrow}</Eyebrow><h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{home.progressTitle}</h2></div><Link className="text-sm font-bold text-brand hover:text-brand-deep" href="/dashboard">{home.viewDetail} →</Link></div>
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
    <div className="border-y border-line bg-band"><Section><div className="max-w-2xl"><Eyebrow>{home.current}</Eyebrow><h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">{home.levelsTitle}</h2><p className="mt-4 text-lg leading-8 text-muted">{home.levelsDescription}</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cefrPath.map((level) => { const lesson = level.lessons[0]; return <Link key={level.level} href={`/learn/${level.level.toLowerCase()}/${lesson.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"><Card className="min-h-40 transition hover:-translate-y-1 hover:border-brand"><LevelBadge>{level.level}</LevelBadge><h3 className="mt-6 font-serif text-2xl font-bold">{lesson.title[locale]}</h3><p className="mt-2 text-sm leading-6 text-muted">{home.free} · {lesson.minutes} {messages.learning.minutes}</p><p className="mt-5 text-sm font-bold text-brand">{common.start} →</p></Card></Link>; })}</div></Section></div>
    <Section><div className="grid gap-5 lg:grid-cols-3"><Feature title={home.skillsTitle} text={home.skillsDescription} accent="bg-accent-navy" action={common.explore} href="/skills" /><Feature title={home.examTitle} text={home.examDescription} accent="bg-accent-terra" action={home.examAction} href="/toeic" /><Feature title={messages.nav.vocabulary} text={home.vocabularyDescription} accent="bg-accent-ochre" action={common.explore} href="/vocabulary" /></div></Section>
    <Section className="pt-0"><div className="rounded-[1.25rem] bg-ink px-7 py-12 text-center text-white sm:px-12"><Eyebrow className="text-ochre">{home.free}</Eyebrow><h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold sm:text-4xl">{home.title}</h2><Link className="mt-8 inline-flex" href="/learn"><Button className="bg-ochre text-ink hover:bg-[#dbb55f]">{common.start}</Button></Link></div></Section></>;
}
function Feature({ title, text, accent, action, href }: { title: string; text: string; accent: string; action: string; href: string }) { return <Card className="flex min-h-72 flex-col"><span className={`size-3 rounded-full ${accent}`} /><h2 className="mt-8 font-serif text-3xl font-bold">{title}</h2><p className="mt-4 flex-1 leading-7 text-muted">{text}</p><Link className="mt-7 text-sm font-bold text-brand hover:text-brand-deep" href={href}>{action} →</Link></Card>; }
function Metric({ tone, icon, label, value }: { tone: string; icon: React.ReactNode; label: string; value: string | number }) { return <Card className="flex items-center gap-4"><span className={`grid size-11 shrink-0 place-items-center rounded-full ${tone}`}>{icon}</span><div className="min-w-0"><p className="font-serif text-3xl font-bold leading-none text-ink">{value}</p><p className="mt-2 truncate text-sm font-bold text-muted">{label}</p></div></Card>; }

const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function ZapIcon({ size = 20 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>; }
function FlameIcon({ size = 20 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" /></svg>; }
function CheckIcon({ size = 20 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>; }
function BookIcon({ size = 20 }: { size?: number }) { return <svg height={size} viewBox="0 0 24 24" width={size} {...iconProps}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>; }
