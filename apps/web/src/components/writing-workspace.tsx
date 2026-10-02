"use client";

import { useCallback, useEffect, useState } from "react";
import { WritingFeedbackPanel, type WritingFeedbackView } from "@/components/writing-feedback-panel";
import { formatDateTime } from "@/lib/format-date";
import { Button } from "@/components/ui/button";

type Copy = ReturnType<typeof import("@/lib/skills-copy").getSkillsCopy>;
type FeedbackCopy = (typeof import("@/lib/ai-feedback-copy").aiFeedbackCopy)[keyof typeof import("@/lib/ai-feedback-copy").aiFeedbackCopy];
type Submission = {
  id: string; text: string; wordCount: number; status: string; updatedAt: string; submittedAt: string | null; prompt: { text?: string };
  revisions: Array<{ id: string; text: string; wordCount: number; createdAt: string }>;
  feedback: Array<{ id: string; content: WritingFeedbackView; createdAt: string }>;
};
type Evaluation = { feedback: WritingFeedbackView | null; providerConfigured: boolean; error?: string };
export type WritingTask = { topicId: string; taskType: "IELTS_TASK_1" | "IELTS_TASK_2" | "GENERAL"; examType: "TOEIC" | "IELTS" | null };

export function WritingWorkspace({ copy, feedbackCopy, prompt, task }: { copy: Copy; feedbackCopy: FeedbackCopy; prompt: string; task: WritingTask }) {
  const [submissionId, setSubmissionId] = useState<string>();
  const [text, setText] = useState("");
  const [history, setHistory] = useState<Submission[]>([]);
  const [feedback, setFeedback] = useState<WritingFeedbackView | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const wordCount = text.trim() ? text.trim().split(/\s+/u).length : 0;

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/writing/submissions?topicId=${encodeURIComponent(task.topicId)}`, { cache: "no-store" });
    if (response.ok) setHistory((await response.json() as { submissions: Submission[] }).submissions);
  }, [task.topicId]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function evaluate(id: string) {
    const response = await fetch("/api/writing/evaluate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionId: id }) });
    const result = await response.json().catch(() => ({})) as Evaluation;
    if (!response.ok) throw new Error(result.error ?? feedbackCopy.feedbackUnavailable);
    setFeedback(result.feedback);
    setMessage(result.feedback ? undefined : feedbackCopy.feedbackUnavailable);
  }

  async function save(action: "SAVE_DRAFT" | "SUBMIT") {
    setPending(true);
    setMessage(action === "SUBMIT" ? feedbackCopy.evaluating : undefined);
    try {
      const response = await fetch("/api/writing/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionId, topicId: task.topicId, taskType: task.taskType, promptText: prompt, text, action, examType: task.examType }) });
      const body = await response.json() as { id?: string; error?: string };
      if (!response.ok || !body.id) throw new Error(body.error ?? copy.saveFailed);
      setSubmissionId(body.id);
      await refresh();
      if (action === "SAVE_DRAFT") { setMessage(copy.saved); return; }
      // The submission is already saved and listed; AI feedback arrives afterwards and may be unavailable.
      await evaluate(body.id).catch(() => setMessage(feedbackCopy.feedbackUnavailable));
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error && error.message ? error.message : copy.saveFailed);
    } finally {
      setPending(false);
    }
  }

  function load(item: Submission) {
    setSubmissionId(item.id);
    setText(item.text);
    setFeedback(item.feedback[0]?.content ?? null);
    setMessage(undefined);
  }

  return <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
    <section className="rounded-ui border border-line bg-surface p-6 shadow-card">
      <p className="font-serif text-2xl font-bold">{prompt}</p>
      <textarea className="mt-6 min-h-72 w-full rounded-ui border border-line bg-canvas p-4 leading-7 outline-none focus:border-brand" value={text} onChange={(event) => setText(event.target.value)} />
      <p className="mt-2 text-sm text-muted">{wordCount} {copy.words}</p>
      <div className="mt-5 flex gap-3"><Button variant="secondary" disabled={pending} onClick={() => save("SAVE_DRAFT")}>{pending ? copy.saving : copy.saveDraft}</Button><Button disabled={pending || !text.trim()} onClick={() => save("SUBMIT")}>{copy.submit}</Button></div>
      {message && <p className="mt-4 text-sm text-brand" role="status">{message}</p>}
      {feedback && <WritingFeedbackPanel feedback={feedback} copy={feedbackCopy} />}
    </section>
    <aside><h2 className="font-serif text-2xl font-bold">{copy.history}</h2><div className="mt-4 space-y-3">{history.length === 0 && <p className="text-sm text-muted">{copy.noHistory}</p>}{history.map((item) => <article className="rounded-ui border border-line bg-surface p-4" key={item.id}><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-bold">{item.status === "DRAFT" ? copy.statusDraft : copy.statusSubmitted}{item.feedback.length > 0 && <span className="ml-2 text-xs font-semibold text-brand">· {feedbackCopy.aiFeedback}</span>}</p><p className="text-sm text-muted">{item.wordCount} {copy.words} · {formatDateTime(item.updatedAt)}</p></div><Button variant="secondary" className="min-h-8 shrink-0 px-3 text-xs" onClick={() => load(item)}>{copy.load}</Button></div>{item.revisions.length > 1 && <details className="mt-2 text-sm"><summary className="cursor-pointer font-semibold text-brand hover:text-brand-deep">{copy.revisions}: {item.revisions.length}</summary><ol className="mt-2 space-y-1 text-muted">{item.revisions.map((revision) => <li key={revision.id}>{revision.wordCount} {copy.words} · {formatDateTime(revision.createdAt)}</li>)}</ol></details>}</article>)}</div></aside>
  </div>;
}
