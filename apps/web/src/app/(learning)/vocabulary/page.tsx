import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { VocabularyReview } from "@/components/vocabulary-review";
import { getLocale, getMessages } from "@/lib/i18n";
import { getVocabulary, vocabularyProvenance } from "@/modules/vocabulary/cefr-catalog";
import { listPublishedVocabulary } from "@/modules/vocabulary/repository";
import type { CefrLevel } from "@/modules/courses/cefr-path";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
export default async function VocabularyPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { level } = await searchParams; const locale = await getLocale(); const messages = getMessages(locale); const copy = messages.learning; const selected = levels.includes((level ?? "").toUpperCase()) ? level!.toUpperCase() : "A1"; const seededCards = await listPublishedVocabulary(selected, 24); const cards = seededCards && seededCards.length > 0 ? seededCards : getVocabulary(selected, 12); const reviewCards = cards.map((card) => ({ headword: card.headword, partOfSpeech: card.partOfSpeech, cefrLevel: (card.cefrLevel ?? selected) as CefrLevel }));
  return <Section><Eyebrow>{copy.eyebrow}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.vocabularyTitle}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.vocabularyDescription}</p><div className="mt-8 flex flex-wrap gap-2">{levels.map((item) => <Link className={`rounded-full px-4 py-2 text-sm font-bold ${selected === item ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft"}`} href={`/vocabulary?level=${item}`} key={item}>{item}</Link>)}</div><div className="mt-12 grid gap-8 lg:grid-cols-[.85fr_1.15fr]"><div className="grid content-start gap-3">{cards.map((card) => <Card className="p-4" key={`${card.headword}-${card.partOfSpeech}`}><div className="flex items-center justify-between gap-3"><div><p className="font-serif text-xl font-bold">{card.headword}</p><p className="mt-1 text-sm text-muted">{card.partOfSpeech ?? "—"}{"ipa" in card && card.ipa ? ` · ${card.ipa}` : ""}</p></div><LevelBadge>{card.cefrLevel ?? selected}</LevelBadge></div>{"meaning" in card && card.meaning && <p className="mt-3 text-sm font-medium text-brand">{card.meaning}</p>}{"example" in card && card.example && <p className="mt-2 text-sm italic leading-6 text-muted">{card.example}</p>}</Card>)}<p className="mt-3 text-xs leading-5 text-muted">{copy.source}: {seededCards ? "English 4 Free original local demo pack" : `${vocabularyProvenance?.source} (${vocabularyProvenance?.license})`}</p></div><VocabularyReview cards={reviewCards} copy={copy} /></div></Section>;
}
