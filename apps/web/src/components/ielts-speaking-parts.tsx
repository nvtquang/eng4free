"use client";

import { useEffect, useState } from "react";
import { SpeakingPractice } from "@/components/speaking-practice";
import { Button } from "@/components/ui/button";
import type { AiSpeakingCopy } from "@/lib/ai-speaking-copy";

type SkillsCopy = ReturnType<typeof import("@/lib/skills-copy").getSkillsCopy>;
type CueCard = { topic: string; points: string[]; closing: string };
export type SpeakingPartsText = { part2: string; part3: string; youShouldSay: string; prepare: string; preparing: string; ready: string; prepNote: string; chooseQuestion: string; record: string };

const PREP_SECONDS = 60;

/** Interactive IELTS Part 2 (1-minute preparation, then a long-turn recording) and Part 3 (record answers to discussion questions). Part 1 stays as a reference list on the page. */
export function IeltsSpeakingParts({ topicId, cueCard, part3, text, skillsCopy, aiCopy }: { topicId: string; cueCard: CueCard | undefined; part3: string[]; text: SpeakingPartsText; skillsCopy: SkillsCopy; aiCopy: AiSpeakingCopy }) {
  const [prep, setPrep] = useState<"idle" | "running" | "done">("idle");
  const [remaining, setRemaining] = useState(PREP_SECONDS);
  const [part3Index, setPart3Index] = useState(0);

  useEffect(() => {
    if (prep !== "running") return;
    if (remaining <= 0) { setPrep("done"); return; }
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [prep, remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(1, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return <div className="space-y-10">
    {cueCard && <section>
      <div className="rounded-ui border-2 border-brand bg-surface p-5">
        <h2 className="font-bold text-brand">{text.part2}</h2>
        <p className="mt-3 font-bold leading-7">{cueCard.topic}</p>
        <p className="mt-3 text-sm text-muted">{text.youShouldSay}</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 leading-7">{cueCard.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <p className="mt-2 leading-7">{cueCard.closing}</p>
      </div>

      {prep === "idle" && <div className="mt-4 flex flex-wrap items-center gap-3"><Button onClick={() => { setRemaining(PREP_SECONDS); setPrep("running"); }}>{text.prepare}</Button><p className="text-sm text-muted">{text.prepNote}</p></div>}
      {prep === "running" && <div className="mt-4 flex flex-wrap items-center gap-4" role="timer" aria-live="polite"><span className="font-serif text-4xl font-bold tabular-nums text-brand">{mm}:{ss}</span><Button variant="secondary" onClick={() => setPrep("done")}>{text.ready}</Button><p className="text-sm text-muted">{text.preparing}</p></div>}
      {prep === "done" && <div className="mt-6"><p className="mb-4 text-sm text-muted">{text.record}</p><SpeakingPractice copy={skillsCopy} aiCopy={aiCopy} prompt={cueCard.topic} topicId={topicId} part="part2" examType="IELTS" /></div>}
    </section>}

    {part3.length > 0 && <section>
      <div className="rounded-ui border border-line bg-surface p-5">
        <h2 className="font-bold text-brand">{text.part3}</h2>
        <p className="mt-3 text-sm text-muted">{text.chooseQuestion}</p>
        <ul className="mt-3 grid gap-2">{part3.map((question, index) => <li key={question}><button onClick={() => setPart3Index(index)} aria-current={index === part3Index ? "true" : undefined} className={`block w-full rounded-ui border p-3 text-left text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${index === part3Index ? "border-brand bg-brand-soft/40 font-bold" : "border-line hover:border-brand"}`}>{question}</button></li>)}</ul>
      </div>
      <div className="mt-6"><SpeakingPractice key={`part3-${part3Index}`} copy={skillsCopy} aiCopy={aiCopy} prompt={part3[part3Index]} topicId={topicId} part={`part3:${part3Index}`} examType="IELTS" /></div>
    </section>}
  </div>;
}
