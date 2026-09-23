"use client";

import { createVocabularyMemory, scheduleVocabularyReview, type ReviewRating, type VocabularyMemory } from "@english4free/srs";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { VocabularyCard } from "@/modules/vocabulary/cefr-catalog";

type Copy = { reviewNow: string; noCards: string; again: string; hard: string; good: string; easy: string; nextCard: string; reviewed: string };
type StoredMemory = Omit<VocabularyMemory, "dueAt" | "lastReview"> & { dueAt: string; lastReview: string | null };
function restore(memory: StoredMemory): VocabularyMemory { return { ...memory, dueAt: new Date(memory.dueAt), lastReview: memory.lastReview ? new Date(memory.lastReview) : null }; }

export function VocabularyReview({ cards, copy }: { cards: VocabularyCard[]; copy: Copy }) {
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const key = "e4f-vocabulary-memory-v1";
  const card = cards[index];
  const memories = useMemo(() => new Map<string, VocabularyMemory>(), []);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try { Object.entries(JSON.parse(stored) as Record<string, StoredMemory>).forEach(([word, memory]) => memories.set(word, restore(memory))); }
      catch { window.localStorage.removeItem(key); }
    }
    setReady(true);
  }, [memories]);

  async function rate(rating: ReviewRating) {
    if (!card || syncing) return;
    setSyncing(true);
    const next = scheduleVocabularyReview(memories.get(card.headword) ?? createVocabularyMemory(), rating);
    memories.set(card.headword, next);
    const serializable = Object.fromEntries([...memories.entries()].map(([word, memory]) => [word, { ...memory, dueAt: memory.dueAt.toISOString(), lastReview: memory.lastReview?.toISOString() ?? null }]));
    window.localStorage.setItem(key, JSON.stringify(serializable));
    try {
      await fetch("/api/progress/vocabulary", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ headword: card.headword, rating, eventId: crypto.randomUUID() }) });
    } finally {
      setReviewed((value) => value + 1);
      setIndex((value) => value + 1);
      setSyncing(false);
    }
  }

  if (!ready) return <div className="rounded-ui border border-line bg-surface p-6 text-sm text-muted">…</div>;
  if (!card) return <div className="rounded-ui border border-line bg-brand-soft p-6"><p className="font-serif text-2xl font-bold">{copy.noCards}</p><p className="mt-2 text-sm text-muted">{copy.reviewed}: {reviewed}</p></div>;
  return <div className="rounded-[1.25rem] border border-line bg-surface p-7 shadow-card sm:p-10"><p className="text-sm font-bold uppercase tracking-[.16em] text-brand">{copy.reviewNow} · {index + 1}/{cards.length}</p><p className="mt-10 font-serif text-5xl font-bold tracking-tight">{card.headword}</p><p className="mt-3 text-sm text-muted">{card.partOfSpeech ?? "—"} · {card.cefrLevel}</p><div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"><Button disabled={syncing} variant="secondary" onClick={() => void rate("AGAIN")}>{copy.again}</Button><Button disabled={syncing} variant="secondary" onClick={() => void rate("HARD")}>{copy.hard}</Button><Button disabled={syncing} onClick={() => void rate("GOOD")}>{copy.good}</Button><Button disabled={syncing} variant="secondary" onClick={() => void rate("EASY")}>{copy.easy}</Button></div><p className="mt-6 text-sm text-muted" role="status">{syncing ? "…" : `${copy.reviewed}: ${reviewed}`}</p></div>;
}
