"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Feedback = { correct: boolean; explanation: string; nextStep: string; providerUsed: boolean };
type StoredFeedback = { questionId: string; learnerAnswer: string; feedback: Feedback };
type ChatTurn = { role: "learner" | "tutor"; content: string };

export function TutorExplanation({ attemptId, questionId, learnerAnswer }: { attemptId: string; questionId: string; learnerAnswer: string | null }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [thread, setThread] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [chatPending, setChatPending] = useState(false);

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
  async function sendFollowUp() {
    const question = draft.trim();
    if (!question || chatPending) return;
    const nextThread: ChatTurn[] = [...thread, { role: "learner", content: question }];
    setThread(nextThread); setDraft(""); setChatPending(true); setError(undefined);
    try {
      const response = await fetch("/api/ai/tutor/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attemptId, questionId, learnerAnswer, messages: nextThread }) });
      const body = await response.json().catch(() => ({})) as { reply?: string; error?: string };
      if (!response.ok || !body.reply) throw new Error(body.error ?? "Tutor service unavailable");
      setThread((current) => [...current, { role: "tutor", content: body.reply! }]);
    } catch (caught) {
      setThread((current) => current.slice(0, -1));
      setError(caught instanceof Error ? caught.message : "Tutor service unavailable");
    } finally { setChatPending(false); }
  }

  return <div className="mt-3"><Button variant="secondary" className="min-h-8 px-3 text-xs" disabled={pending} onClick={ask}>{pending ? "Thinking…" : "Ask AI Tutor"}</Button>{error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}{feedback && <div className="mt-3 rounded-ui bg-brand-soft p-4 text-sm leading-6"><p>{feedback.explanation}</p><p className="mt-2 font-bold">Next: {feedback.nextStep}</p><p className="mt-2 text-xs text-muted">{feedback.providerUsed ? "AI practice feedback" : "Official explanation"}</p></div>}
    {feedback && <div className="mt-3">
      {thread.length > 0 && <div className="space-y-2">{thread.map((turn, index) => <div key={index} className={`rounded-ui p-3 text-sm leading-6 ${turn.role === "learner" ? "bg-band" : "bg-brand-soft"}`}><span className="mr-1 text-xs font-bold text-muted">{turn.role === "learner" ? "You" : "Tutor"}:</span>{turn.content}</div>)}</div>}
      <div className="mt-2 flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendFollowUp(); }} disabled={chatPending} placeholder="Ask a follow-up about this question" aria-label="Ask a follow-up about this question" className="min-h-8 flex-1 rounded-ui border border-line bg-canvas px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60" /><Button variant="secondary" className="min-h-8 px-3 text-xs" disabled={chatPending || !draft.trim()} onClick={() => void sendFollowUp()}>{chatPending ? "…" : "Send"}</Button></div>
    </div>}
  </div>;
}
