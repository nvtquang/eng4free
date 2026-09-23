"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Copy = { record: string; stop: string; recording: string; playback: string; targetPlayback: string; unsupported: string; permissionDenied: string; ready: string; retry: string; analysisPending: string };

export function AudioRecorder({ copy, targetText }: { copy: Copy; targetText?: string }) {
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const activeStream = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"idle" | "recording" | "stopping" | "ready" | "error">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    setCanSpeak("speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
    return () => {
      activeStream.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  function playTarget() {
    if (!targetText || !canSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = "en-US";
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(copy.unsupported); setState("error"); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStream.current = stream;
      chunks.current = [];
      const instance = new MediaRecorder(stream);
      recorder.current = instance;
      instance.ondataavailable = (event) => { if (event.data.size > 0) chunks.current.push(event.data); };
      instance.onerror = () => { setError(copy.permissionDenied); setState("error"); };
      instance.onstop = () => {
        activeStream.current?.getTracks().forEach((track) => track.stop());
        if (chunks.current.length === 0) { setError(copy.unsupported); setState("error"); return; }
        const blob = new Blob(chunks.current, { type: instance.mimeType || "audio/webm" });
        setAudioUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(blob); });
        setState("ready");
      };
      instance.start(250);
      setError(null);
      setState("recording");
    } catch {
      setError(copy.permissionDenied);
      setState("error");
    }
  }

  function stop() {
    if (recorder.current?.state === "recording") {
      setState("stopping");
      recorder.current.stop();
    }
  }

  return <div className="rounded-ui border border-line bg-surface p-6">
    <p className="text-sm font-bold text-brand">{state === "recording" ? copy.recording : state === "stopping" ? "…" : copy.ready}</p>
    {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
    {targetText && canSpeak && <Button className="mt-5" variant="secondary" onClick={playTarget}>{copy.targetPlayback}</Button>}
    <div className="mt-5 flex flex-wrap gap-3">{state === "recording" ? <Button onClick={stop}>{copy.stop}</Button> : <Button disabled={state === "stopping"} onClick={start}>{audioUrl ? copy.retry : copy.record}</Button>}</div>
    {audioUrl && <div className="mt-6 border-t border-line pt-5"><p className="mb-3 text-sm font-bold text-muted">{copy.playback}</p><audio className="w-full" controls preload="metadata" src={audioUrl} /></div>}
    <p className="mt-5 text-sm leading-6 text-muted">{copy.analysisPending}</p>
  </div>;
}
