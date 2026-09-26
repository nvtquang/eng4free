import { SpeakingPractice } from "@/components/speaking-practice";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiSpeakingCopy } from "@/lib/ai-speaking-copy";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";

export default async function IeltsSpeakingPage() {
  const locale = await getLocale();
  const copy = getMessages(locale).ielts;
  return <Section><Eyebrow>{copy.eyebrow} · {copy.speaking}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.speakingTitle}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.speakingDescription}</p><div className="mt-12"><SpeakingPractice copy={getSkillsCopy(locale)} aiCopy={getAiSpeakingCopy(locale)} prompt={copy.speakingPrompt} promptId="ielts-part1-skill" examType="IELTS" /></div></Section>;
}
