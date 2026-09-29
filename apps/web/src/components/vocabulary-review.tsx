"use client";

import type { ReviewRating } from "@english4free/srs";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Copy = { reviewNow: string; noCards: string; again: string; hard: string; good: string; easy: string; nextCard: string; reviewed: string; saveFailed: string };
type ReviewCopy = { modeLabel: string; recognition: string; typing: string; dictation: string; show: string; typePrompt: string; listenPrompt: string; play: string; check: string; correctIs: string; correct: string; incorrect: string };
export type ReviewCard = { id?: string; headword: string; partOfSpeech: string | null; cefrLevel: string; meaning?: string | null };
type Mode = "recognition" | "typing" | "dictation";

function normalize(value: string) { return value.trim().toLowerCase().replace(/\s+/g, " "); }

function speak(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

/**
 * Flashcard review with three modes: recognition (self-rate), typing (recall the
 * word from its meaning) and dictation (hear the word and write it). Cards backed by
 * a published record are scheduled with FSRS on the server; catalogue-only cards
 * still count as progress. Typed/dictated answers grade themselves and rate the card.
 */
export function VocabularyReview({ cards, copy, review }: { cards: ReviewCard[]; copy: Copy; review: ReviewCopy }) {
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<Mode>("recognition");
  const [typed, setTyped] = useState("");
  const [graded, setGraded] = useState<null | { correct: boolean }>(null);
  const card = cards[index];

  async function rate(rating: ReviewRating) {
    if (!card || syncing) return;
    setSyncing(true); setError(false);
    const eventId = crypto.randomUUID();
    const request = card.id
      ? fetch("/api/vocabulary/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ vocabularyId: card.id, rating, eventId }) })
      : fetch("/api/progress/vocabulary", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ headword: card.headword, rating, eventId }) });
    try {
      if (!(await request).ok) throw new Error("Review was not saved");
      setReviewed((value) => value + 1);
      advance();
    } catch {
      setError(true);
    } finally {
      setSyncing(false);
    }
  }

  function advance() {
    setIndex((value) => value + 1);
    setTyped("");
    setGraded(null);
  }

  function check() {
    if (!card || graded) return;
    const correct = normalize(typed) === normalize(card.headword);
    setGraded({ correct });
  }

  if (!card) return <div className="rounded-ui border border-line bg-brand-soft p-6"><p className="font-serif text-2xl font-bold">{copy.noCards}</p><p className="mt-2 text-sm text-muted">{copy.reviewed}: {reviewed}</p></div>;
  const partOfSpeech = card.partOfSpeech && card.partOfSpeech !== "mixed" ? card.partOfSpeech : null;
  const meta = [partOfSpeech, card.cefrLevel].filter(Boolean).join(" · ");
  const modes: Array<{ id: Mode; label: string }> = [{ id: "recognition", label: review.recognition }, { id: "typing", label: review.typing }, { id: "dictation", label: review.dictation }];

  return <div className="rounded-[1.25rem] border border-line bg-surface p-7 shadow-card sm:p-10">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-bold uppercase tracking-[.16em] text-brand">{copy.reviewNow} · {index + 1}/{cards.length}</p>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={review.modeLabel}>{modes.map((item) => <button key={item.id} role="tab" aria-selected={mode === item.id} onClick={() => { setMode(item.id); setTyped(""); setGraded(null); }} className={`rounded-full px-3 py-1 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${mode === item.id ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft"}`}>{item.label}</button>)}</div>
    </div>

    {mode === "recognition" && <>
      <p className="mt-10 font-serif text-5xl font-bold tracking-tight">{card.headword}</p>
      <p className="mt-3 text-sm text-muted">{meta}</p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"><Button disabled={syncing} variant="secondary" onClick={() => void rate("AGAIN")}>{copy.again}</Button><Button disabled={syncing} variant="secondary" onClick={() => void rate("HARD")}>{copy.hard}</Button><Button disabled={syncing} onClick={() => void rate("GOOD")}>{copy.good}</Button><Button disabled={syncing} variant="secondary" onClick={() => void rate("EASY")}>{copy.easy}</Button></div>
    </>}

    {(mode === "typing" || mode === "dictation") && <>
      {mode === "typing"
        ? <div className="mt-8"><p className="text-sm font-bold text-muted">{review.typePrompt}</p><p className="mt-3 font-serif text-3xl font-bold leading-snug">{card.meaning || meta || "—"}</p></div>
        : <div className="mt-8 flex items-center gap-4"><Button variant="secondary" onClick={() => speak(card.headword)} aria-label={review.play}>▶ {review.play}</Button><p className="text-sm text-muted">{review.listenPrompt}</p></div>}
      <input value={typed} onChange={(event) => setTyped(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { if (graded) advance(); else check(); } }} disabled={Boolean(graded)} autoComplete="off" spellCheck={false} className="mt-6 w-full rounded-ui border border-line bg-canvas px-4 py-3 text-lg font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-70" placeholder={review.typePrompt} aria-label={review.typePrompt} />
      {graded && <div className={`mt-4 rounded-ui p-4 text-sm ${graded.correct ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}><p className="font-bold">{graded.correct ? `✓ ${review.correct}` : `! ${review.incorrect}`}</p>{!graded.correct && <p className="mt-1">{review.correctIs}: <span className="font-bold">{card.headword}</span></p>}<p className="mt-1 text-xs text-muted">{meta}</p></div>}
      <div className="mt-6 flex gap-3">{!graded
        ? <Button disabled={!typed.trim()} onClick={check}>{review.check}</Button>
        : <Button disabled={syncing} onClick={() => void rate(graded.correct ? "GOOD" : "AGAIN")}>{copy.nextCard}</Button>}</div>
    </>}

    {error ? <p className="mt-6 text-sm text-red-700" role="alert">{copy.saveFailed}</p> : <p className="mt-6 text-sm text-muted" role="status">{syncing ? "…" : `${copy.reviewed}: ${reviewed}`}</p>}
  </div>;
}
