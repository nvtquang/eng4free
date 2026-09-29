"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/ui/level-badge";

type Option = { id: string; text: string };
export type PracticeMistake = { id: string; questionId: string; sourceType: "LESSON" | "EXAM"; sourceTitle: string | null; timesWrong: number; prompt: string; options: Option[]; correctOptionId: string; explanation: string | null };
type Copy = { check: string; next: string; correct: string; incorrect: string; correctAnswer: string; finished: string; backToList: string; sourceLesson: string; sourceExam: string; timesWrong: string };

/** Re-practises the mistake notebook one MCQ at a time; a correct answer resolves it on the server. */
export function MistakePractice({ mistakes, copy }: { mistakes: PracticeMistake[]; copy: Copy }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const current = mistakes[index];

  async function check() {
    if (!current || selected === null || checked) return;
    setChecked(true);
    if (selected === current.correctOptionId) {
      setSyncing(true);
      try { await fetch("/api/mistakes/resolve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId: current.questionId }) }); } catch { /* resolution is best-effort; it will resurface next visit */ } finally { setSyncing(false); }
    }
  }

  function next() { setIndex((value) => value + 1); setSelected(null); setChecked(false); }

  if (!current) return <Card className="border-brand bg-brand-soft"><p className="font-serif text-2xl font-bold">{copy.finished}</p><Link className="mt-5 inline-flex" href="/mistakes"><Button>{copy.backToList}</Button></Link></Card>;

  const isCorrect = checked && selected === current.correctOptionId;
  const sourceLabel = current.sourceType === "LESSON" ? copy.sourceLesson : copy.sourceExam;
  return <Card>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-muted"><span>{index + 1}/{mistakes.length} · {sourceLabel}{current.sourceTitle ? ` · ${current.sourceTitle}` : ""}</span><LevelBadge>{copy.timesWrong.replace("{count}", String(current.timesWrong))}</LevelBadge></div>
    <p className="mt-4 text-lg font-bold leading-7">{current.prompt}</p>
    <div className="mt-5 grid gap-3">{current.options.map((option) => {
      const showCorrect = checked && option.id === current.correctOptionId;
      const showWrong = checked && option.id === selected && option.id !== current.correctOptionId;
      return <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-ui border p-4 transition ${showCorrect ? "border-emerald-500 bg-emerald-50" : showWrong ? "border-amber-500 bg-amber-50" : selected === option.id ? "border-brand bg-brand-soft" : "border-line hover:border-brand"}`}><input type="radio" name={current.questionId} value={option.id} checked={selected === option.id} disabled={checked} onChange={() => setSelected(option.id)} /><span>{option.text}</span></label>;
    })}</div>
    {checked && <div className={`mt-4 rounded-ui p-4 text-sm ${isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}><p className="font-bold">{isCorrect ? `✓ ${copy.correct}` : `! ${copy.incorrect}`}</p>{!isCorrect && <p className="mt-1">{copy.correctAnswer}: <span className="font-bold">{current.options.find((option) => option.id === current.correctOptionId)?.text}</span></p>}{current.explanation && <p className="mt-2 leading-6">{current.explanation}</p>}</div>}
    <div className="mt-6">{!checked ? <Button disabled={selected === null} onClick={check}>{copy.check}</Button> : <Button disabled={syncing} onClick={next}>{copy.next}</Button>}</div>
  </Card>;
}
