"use client";

import { useState } from "react";

type Copy = { add: string; added: string; adding: string; already: string };

/** Saves a published vocabulary word to the FSRS review deck while the learner is studying. */
export function AddToWordbookButton({ vocabularyId, copy, saved = false }: { vocabularyId: string; copy: Copy; saved?: boolean }) {
  const [state, setState] = useState<"idle" | "saving" | "added" | "already">(saved ? "already" : "idle");

  async function add() {
    if (state === "saving" || state === "added" || state === "already") return;
    setState("saving");
    try {
      const response = await fetch("/api/vocabulary/wordbook", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ vocabularyId }) });
      if (!response.ok) throw new Error("failed");
      const data = await response.json();
      setState(data.added ? "added" : "already");
    } catch {
      setState("idle");
    }
  }

  const label = state === "saving" ? copy.adding : state === "added" ? copy.added : state === "already" ? copy.already : copy.add;
  const done = state === "added" || state === "already";
  return <button type="button" onClick={add} disabled={state === "saving" || done} className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${done ? "border-brand bg-brand-soft text-brand-deep" : "border-line text-muted hover:border-brand hover:text-brand"}`} aria-live="polite">
    <span aria-hidden="true">{done ? "✓" : "+"}</span>{label}
  </button>;
}
