import Link from "next/link";
import { ExamCatalog } from "@/components/exam-catalog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { listPublicExams } from "@/modules/exams/exam-engine";
import { findLearnerProfile } from "@/modules/onboarding/repository";

export const dynamic = "force-dynamic";

type ExamType = "TOEIC" | "IELTS";

/** One place for exam practice: TOEIC and IELTS tabs, defaulting to the learner's goal. */
export default async function ExamPrepPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = messages.examPrep;
  const requested = (await searchParams).exam?.toUpperCase();
  let goal: string | null = null;
  try { goal = (await findLearnerProfile((await getRequestLearner(false)).learner))?.goal ?? null; } catch { /* No learner yet. */ }
  const type: ExamType = requested === "IELTS" || requested === "TOEIC" ? requested : goal === "ielts" ? "IELTS" : "TOEIC";
  let exams: Awaited<ReturnType<typeof listPublicExams>> = [];
  try { exams = await listPublicExams(type); } catch { /* Local setup may not have a database yet. */ }

  return <Section>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{copy.title}</h1>
    <p className="mt-4 max-w-2xl leading-7 text-muted">{copy.description}</p>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <nav className="flex gap-2" aria-label={copy.title}>{(["TOEIC", "IELTS"] as const).map((item) => <Link key={item} href={`/exam-prep?exam=${item.toLowerCase()}`} aria-current={item === type ? "page" : undefined} className={`rounded-full border px-5 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${item === type ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"}`}>{item}</Link>)}</nav>
      <Link href="/toeic/history"><Button variant="secondary">{copy.history}</Button></Link>
    </div>
    <p className="mt-4 text-sm text-muted">{type === "TOEIC" ? copy.toeicText : copy.ieltsText}</p>
    {exams.length ? <ExamCatalog exams={exams} locale={locale} /> : <Card className="mt-8"><p className="text-muted">{copy.empty}</p></Card>}
    {type === "IELTS" && <Card className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-serif text-2xl font-bold">{copy.writingSpeaking}</h2>
      <div className="flex flex-wrap gap-3"><Link href="/ielts/writing"><Button variant="secondary">Writing</Button></Link><Link href="/ielts/speaking"><Button variant="secondary">Speaking</Button></Link></div>
    </Card>}
  </Section>;
}
