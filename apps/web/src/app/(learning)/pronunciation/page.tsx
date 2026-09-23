import { AudioRecorder } from "@/components/audio-recorder";
import { PronunciationListen } from "@/components/pronunciation-listen";
import { SpeechServiceStatus } from "@/components/speech-service-status";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { ipaSounds, minimalPairs, shadowingItems } from "@/modules/pronunciation/content";

export default async function PronunciationPage() { const locale = await getLocale(); const copy = getMessages(locale).pronunciation; const shadowing = shadowingItems[0]; return <Section><Eyebrow>{copy.eyebrow}</Eyebrow><h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold tracking-tight sm:text-6xl">{copy.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{copy.description}</p><SpeechServiceStatus copy={copy} /><section className="mt-16"><h2 className="font-serif text-3xl font-bold">{copy.ipa}</h2><PronunciationListen locale={locale} sounds={ipaSounds} pairs={minimalPairs} /></section><section className="mt-16 grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><div><h2 className="font-serif text-3xl font-bold">{copy.shadowing}</h2><p className="mt-4 leading-7 text-muted">{shadowing.transcript[locale]}</p><Card className="mt-6"><p className="text-sm font-bold text-brand">{copy.target}</p><blockquote className="mt-4 font-serif text-3xl leading-tight">“{shadowing.targetText}”</blockquote><p className="mt-5 text-sm text-muted">{copy.tip}: {shadowing.focusSounds.join(" · ")}</p></Card></div><AudioRecorder copy={copy} targetText={shadowing.targetText} /></section></Section>; }
