import Link from "next/link";
import { SpeakingPractice } from "@/components/speaking-practice";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiSpeakingCopy } from "@/lib/ai-speaking-copy";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { listPublishedPrompts } from "@/modules/practice-prompts/repository";

const setCopy = {
  vi: { choose: "Chọn bộ đề", part1: "Part 1 · Câu hỏi làm quen", part2: "Part 2 · Cue card", youShouldSay: "Bạn nên nói:", part3: "Part 3 · Thảo luận", record: "Ghi âm câu trả lời Part 2 của bạn bên dưới." },
  en: { choose: "Choose a speaking set", part1: "Part 1 · Introduction questions", part2: "Part 2 · Cue card", youShouldSay: "You should say:", part3: "Part 3 · Discussion", record: "Record your Part 2 answer below." }
} as const;

export default async function IeltsSpeakingPage({ searchParams }: { searchParams: Promise<{ set?: string }> }) {
  const locale = await getLocale();
  const copy = getMessages(locale).ielts;
  const text = setCopy[locale];
  const sets = await listPublishedPrompts(["IELTS_SPEAKING"]);
  const { set: requested } = await searchParams;
  const selected = sets.find((item) => item.slug === requested) ?? sets[0];
  const card = selected?.content.cueCard;
  return <Section>
    <Eyebrow>{copy.eyebrow} · {copy.speaking}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.speakingTitle}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.speakingDescription}</p>
    {sets.length > 0 && <nav aria-label={text.choose} className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{text.choose}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{sets.map((item) => <li key={item.slug}><Link aria-current={item.slug === selected?.slug ? "page" : undefined} className={"block rounded-ui border p-3 text-sm leading-6 " + (item.slug === selected?.slug ? "border-brand bg-brand-soft/40 font-bold" : "border-line hover:border-brand")} href={`/ielts/speaking?set=${item.slug}`}>{item.title}</Link></li>)}</ul>
    </nav>}
    {selected && <div className="mt-8 grid gap-5 lg:grid-cols-3">
      <section className="rounded-ui border border-line bg-surface p-5"><h2 className="font-bold text-brand">{text.part1}</h2><ol className="mt-3 list-decimal space-y-2 pl-5 leading-7">{selected.content.part1?.map((question) => <li key={question}>{question}</li>)}</ol></section>
      {card && <section className="rounded-ui border-2 border-brand bg-surface p-5"><h2 className="font-bold text-brand">{text.part2}</h2><p className="mt-3 font-bold leading-7">{card.topic}</p><p className="mt-3 text-sm text-muted">{text.youShouldSay}</p><ul className="mt-1 list-disc space-y-1 pl-5 leading-7">{card.points.map((point) => <li key={point}>{point}</li>)}</ul><p className="mt-2 leading-7">{card.closing}</p></section>}
      <section className="rounded-ui border border-line bg-surface p-5"><h2 className="font-bold text-brand">{text.part3}</h2><ol className="mt-3 list-decimal space-y-2 pl-5 leading-7">{selected.content.part3?.map((question) => <li key={question}>{question}</li>)}</ol></section>
    </div>}
    {selected && <p className="mt-6 text-sm text-muted">{selected.content.instructions} {text.record}</p>}
    <div className="mt-8">
      <SpeakingPractice key={selected?.slug ?? "default"} copy={getSkillsCopy(locale)} aiCopy={getAiSpeakingCopy(locale)} prompt={card?.topic ?? copy.speakingPrompt} promptId={selected?.slug ?? "ielts-part1-skill"} examType="IELTS" />
    </div>
  </Section>;
}
