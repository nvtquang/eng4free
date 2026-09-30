import Link from "next/link";
import { IeltsSpeakingParts } from "@/components/ielts-speaking-parts";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiSpeakingCopy } from "@/lib/ai-speaking-copy";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { listIeltsTopics } from "@/modules/topics/repository";

const setCopy = {
  vi: { choose: "Chọn bộ đề", part1: "Part 1 · Câu hỏi làm quen", part2: "Part 2 · Cue card", youShouldSay: "Bạn nên nói:", part3: "Part 3 · Thảo luận", prepare: "Chuẩn bị (1:00)", preparing: "Ghi chú nhanh rồi bấm khi sẵn sàng.", ready: "Tôi đã sẵn sàng", prepNote: "Bạn có 1 phút chuẩn bị, sau đó nói tối đa 2 phút.", chooseQuestion: "Chọn một câu để trả lời và ghi âm.", record: "Ghi âm câu trả lời Part 2 của bạn bên dưới." },
  en: { choose: "Choose a speaking set", part1: "Part 1 · Introduction questions", part2: "Part 2 · Cue card", youShouldSay: "You should say:", part3: "Part 3 · Discussion", prepare: "Prepare (1:00)", preparing: "Make notes, then continue when ready.", ready: "I'm ready", prepNote: "You have 1 minute to prepare, then speak for up to 2 minutes.", chooseQuestion: "Pick a question to answer and record.", record: "Record your Part 2 answer below." }
} as const;

export default async function IeltsSpeakingPage({ searchParams }: { searchParams: Promise<{ set?: string }> }) {
  const locale = await getLocale();
  const copy = getMessages(locale).ielts;
  const text = setCopy[locale];
  const sets = await listIeltsTopics(["IELTS_SPEAKING"]);
  const { set: requested } = await searchParams;
  const selected = sets.find((item) => item.slug === requested) ?? sets[0];
  return <Section>
    <Eyebrow>{copy.eyebrow} · {copy.speaking}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.speakingTitle}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.speakingDescription}</p>
    {sets.length > 0 && <nav aria-label={text.choose} className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{text.choose}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{sets.map((item) => <li key={item.slug}><Link aria-current={item.slug === selected?.slug ? "page" : undefined} className={"block rounded-ui border p-3 text-sm leading-6 " + (item.slug === selected?.slug ? "border-brand bg-brand-soft/40 font-bold" : "border-line hover:border-brand")} href={`/ielts/speaking?set=${item.slug}`}>{item.title}</Link></li>)}</ul>
    </nav>}
    {selected && <>
      <section className="mt-8 rounded-ui border border-line bg-surface p-5"><h2 className="font-bold text-brand">{text.part1}</h2><ol className="mt-3 list-decimal space-y-2 pl-5 leading-7">{selected.content.part1?.map((question) => <li key={question}>{question}</li>)}</ol></section>
      {selected.content.instructions && <p className="mt-6 text-sm text-muted">{selected.content.instructions}</p>}
      <div className="mt-8">
        <IeltsSpeakingParts key={selected.id} topicId={selected.id} cueCard={selected.content.cueCard} part3={selected.content.part3 ?? []} text={text} skillsCopy={getSkillsCopy(locale)} aiCopy={getAiSpeakingCopy(locale)} />
      </div>
    </>}
  </Section>;
}
