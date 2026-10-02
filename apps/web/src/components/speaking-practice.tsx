"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeakingFeedback } from "@english4free/content-schemas";
import { SpeakingFeedbackPanel } from "@/components/speaking-feedback-panel";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format-date";
import type { AiSpeakingCopy } from "@/lib/ai-speaking-copy";

type Copy = ReturnType<typeof import("@/lib/skills-copy").getSkillsCopy>;
type History = { id: string; prompt: string; status: string; createdAt: string; turns: Array<{ id: string; durationMs: number | null; audioMediaId: string | null; transcript: string | null; feedback: SpeakingFeedback | null }> };

/** Records and reviews answers for one topic (and IELTS part); history is scoped to that topic. */
/** maxSeconds stops the recording at the time limit, as in IELTS Part 2 (two minutes). */
export function SpeakingPractice({ copy, aiCopy, prompt, topicId, part, examType = null, maxSeconds }: { copy: Copy; aiCopy: AiSpeakingCopy; prompt: string; topicId: string; part?: string; examType?: "TOEIC" | "IELTS" | null; maxSeconds?: number }) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const [state, setState] = useState<"idle" | "recording" | "stopping" | "ready">("idle");
  const [blob, setBlob] = useState<Blob>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [durationMs, setDurationMs] = useState(0);
  const [history, setHistory] = useState<History[]>([]);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const refresh = useCallback(async () => { const query = new URLSearchParams({ topicId, ...(part ? { part } : {}) });
    const response = await fetch(`/api/speaking/sessions?${query}`, { cache: "no-store" }); if (response.ok) setHistory((await response.json() as { sessions: History[] }).sessions); }, [topicId, part]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    if (state !== "recording") return;
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(seconds);
      if (maxSeconds && seconds >= maxSeconds && recorder.current?.state === "recording") { setState("stopping"); recorder.current.stop(); }
    }, 250);
    return () => clearInterval(timer);
  }, [state, maxSeconds]);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError(copy.unsupported); return; }
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = nextStream; chunks.current = [];
      const nextRecorder = new MediaRecorder(nextStream); recorder.current = nextRecorder;
      nextRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.current.push(event.data); };
      nextRecorder.onerror = () => { setError(copy.microphoneDenied); setState("idle"); };
      nextRecorder.onstop = () => {
        nextStream.getTracks().forEach((track) => track.stop());
        if (chunks.current.length === 0) { setError(copy.unsupported); setState("idle"); return; }
        const nextBlob = new Blob(chunks.current, { type: nextRecorder.mimeType || "audio/webm" });
        setBlob(nextBlob); setPreviewUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(nextBlob); });
        setDurationMs(Math.max(1, Date.now() - startedAt.current)); setState("ready");
      };
      startedAt.current = Date.now(); setElapsed(0); nextRecorder.start(250); setMessage(undefined); setError(undefined); setState("recording");
    } catch { setError(copy.microphoneDenied); }
  }

  function stop() { if (recorder.current?.state === "recording") { setState("stopping"); recorder.current.stop(); } }

  async function save() {
    if (!blob) return;
    setPending(true); setError(undefined); setMessage(undefined);
    try {
      const created = await fetch("/api/speaking/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topicId, part, prompt, examType }) });
      const session = await created.json() as { id?: string; error?: string };
      if (!created.ok || !session.id) throw new Error(session.error ?? copy.saveFailed);
      const form = new FormData(); form.set("recording", new File([blob], "recording.webm", { type: blob.type || "audio/webm" })); form.set("durationMs", String(durationMs));
      const uploaded = await fetch(`/api/speaking/sessions/${session.id}/recordings`, { method: "POST", body: form });
      const uploadedBody = await uploaded.json() as { error?: string };
      if (!uploaded.ok) throw new Error(uploadedBody.error ?? copy.saveFailed);
      setBlob(undefined); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(undefined); setState("idle");
      setMessage(aiCopy.analyzing);
      const feedbackResponse = await fetch(`/api/speaking/sessions/${session.id}/feedback`, { method: "POST" });
      const feedbackResult = await feedbackResponse.json().catch(() => ({})) as { providerConfigured?: boolean; feedback?: SpeakingFeedback | null; error?: string };
      setMessage(feedbackResponse.ok && feedbackResult.feedback ? aiCopy.feedbackReady : aiCopy.providerUnavailable);
      await refresh();
    } catch (saveError) { setError(saveError instanceof Error && saveError.message ? saveError.message : copy.saveFailed); }
    finally { setPending(false); }
  }

  return <div className="grid gap-8 lg:grid-cols-[1fr_1fr]"><section className="rounded-ui border border-line bg-surface p-6 shadow-card"><h2 className="font-serif text-3xl font-bold">{prompt}</h2>{state === "stopping" && <p className="mt-3 text-sm text-muted">{copy.stoppingRecording}</p>}<div className="mt-6 flex flex-wrap items-center gap-4">{state === "recording" ? <Button onClick={stop}>{copy.stopRecording}</Button> : <Button disabled={state === "stopping"} onClick={start}>{aiCopy.pushToTalk}</Button>}{state === "recording" && <span className="font-serif text-3xl font-bold tabular-nums text-brand" role="timer" aria-live="off">{clock(elapsed)}{maxSeconds ? ` / ${clock(maxSeconds)}` : ""}</span>}</div>{previewUrl && <><p className="mt-5 text-sm text-brand">{copy.recordingReady}</p><audio className="mt-3 w-full" controls preload="metadata" src={previewUrl} /><Button className="mt-4" disabled={pending} onClick={save}>{pending ? copy.saving : copy.saveRecording}</Button></>}{message && <p className="mt-4 text-sm text-brand" role="status">{message}</p>}{error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}</section><aside><h2 className="font-serif text-2xl font-bold">{copy.history}</h2><div className="mt-4 space-y-3">{history.length === 0 && <p className="text-sm text-muted">{copy.noHistory}</p>}{history.map((session) => { const hasDetail = session.turns.some((turn) => turn.audioMediaId || turn.transcript || turn.feedback); return <article className="rounded-ui border border-line bg-surface p-4" key={session.id}><p className="font-bold">{session.prompt}</p><p className="mt-1 text-sm text-muted">{formatDateTime(session.createdAt)}</p>{hasDetail && <details className="mt-2 text-sm"><summary className="cursor-pointer font-semibold text-brand hover:text-brand-deep">{aiCopy.viewFeedback}</summary><div className="mt-3">{session.turns.map((turn) => <div key={turn.id}>{turn.audioMediaId && <audio className="w-full" controls preload="metadata" src={`/api/media/${turn.audioMediaId}`} />}{turn.transcript && <div className="mt-3 rounded-ui bg-canvas p-3 text-sm"><p className="font-bold">{aiCopy.transcript}</p><p className="mt-1 text-muted">{turn.transcript}</p></div>}{turn.feedback && <SpeakingFeedbackPanel feedback={turn.feedback} copy={aiCopy} />}</div>)}</div></details>}</article>; })}</div></aside></div>;
}

function clock(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
