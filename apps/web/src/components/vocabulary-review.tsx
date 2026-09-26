"use client";

import type { ReviewRating } from "@english4free/srs";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Copy = { reviewNow: string; noCards: string; again: string; hard: string; good: string; easy: string; nextCard: string; reviewed: string; saveFailed: string };
export type ReviewCard = { id?: string; headword: string; partOfSpeech: string | null; cefrLevel: string };

/**
 * Flashcard review. Cards backed by a published vocabulary record are scheduled
 * with FSRS on the server; catalogue-only cards still count as progress.
 */
export function VocabularyReview({ cards, copy }: { cards: ReviewCard[]; copy: Copy }) {
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
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
      setIndex((value) => value + 1);
    } catch {
      setError(true);
    } finally {
      setSyncing(false);
    }
  }

  if (!card) return <div className="rounded-ui border border-line bg-brand-soft p-6"><p className="font-serif text-2xl font-bold">{copy.noCards}</p><p className="mt-2 text-sm text-muted">{copy.reviewed}: {reviewed}</p></div>;
  const partOfSpeech = card.partOfSpeech && card.partOfSpeech !== "mixed" ? card.partOfSpeech : null;
  return <div className="rounded-[1.25rem] border border-line bg-surface p-7 shadow-card sm:p-10"><p className="text-sm font-bold uppercase tracking-[.16em] text-brand">{copy.reviewNow} · {index + 1}/{cards.length}</p><p className="mt-10 font-serif text-5xl font-bold tracking-tight">{card.headword}</p><p className="mt-3 text-sm text-muted">{[partOfSpeech, card.cefrLevel].filter(Boolean).join(" · ")}</p><div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"><Button disabled={syncing} variant="secondary" onClick={() => void rate("AGAIN")}>{copy.again}</Button><Button disabled={syncing} variant="secondary" onClick={() => void rate("HARD")}>{copy.hard}</Button><Button disabled={syncing} onClick={() => void rate("GOOD")}>{copy.good}</Button><Button disabled={syncing} variant="secondary" onClick={() => void rate("EASY")}>{copy.easy}</Button></div>{error ? <p className="mt-6 text-sm text-red-700" role="alert">{copy.saveFailed}</p> : <p className="mt-6 text-sm text-muted" role="status">{syncing ? "…" : `${copy.reviewed}: ${reviewed}`}</p>}</div>;
}
