import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { practiceHref, weakestSkill } from "@/lib/practice-links";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { findLearnerProfile, type LearnerProfile } from "@/modules/onboarding/repository";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Luyện bốn kỹ năng Nghe, Nói, Đọc, Viết", description: "Bài nghe có ghi âm, bài đọc theo trình độ, luyện nói có ghi âm và luyện viết theo chủ đề với nhận xét AI." }, en: { title: "Practise listening, speaking, reading and writing", description: "Recorded listening, graded reading, speaking with recordings and topic-based writing with AI feedback." } }, "/skills");
}

export const dynamic = "force-dynamic";

type Item = "LISTENING" | "READING" | "SPEAKING" | "WRITING" | "VOCABULARY" | "GRAMMAR" | "PRONUNCIATION" | "MISTAKES";
const items: Array<{ id: Item; accent: string }> = [
  { id: "LISTENING", accent: "bg-accent-navy" },
  { id: "READING", accent: "bg-brand" },
  { id: "SPEAKING", accent: "bg-accent-terra" },
  { id: "WRITING", accent: "bg-accent-ochre" },
  { id: "VOCABULARY", accent: "bg-brand" },
  { id: "GRAMMAR", accent: "bg-accent-navy" },
  { id: "PRONUNCIATION", accent: "bg-accent-terra" },
  { id: "MISTAKES", accent: "bg-accent-ochre" }
];

export default async function PracticePage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = messages.practice;
  let profile: LearnerProfile | null = null;
  try { profile = await findLearnerProfile((await getRequestLearner(false)).learner); } catch { /* A visitor without a learner sees the plain hub. */ }
  const weak = weakestSkill(profile?.skillLevels);
  const title = (id: Item) => id === "PRONUNCIATION" ? messages.nav.pronunciation : id === "MISTAKES" ? messages.nav.mistakes : messages.onboarding.skills[id];
  const href = (id: Item) => id === "PRONUNCIATION" ? "/pronunciation" : id === "MISTAKES" ? "/mistakes" : practiceHref(id, profile?.skillLevels?.[id] ?? profile?.cefrLevel);

  return <Section>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{copy.title}</h1>
    <p className="mt-4 max-w-2xl leading-7 text-muted">{copy.description}</p>
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map(({ id, accent }) => <Link key={id} href={href(id)} className="block rounded-ui focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
      <Card className={`flex h-full flex-col transition hover:-translate-y-1 hover:border-brand ${weak?.skill === id ? "border-brand" : ""}`}>
        <div className="flex items-center justify-between gap-2"><span aria-hidden="true" className={`size-3 rounded-full ${accent}`} />{weak?.skill === id && <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep">{copy.suggested}</span>}</div>
        <h2 className="mt-6 font-serif text-2xl font-bold">{title(id)}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">{copy.items[id]}</p>
        {profile?.skillLevels?.[id] && <p className="mt-4 text-xs font-bold text-muted">{messages.today.levelLabel}: {profile.skillLevels[id]}</p>}
      </Card>
    </Link>)}</div>
  </Section>;
}
