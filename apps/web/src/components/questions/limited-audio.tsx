"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  /** Generated recording; preferred whenever it exists. */
  url?: string;
  /** Script for browser speech, sent only when no recording exists. */
  text?: string;
  limit: number;
  labels: { play: string; playing: string; unavailable: string };
  lang?: string;
  rate?: number;
  variant?: "primary" | "secondary";
};

/** Exam-style player: a fixed number of plays, no seeking; browser speech is the fallback. */
export function LimitedAudio({ url, text, limit, labels, lang = "en-US", rate = 0.9, variant = "primary" }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);

  useEffect(() => {
    setSpeechReady("speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
    const audio = audioRef.current;
    // The server-rendered <audio> may fail before hydration attaches onError.
    if (audio?.error || audio?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) setFailed(true);
    return () => { audio?.pause(); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);

  const useRecording = Boolean(url) && !failed;
  const canSpeak = Boolean(text) && speechReady;
  const available = useRecording || canSpeak;

  function speak() {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.cancel();
    setPlaying(true);
    setPlays((value) => value + 1);
    window.speechSynthesis.speak(utterance);
  }

  function play() {
    if (playing || plays >= limit) return;
    const audio = audioRef.current;
    if (useRecording && audio) {
      audio.currentTime = 0;
      setProgress(0);
      audio.play().then(() => { setPlaying(true); setPlays((value) => value + 1); }).catch(() => { setFailed(true); if (canSpeak) speak(); });
      return;
    }
    if (canSpeak) speak();
  }

  return <div className="flex flex-wrap items-center gap-3">
    {url && <audio ref={audioRef} preload="auto" src={url} onTimeUpdate={(event) => { const { currentTime, duration } = event.currentTarget; if (duration) setProgress(currentTime / duration); }} onEnded={() => { setPlaying(false); setProgress(1); }} onError={() => { setFailed(true); setPlaying(false); }} />}
    <Button disabled={!available || playing || plays >= limit} variant={variant} onClick={play}>{playing ? labels.playing : `${labels.play} (${plays}/${limit})`}</Button>
    {useRecording && (playing || progress > 0) && <div aria-hidden className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-brand transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} /></div>}
    {!available && (failed || speechReady || !url) && <p className="text-sm text-red-700">{labels.unavailable}</p>}
  </div>;
}
