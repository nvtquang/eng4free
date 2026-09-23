"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { IpaSound, MinimalPair } from "@/modules/pronunciation/content";

const copy = {
  vi: {
    listen: "Nghe mẫu", stop: "Dừng", pair: "Nghe cặp âm", unavailable: "Trình duyệt này chưa hỗ trợ phát âm mẫu. Hãy dùng Chrome, Edge hoặc Safari bản mới.",
    vowels: "Nguyên âm và nguyên âm đôi", consonants: "Phụ âm", chartHelp: "Bấm Nghe mẫu để phát từ khóa tiếng Anh bằng giọng đọc của trình duyệt."
  },
  en: {
    listen: "Listen", stop: "Stop", pair: "Listen to the pair", unavailable: "This browser cannot play sample speech. Please use a current version of Chrome, Edge, or Safari.",
    vowels: "Vowels and diphthongs", consonants: "Consonants", chartHelp: "Select Listen to hear the English keyword through your browser speech voice."
  }
} as const;

export function PronunciationListen({ locale, sounds, pairs }: { locale: "vi" | "en"; sounds: IpaSound[]; pairs: MinimalPair[] }) {
  const text = copy[locale];
  const [playing, setPlaying] = useState<string | null>(null);
  // Browser capabilities are detected after hydration. Detecting them while SSR
  // rendered the page left some browsers permanently in the unsupported state.
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const vowelSounds = useMemo(() => sounds.filter((sound) => sound.kind === "vowel"), [sounds]);
  const consonantSounds = useMemo(() => sounds.filter((sound) => sound.kind === "consonant"), [sounds]);

  useEffect(() => {
    setSpeechSupported("speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
    return () => window.speechSynthesis?.cancel();
  }, []);

  function stop() { window.speechSynthesis?.cancel(); setPlaying(null); }
  function play(id: string, phrase: string) {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "en-US";
    utterance.rate = 0.72;
    utterance.onend = () => setPlaying((current) => current === id ? null : current);
    utterance.onerror = () => setPlaying(null);
    setPlaying(id);
    window.speechSynthesis.speak(utterance);
  }
  function SoundGrid({ title, items }: { title: string; items: IpaSound[] }) {
    return <section className="mt-8" aria-label={title}>
      <h3 className="font-serif text-2xl font-bold">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((sound) => <Card className="p-5" key={sound.symbol}>
          <p className="font-serif text-4xl font-bold text-brand">{sound.symbol}</p>
          <p className="mt-3 font-bold">{sound.keyword}</p>
          <p className="mt-1 text-sm text-muted">{sound.examples.join(" · ")}</p>
          {speechSupported && <Button className="mt-5 w-full" variant="secondary" onClick={() => playing === sound.symbol ? stop() : play(sound.symbol, `${sound.keyword}. ${sound.examples.join(". ")}.`)}>{playing === sound.symbol ? text.stop : text.listen}</Button>}
        </Card>)}
      </div>
    </section>;
  }
  return <>
    <p className="mt-4 text-sm leading-6 text-muted">{text.chartHelp}</p>
    {speechSupported === false && <p className="mt-4 text-sm text-red-700" role="alert">{text.unavailable}</p>}
    <SoundGrid title={text.vowels} items={vowelSounds} />
    <SoundGrid title={text.consonants} items={consonantSounds} />
    <section className="mt-10" aria-label="Minimal pairs"><div className="grid gap-4 lg:grid-cols-3">
      {pairs.map((pair) => <Card key={pair.id}>
        <p className="font-serif text-3xl font-bold">{pair.first} <span className="text-muted">/</span> {pair.second}</p>
        <p className="mt-3 text-sm font-bold text-brand">{pair.contrast.join(" ↔ ")}</p>
        <p className="mt-4 leading-7 text-muted">{pair.tip[locale]}</p>
        {speechSupported && <Button className="mt-5" variant="secondary" onClick={() => playing === pair.id ? stop() : play(pair.id, `${pair.first}. ${pair.second}. ${pair.first}. ${pair.second}.`)}>{playing === pair.id ? text.stop : text.pair}</Button>}
      </Card>)}
    </div></section>
  </>;
}
