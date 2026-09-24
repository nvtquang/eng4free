"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Feedback = { correct: boolean; explanation: string; nextStep: string; providerUsed: boolean };
type StoredFeedback = { questionId: string; learnerAnswer: string; feedback: Feedback };

export function TutorExplanation({ attemptId, questionId, learnerAnswer }: { attemptId: string; questionId: string; learnerAnswer: string | null }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    async function loadHistory() {
      const response = await fetch(`/api/ai/tutor?attemptId=${encodeURIComponent(attemptId)}`, { cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json() as { feedback: StoredFeedback[] };
      const saved = body.feedback.find((item) => item.questionId === questionId && item.learnerAnswer === learnerAnswer);
      if (active) setFeedback(saved?.feedback ?? null);
    }
    if (learnerAnswer) void loadHistory();
    else setFeedback(null);
    return () => { active = false; };
  }, [attemptId, learnerAnswer, questionId]);

  if (!learnerAnswer) return null;
  async function ask() {
    setPending(true); setError(undefined);
    try {
      const response = await fetch("/api/ai/tutor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attemptId, questionId, learnerAnswer }) });
      const body = await response.json().catch(() => ({})) as Feedback & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Tutor service unavailable");
      setFeedback(body);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Tutor service unavailable"); }
    finally { setPending(false); }
  }
  return <div className="mt-3"><Button variant="secondary" className="min-h-8 px-3 text-xs" disabled={pending} onClick={ask}>{pending ? "Thinking…" : "Ask AI Tutor"}</Button>{error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}{feedback && <div className="mt-3 rounded-ui bg-brand-soft p-4 text-sm leading-6"><p>{feedback.explanation}</p><p className="mt-2 font-bold">Next: {feedback.nextStep}</p><p className="mt-2 text-xs text-muted">{feedback.providerUsed ? "AI practice feedback" : "Official explanation"}</p></div>}</div>;
}
