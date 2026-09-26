"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { heading: string; playbackText?: string; mediaUrl?: string; transcript: string; sourceLabel: string; locale: "vi" | "en" };
const copy = {
  vi: { play: "Phát audio demo", stop: "Dừng", reveal: "Hiện transcript", hide: "Ẩn transcript", unavailable: "Trình duyệt này chưa hỗ trợ giọng đọc local.", playing: "Đang phát audio demo…", transcript: "Transcript" },
  en: { play: "Play demo audio", stop: "Stop", reveal: "Show transcript", hide: "Hide transcript", unavailable: "This browser does not support local speech playback.", playing: "Playing demo audio…", transcript: "Transcript" }
} as const;

export function LocalListeningPlayer({ heading, playbackText, mediaUrl, transcript, sourceLabel, locale }: Props) {
  const text = copy[locale];
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  // A recording that fails to load falls back to browser speech when a script is available.
  const [audioFailed, setAudioFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    setSpeechSupported("speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
    // The server-rendered <audio> may fail before hydration attaches onError.
    if (audioRef.current?.error || audioRef.current?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) setAudioFailed(true);
    return () => window.speechSynthesis?.cancel();
  }, []);
  function play() {
    if (!speechSupported || !playbackText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(playbackText);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  }
  function stop() { window.speechSynthesis.cancel(); setPlaying(false); }
  return <section className="mt-8 rounded-ui border border-line bg-band/30 p-5">
    <p className="font-serif text-2xl font-bold">{heading}</p><p className="mt-2 text-xs text-muted">{sourceLabel}</p>
    {mediaUrl && !audioFailed ? <audio ref={audioRef} className="mt-5 w-full" controls preload="metadata" src={mediaUrl} onError={() => setAudioFailed(true)} /> : speechSupported && playbackText ? <div className="mt-5 flex flex-wrap gap-3">{playing ? <Button variant="secondary" onClick={stop}>{text.stop}</Button> : <Button onClick={play}>{text.play}</Button>}</div> : speechSupported === false ? <p className="mt-4 text-sm text-red-700">{text.unavailable}</p> : null}
    <Button className="mt-4" variant="secondary" onClick={() => setRevealed((value) => !value)}>{revealed ? text.hide : text.reveal}</Button>
    {playing && <p className="mt-4 text-sm text-brand">{text.playing}</p>}
    {revealed && <div className="mt-5 border-t border-line pt-5"><p className="text-sm font-bold text-brand">{text.transcript}</p><p className="mt-2 whitespace-pre-line leading-7 text-muted">{transcript}</p></div>}
  </section>;
}
