import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Eyebrow, Section } from "@/components/ui/section";
import { getDashboardDetailsCopy } from "@/lib/dashboard-copy";
import { getLocale, getMessages } from "@/lib/i18n";
import { getRequestActor } from "@/modules/auth/request-actor";
import { listAttemptHistory } from "@/modules/attempts/history";
import { projectProgress, type ProgressEvent } from "@/modules/progress/progress";
import { listProgressEvents } from "@/modules/progress/repository";
import { listSpeakingHistory } from "@/modules/speaking/repository";
import { listWritingHistory } from "@/modules/writing/repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const locale = await getLocale();
  const copy = getMessages(locale).dashboard;
  const details = getDashboardDetailsCopy(locale);
  let events: ProgressEvent[] = [];
  let exams: Awaited<ReturnType<typeof listAttemptHistory>> = [];
  let writings: Awaited<ReturnType<typeof listWritingHistory>> = [];
  let speaking: Awaited<ReturnType<typeof listSpeakingHistory>> = [];

  try {
    const { actor } = await getRequestActor(false);
    [events, exams, writings, speaking] = await Promise.all([
      listProgressEvents(actor),
      listAttemptHistory(actor),
      listWritingHistory(actor),
      listSpeakingHistory(actor)
    ]);
  } catch {
    // A visitor has not received the anonymous learner cookie yet.
  }

  const snapshot = projectProgress(events);
  const vocabularyLearned = new Set(events.filter((event) => event.type === "VOCAB_LEARNED").map((event) => event.sourceId).filter(Boolean)).size;
  const skillLabels = locale === "vi"
    ? { LISTENING: "Nghe", SPEAKING: "Nói", READING: "Đọc", WRITING: "Viết" }
    : { LISTENING: "Listening", SPEAKING: "Speaking", READING: "Reading", WRITING: "Writing" };

  return <Section>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{copy.title}</h1>
    {events.length === 0 && <Card className="mt-8" role="status"><h2 className="font-serif text-2xl font-bold">{copy.emptyTitle}</h2><p className="mt-3 leading-7 text-muted">{copy.emptyText}</p></Card>}
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label={copy.xp} value={snapshot.xp} /><Metric label={copy.streak} value={`${snapshot.streakDays} ${copy.days}`} /><Metric label={copy.activities} value={snapshot.eventsCount} /><Metric label={details.vocabularyLearned} value={vocabularyLearned} /></div>
    <Card className="mt-8"><h2 className="font-serif text-2xl font-bold">{copy.skillActivity}</h2><p className="mt-2 text-sm text-muted">{locale === "vi" ? "Mỗi thanh thể hiện số hoạt động bạn đã hoàn thành theo từng kỹ năng." : "Each bar shows the activities you have completed for each skill."}</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{(Object.keys(skillLabels) as Array<keyof typeof skillLabels>).map((skill) => <SkillProgress key={skill} label={skillLabels[skill]} count={snapshot.skillEvents[skill] ?? 0} />)}</div></Card>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <HistoryCard title={details.activityHistory} empty={details.noData} scrollable>{events.map((event) => <HistoryRow key={event.id} title={details.events[event.type]} meta={event.occurredAt.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")} />)}</HistoryCard>
      <HistoryCard title={details.examHistory} empty={details.noData} scrollable>{exams.map((item) => <Link className="block rounded-ui focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" href={"/exams/" + item.examSlug + "/results/" + item.id} key={item.id}><HistoryRow title={item.examTitle} meta={`${details.score}: ${item.rawScore ?? 0}/${item.totalQuestions}`} /></Link>)}</HistoryCard>
      <HistoryCard title={details.writingHistory} empty={details.noData}>{writings.map((item) => <HistoryRow key={item.id} title={item.prompt.text ?? item.taskType} meta={`${item.wordCount} ${locale === "vi" ? "từ" : "words"} · ${item.status === "SUBMITTED" ? details.submitted : locale === "vi" ? "Bản nháp" : "Draft"}`} />)}</HistoryCard>
      <HistoryCard title={details.speakingHistory} empty={details.noData}>{speaking.map((item) => <HistoryRow key={item.id} title={item.prompt} meta={`${details.recording}: ${item.turns.length}`} />)}</HistoryCard>
    </div>
  </Section>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Card><p className="text-sm font-bold text-muted">{label}</p><p className="mt-3 font-serif text-4xl font-bold text-brand">{value}</p></Card>;
}

function SkillProgress({ label, count }: { label: string; count: number }) {
  const percent = Math.min(100, count * 10);
  return <div className="rounded-ui bg-band p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-bold text-muted">{label}</p><p className="text-sm font-bold">{count}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface" aria-label={`${label}: ${count}`}><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} /></div></div>;
}

function HistoryCard({ title, empty, scrollable = false, children }: { title: string; empty: string; scrollable?: boolean; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <Card><h2 className="font-serif text-2xl font-bold">{title}</h2><div className={`mt-4 space-y-3 ${scrollable && hasChildren ? "max-h-[34rem] overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]" : ""}`} tabIndex={scrollable && hasChildren ? 0 : undefined} aria-label={scrollable && hasChildren ? title : undefined}>{hasChildren ? children : <p className="text-sm text-muted">{empty}</p>}</div></Card>;
}

function HistoryRow({ title, meta }: { title: string; meta: string }) {
  return <div className="border-b border-line pb-3 last:border-0"><p className="font-bold">{title}</p><p className="mt-1 text-sm text-muted">{meta}</p></div>;
}
