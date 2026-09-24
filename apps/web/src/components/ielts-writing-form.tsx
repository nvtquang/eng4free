"use client";

import { useState } from "react";
import { WritingFeedbackPanel, type WritingFeedbackView } from "@/components/writing-feedback-panel";
import { Button } from "@/components/ui/button";

type Copy = { writingPrompt: string; submitWriting: string; writingPlaceholder: string; wordCount: string; paragraphs: string; providerNotConfigured: string; feedbackReady: string };
type FeedbackCopy = (typeof import("@/lib/ai-feedback-copy").aiFeedbackCopy)[keyof typeof import("@/lib/ai-feedback-copy").aiFeedbackCopy];
type Result = { diagnostics: { wordCount: number; paragraphCount: number; meetsExpectedWordCount: boolean | null; notices: string[] }; feedback: WritingFeedbackView | null; providerConfigured: boolean; error?: string };

export function IeltsWritingForm({ copy, feedbackCopy }: { copy: Copy; feedbackCopy: FeedbackCopy }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  async function submit() {
    setPending(true); setResult(null); setError(undefined);
    try {
      const savedResponse = await fetch("/api/writing/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ promptId: "technology-social-task-2", taskType: "IELTS_TASK_2", promptText: copy.writingPrompt, text, action: "SUBMIT", examType: "IELTS" }) });
      const saved = await savedResponse.json() as { id?: string; error?: string };
      if (!savedResponse.ok || !saved.id) throw new Error(saved.error ?? "Could not save writing");
      const evaluationResponse = await fetch("/api/writing/evaluate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionId: saved.id }) });
      const evaluation = await evaluationResponse.json().catch(() => ({})) as Result;
      if (!evaluationResponse.ok) throw new Error(evaluation.error ?? feedbackCopy.feedbackUnavailable);
      setResult(evaluation);
    } catch (caught) { setError(caught instanceof Error ? caught.message : feedbackCopy.feedbackUnavailable); }
    finally { setPending(false); }
  }
  return <div className="rounded-[1.25rem] border border-line bg-surface p-6 shadow-card sm:p-8"><p className="font-serif text-2xl font-bold">{copy.writingPrompt}</p><textarea className="mt-6 min-h-64 w-full rounded-ui border border-line bg-canvas p-4 leading-7 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" value={text} onChange={(event) => setText(event.target.value)} placeholder={copy.writingPlaceholder} aria-label={copy.writingPlaceholder} /><div className="mt-5"><Button disabled={!text.trim() || pending} onClick={submit}>{pending ? feedbackCopy.evaluating : copy.submitWriting}</Button></div>{error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}{result && <div className="mt-7 border-t border-line pt-6"><p className="text-sm font-bold text-brand">{result.providerConfigured ? copy.feedbackReady : copy.providerNotConfigured}</p><dl className="mt-4 grid grid-cols-2 gap-4"><div><dt className="text-sm text-muted">{copy.wordCount}</dt><dd className="mt-1 text-2xl font-bold">{result.diagnostics.wordCount}</dd></div><div><dt className="text-sm text-muted">{copy.paragraphs}</dt><dd className="mt-1 text-2xl font-bold">{result.diagnostics.paragraphCount}</dd></div></dl>{result.diagnostics.notices.map((notice) => <p className="mt-3 text-sm text-muted" key={notice}>{notice}</p>)}{result.feedback && <WritingFeedbackPanel feedback={result.feedback} copy={feedbackCopy} />}</div>}</div>;
}
