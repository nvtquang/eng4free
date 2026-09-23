"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Copy = ReturnType<typeof import("@/lib/skills-copy").getSkillsCopy>;
type History = { id: string; prompt: string; status: string; createdAt: string; turns: Array<{ id: string; durationMs: number | null; audioMediaId: string | null }> };

export function SpeakingPractice({ copy, prompt }: { copy: Copy; prompt: string }) {
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

  async function refresh() {
    const response = await fetch("/api/speaking/sessions", { cache: "no-store" });
    if (response.ok) setHistory((await response.json() as { sessions: History[] }).sessions);
  }

  useEffect(() => {
    void refresh();
    return () => {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(copy.unsupported); return;
    }
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = nextStream;
      chunks.current = [];
      const nextRecorder = new MediaRecorder(nextStream);
      recorder.current = nextRecorder;
      nextRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.current.push(event.data); };
      nextRecorder.onerror = () => { setError(copy.microphoneDenied); setState("idle"); };
      nextRecorder.onstop = () => {
        nextStream.getTracks().forEach((track) => track.stop());
        if (chunks.current.length === 0) { setError(copy.unsupported); setState("idle"); return; }
        const nextBlob = new Blob(chunks.current, { type: nextRecorder.mimeType || "audio/webm" });
        setBlob(nextBlob);
        setPreviewUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(nextBlob); });
        setDurationMs(Math.max(1, Date.now() - startedAt.current));
        setState("ready");
      };
      startedAt.current = Date.now();
      nextRecorder.start(250);
      setMessage(undefined); setError(undefined); setState("recording");
    } catch { setError(copy.microphoneDenied); }
  }

  function stop() {
    if (recorder.current?.state === "recording") { setState("stopping"); recorder.current.stop(); }
  }

  async function save() {
    if (!blob) return;
    setPending(true); setError(undefined); setMessage(undefined);
    try {
      const created = await fetch("/api/speaking/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ promptId: "local-speaking-skill", prompt, examType: null }) });
      const session = await created.json() as { id?: string; error?: string };
      if (!created.ok || !session.id) throw new Error(session.error ?? "Session failed");
      const form = new FormData();
      form.set("recording", new File([blob], "recording.webm", { type: blob.type || "audio/webm" }));
      form.set("durationMs", String(durationMs));
      const uploaded = await fetch(`/api/speaking/sessions/${session.id}/recordings`, { method: "POST", body: form });
      const result = await uploaded.json() as { error?: string };
      if (!uploaded.ok) throw new Error(result.error ?? "Upload failed");
      setBlob(undefined); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(undefined); setState("idle");
      await refresh(); setMessage(copy.savedRecording);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Save failed"); }
    finally { setPending(false); }
  }

  return <div className="grid gap-8 lg:grid-cols-[1fr_1fr]"><section className="rounded-ui border border-line bg-surface p-6 shadow-card"><h2 className="font-serif text-3xl font-bold">{prompt}</h2>{state === "stopping" && <p className="mt-3 text-sm text-muted">{copy.stoppingRecording}</p>}<div className="mt-6">{state === "recording" ? <Button onClick={stop}>{copy.stopRecording}</Button> : <Button disabled={state === "stopping"} onClick={start}>{copy.startRecording}</Button>}</div>{previewUrl && <><p className="mt-5 text-sm text-brand">{copy.recordingReady}</p><audio className="mt-3 w-full" controls preload="metadata" src={previewUrl} /><Button className="mt-4" disabled={pending} onClick={save}>{pending ? copy.saving : copy.saveRecording}</Button></>}{message && <p className="mt-4 text-sm text-brand" role="status">{message}</p>}{error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}</section><aside><h2 className="font-serif text-2xl font-bold">{copy.history}</h2><div className="mt-4 space-y-3">{history.length === 0 && <p className="text-sm text-muted">{copy.noHistory}</p>}{history.map((session) => <article className="rounded-ui border border-line bg-surface p-4" key={session.id}><p className="font-bold">{session.prompt}</p><p className="mt-1 text-sm text-muted">{new Date(session.createdAt).toLocaleString()}</p>{session.turns.map((turn) => turn.audioMediaId && <audio className="mt-3 w-full" controls preload="metadata" src={`/api/media/${turn.audioMediaId}`} key={turn.id} />)}</article>)}</div></aside></div>;
}
