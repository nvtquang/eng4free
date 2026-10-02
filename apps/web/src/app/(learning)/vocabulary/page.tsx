import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import { VocabularyReview, type ReviewCard } from "@/components/vocabulary-review";
import { AddToWordbookButton } from "@/components/add-to-wordbook-button";
import { Pill } from "@/components/ui/pill";
import { getLocale, getMessages } from "@/lib/i18n";
import { countPublishedVocabulary, listDueVocabulary, listPublishedVocabulary, type PublishedVocabularyCard } from "@/modules/vocabulary/repository";
import type { LearnerRef } from "@/modules/learners/types";
import { listVocabularyDueDates } from "@/modules/vocabulary/review-schedule";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Từ vựng tiếng Anh theo CEFR có IPA và nghĩa tiếng Việt", description: "Từ vựng A1–C2 có phiên âm IPA, nghĩa tiếng Việt và câu ví dụ; thẻ ôn tập lặp lại ngắt quãng nhắc bạn ôn đúng lúc sắp quên." }, en: { title: "CEFR English vocabulary with IPA", description: "A1–C2 vocabulary with IPA, Vietnamese meanings and example sentences, reviewed with spaced-repetition flashcards." } }, "/vocabulary");
}

export const dynamic = "force-dynamic";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PAGE_SIZE = 24;
const pagerCopy = { vi: { page: "Trang", of: "trên", words: "từ" }, en: { page: "Page", of: "of", words: "words" } } as const;

export default async function VocabularyPage({ searchParams }: { searchParams: Promise<{ level?: string; page?: string; deck?: string }> }) {
  const { level, page, deck } = await searchParams; const locale = await getLocale(); const messages = getMessages(locale); const copy = messages.learning; const selected = levels.includes((level ?? "").toUpperCase()) ? level!.toUpperCase() : "A1";
  // ?deck=due reviews every saved word that is due, whatever its level; otherwise one level is shown a page at a time.
  const dueDeck = deck === "due";
  let learner: LearnerRef | null = null;
  try { learner = (await getRequestLearner(false)).learner; } catch { /* A first-time visitor has no review history yet. */ }
  const total = dueDeck ? 0 : await countPublishedVocabulary(selected).catch(() => 0); const pages = Math.max(1, Math.ceil(total / PAGE_SIZE)); const current = Math.min(pages, Math.max(1, Number(page) || 1));
  const seededCards = dueDeck ? (learner ? await listDueVocabulary(learner) : []) : await listPublishedVocabulary(selected, PAGE_SIZE, (current - 1) * PAGE_SIZE); const cards = dedupeByHeadword(seededCards ?? []);
  const dueDates = learner ? await listVocabularyDueDates(learner, cards.map((card) => card.id)) : new Map<string, Date>();
  const schedule = reviewQueue(cards.map((card) => ({ id: card.id, headword: card.headword, partOfSpeech: card.partOfSpeech ?? null, cefrLevel: card.cefrLevel ?? selected, meaning: card.meaning })), dueDates);
  const summary = dueDeck ? messages.wordbook.dueDeckSummary.replace("{due}", String(schedule.due)) : copy.dueSummary.replace("{due}", String(schedule.due)).replace("{new}", String(schedule.fresh)).replace("{later}", String(schedule.later));
  return <Section><Eyebrow>{copy.eyebrow}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.vocabularyTitle}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.vocabularyDescription}</p><div className="mt-8 flex flex-wrap gap-2">{levels.map((item) => <Pill key={item} href={`/vocabulary?level=${item}`} active={!dueDeck && selected === item} ariaCurrent>{item}</Pill>)}<Pill href="/vocabulary?deck=due" active={dueDeck} ariaCurrent>{messages.wordbook.dueDeck}</Pill></div><div className="mt-12 grid gap-8 lg:grid-cols-[.85fr_1.15fr]"><div className="grid content-start gap-3">{dueDeck && cards.length === 0 && <Card className="p-4"><p className="leading-7 text-muted">{messages.wordbook.dueDeckEmpty}</p></Card>}{cards.map((card) => <Card className="p-4" key={`${card.headword}-${card.partOfSpeech}`}><div className="flex items-center justify-between gap-3"><div><p className="font-serif text-xl font-bold">{card.headword}</p><p className="mt-1 text-sm text-muted">{[displayPartOfSpeech(card.partOfSpeech), card.ipa].filter(Boolean).join(" · ")}</p></div><LevelBadge>{card.cefrLevel ?? selected}</LevelBadge></div>{card.meaning && <p className="mt-3 text-sm font-medium text-brand">{card.meaning}</p>}{card.example && <p className="mt-2 text-sm italic leading-6 text-muted">{card.example}</p>}{card.attribution.sources?.meaning && <a className="mt-2 inline-block text-xs text-muted underline" href={card.attribution.sources.meaning.url} rel="noreferrer" target="_blank">{card.attribution.sources.meaning.name}</a>}<div><AddToWordbookButton vocabularyId={card.id} copy={messages.wordbook} saved={dueDates.has(card.id)} /></div></Card>)}
    {!dueDeck && pages > 1 && <nav className="mt-2 flex flex-wrap items-center gap-2 text-sm" aria-label={pagerCopy[locale].page}>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <Link aria-current={number === current ? "page" : undefined} className={`rounded-full px-3 py-1 font-bold ${number === current ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft"}`} href={`/vocabulary?level=${selected}&page=${number}`} key={number}>{number}</Link>)}<span className="text-muted">{total} {pagerCopy[locale].words}</span></nav>}
    {cards.length > 0 && <p className="mt-3 text-xs leading-5 text-muted">{copy.source}: {sourceLine(seededCards ?? [])}</p>}</div><div><p className="mb-4 text-sm font-semibold text-muted" role="status">{summary}</p><VocabularyReview cards={schedule.queue} copy={copy} review={messages.review} /></div></div></Section>;
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

/** Orders cards for review: words already due first (oldest due first), then new words; words scheduled for later are held back. */
function reviewQueue(cards: ReviewCard[], dueDates: Map<string, Date>): { queue: ReviewCard[]; due: number; fresh: number; later: number } {
  const now = Date.now();
  const due = cards.filter((card) => card.id && (dueDates.get(card.id)?.getTime() ?? Infinity) <= now).sort((a, b) => dueDates.get(a.id!)!.getTime() - dueDates.get(b.id!)!.getTime());
  const fresh = cards.filter((card) => !card.id || !dueDates.has(card.id));
  return { queue: [...due, ...fresh], due: due.length, fresh: fresh.length, later: cards.length - due.length - fresh.length };
}
