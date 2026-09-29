import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { MistakePractice, type PracticeMistake } from "@/components/mistake-practice";
import { getLocale, getMessages } from "@/lib/i18n";
import { getRequestActor } from "@/modules/auth/request-actor";
import { listOpenMistakes } from "@/modules/mistakes/repository";

export const dynamic = "force-dynamic";

const skillFilters = ["GRAMMAR"] as const;

export default async function MistakesPage({ searchParams }: { searchParams: Promise<{ skill?: string }> }) {
  const { skill } = await searchParams;
  const locale = await getLocale();
  const copy = getMessages(locale).mistakes;
  const activeSkill = skillFilters.includes((skill ?? "").toUpperCase() as (typeof skillFilters)[number]) ? (skill!.toUpperCase() as "GRAMMAR") : undefined;

  let mistakes: Awaited<ReturnType<typeof listOpenMistakes>> = [];
  try {
    const { actor } = await getRequestActor(false);
    mistakes = await listOpenMistakes(actor, activeSkill);
  } catch {
    // No learner cookie yet; show the empty state.
  }

  const practice: PracticeMistake[] = mistakes.map((item) => ({ id: item.id, questionId: item.questionId, sourceType: item.sourceType, sourceTitle: item.sourceTitle, timesWrong: item.timesWrong, prompt: item.prompt, options: item.options, correctOptionId: item.correctOptionId, explanation: item.explanation }));
  const practiceCopy = { check: copy.check, next: copy.next, correct: copy.correct, incorrect: copy.incorrect, correctAnswer: copy.correctAnswer, finished: copy.finished, backToList: copy.backToList, sourceLesson: copy.sourceLesson, sourceExam: copy.sourceExam, timesWrong: copy.timesWrong };

  return <Section>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.title}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.description}</p>

    <div className="mt-8 flex flex-wrap gap-2">
      <Link className={`rounded-full px-4 py-2 text-sm font-bold ${!activeSkill ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft"}`} href="/mistakes">{copy.allSkills}</Link>
      <Link className={`rounded-full px-4 py-2 text-sm font-bold ${activeSkill === "GRAMMAR" ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft"}`} href="/mistakes?skill=GRAMMAR">{copy.grammarOnly}</Link>
    </div>

    <div className="mt-10">
      {practice.length === 0
        ? <Card className="bg-brand-soft"><h2 className="font-serif text-2xl font-bold">{copy.emptyTitle}</h2><p className="mt-3 leading-7 text-muted">{copy.emptyText}</p></Card>
        : <><p className="mb-4 text-sm font-bold text-muted" role="status">{copy.count.replace("{count}", String(practice.length))}</p><MistakePractice mistakes={practice} copy={practiceCopy} /></>}
    </div>
  </Section>;
}
