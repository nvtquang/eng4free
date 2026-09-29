import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { VocabularyReview, type ReviewCard } from "@/components/vocabulary-review";
import { AddToWordbookButton } from "@/components/add-to-wordbook-button";
import { getLocale, getMessages } from "@/lib/i18n";
import { getVocabulary, vocabularyProvenance } from "@/modules/vocabulary/cefr-catalog";
import { countPublishedVocabulary, listPublishedVocabulary, type PublishedVocabularyCard } from "@/modules/vocabulary/repository";
import { listVocabularyDueDates } from "@/modules/vocabulary/review-schedule";
import { getRequestActor } from "@/modules/auth/request-actor";

export const dynamic = "force-dynamic";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PAGE_SIZE = 24;
const pagerCopy = { vi: { page: "Trang", of: "trên", words: "từ" }, en: { page: "Page", of: "of", words: "words" } } as const;

export default async function VocabularyPage({ searchParams }: { searchParams: Promise<{ level?: string; page?: string }> }) {
  const { level, page } = await searchParams; const locale = await getLocale(); const messages = getMessages(locale); const copy = messages.learning; const selected = levels.includes((level ?? "").toUpperCase()) ? level!.toUpperCase() : "A1";
  const total = await countPublishedVocabulary(selected).catch(() => 0); const pages = Math.max(1, Math.ceil(total / PAGE_SIZE)); const current = Math.min(pages, Math.max(1, Number(page) || 1));
  const seededCards = await listPublishedVocabulary(selected, PAGE_SIZE, (current - 1) * PAGE_SIZE); const cards = seededCards && seededCards.length > 0 ? dedupeByHeadword(seededCards) : dedupeByHeadword(getVocabulary(selected, 12)); const schedule = await reviewQueue(cards.map((card) => ({ id: "id" in card ? card.id : undefined, headword: card.headword, partOfSpeech: card.partOfSpeech ?? null, cefrLevel: card.cefrLevel ?? selected, meaning: "meaning" in card ? card.meaning : null })));
  return <Section><Eyebrow>{copy.eyebrow}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.vocabularyTitle}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.vocabularyDescription}</p><div className="mt-8 flex flex-wrap gap-2">{levels.map((item) => <Link className={`rounded-full px-4 py-2 text-sm font-bold ${selected === item ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft"}`} href={`/vocabulary?level=${item}`} key={item}>{item}</Link>)}</div><div className="mt-12 grid gap-8 lg:grid-cols-[.85fr_1.15fr]"><div className="grid content-start gap-3">{cards.map((card) => <Card className="p-4" key={`${card.headword}-${card.partOfSpeech}`}><div className="flex items-center justify-between gap-3"><div><p className="font-serif text-xl font-bold">{card.headword}</p><p className="mt-1 text-sm text-muted">{[displayPartOfSpeech(card.partOfSpeech), "ipa" in card ? card.ipa : null].filter(Boolean).join(" · ")}</p></div><LevelBadge>{card.cefrLevel ?? selected}</LevelBadge></div>{"meaning" in card && card.meaning && <p className="mt-3 text-sm font-medium text-brand">{card.meaning}</p>}{"example" in card && card.example && <p className="mt-2 text-sm italic leading-6 text-muted">{card.example}</p>}{"attribution" in card && card.attribution.sources?.meaning && <a className="mt-2 inline-block text-xs text-muted underline" href={card.attribution.sources.meaning.url} rel="noreferrer" target="_blank">{card.attribution.sources.meaning.name}</a>}{"id" in card && <div><AddToWordbookButton vocabularyId={card.id} copy={messages.wordbook} /></div>}</Card>)}
    {pages > 1 && <nav className="mt-2 flex flex-wrap items-center gap-2 text-sm" aria-label={pagerCopy[locale].page}>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <Link aria-current={number === current ? "page" : undefined} className={`rounded-full px-3 py-1 font-bold ${number === current ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft"}`} href={`/vocabulary?level=${selected}&page=${number}`} key={number}>{number}</Link>)}<span className="text-muted">{total} {pagerCopy[locale].words}</span></nav>}
    <p className="mt-3 text-xs leading-5 text-muted">{copy.source}: {seededCards && seededCards.length ? sourceLine(seededCards) : `${vocabularyProvenance?.source} (${vocabularyProvenance?.license})`}</p></div><div><p className="mb-4 text-sm font-semibold text-muted" role="status">{copy.dueSummary.replace("{due}", String(schedule.due)).replace("{new}", String(schedule.fresh)).replace("{later}", String(schedule.later))}</p><VocabularyReview cards={schedule.queue} copy={copy} review={messages.review} /></div></div></Section>;
}

/** One credit line for the licences actually used by the cards on screen (CC BY-SA requires attribution). */
function sourceLine(cards: PublishedVocabularyCard[]): string {
  const credits = new Set<string>();
  for (const card of cards) for (const source of Object.values(card.attribution.sources ?? {})) if (source) credits.add(`${source.name} (${source.license})`);
  return credits.size ? [...credits].join(" · ") : "English 4 Free";
}

/** Source data uses "mixed" when a headword spans several parts of speech; it is not useful to learners. */
function displayPartOfSpeech(value: string | null | undefined): string | null {
  return value && value !== "mixed" ? value : null;
}

/** Keeps one card per headword, preferring an entry with a specific part of speech. */
function dedupeByHeadword<T extends { headword: string; partOfSpeech?: string | null }>(cards: T[]): T[] {
  const byHeadword = new Map<string, T>();
  for (const card of cards) {
    const existing = byHeadword.get(card.headword);
    if (!existing || (!displayPartOfSpeech(existing.partOfSpeech) && displayPartOfSpeech(card.partOfSpeech))) byHeadword.set(card.headword, card);
  }
  return [...byHeadword.values()];
}

/** Orders a level's cards for review: words already due first (oldest due first), then new words; words scheduled for later are held back. */
async function reviewQueue(cards: ReviewCard[]): Promise<{ queue: ReviewCard[]; due: number; fresh: number; later: number }> {
  let dueDates = new Map<string, Date>();
  try {
    const { actor } = await getRequestActor(false);
    dueDates = await listVocabularyDueDates(actor, cards.flatMap((card) => card.id ? [card.id] : []));
  } catch { /* A first-time visitor has no review history yet. */ }
  const now = Date.now();
  const due = cards.filter((card) => card.id && (dueDates.get(card.id)?.getTime() ?? Infinity) <= now).sort((a, b) => dueDates.get(a.id!)!.getTime() - dueDates.get(b.id!)!.getTime());
  const fresh = cards.filter((card) => !card.id || !dueDates.has(card.id));
  return { queue: [...due, ...fresh], due: due.length, fresh: fresh.length, later: cards.length - due.length - fresh.length };
}
