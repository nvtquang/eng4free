import { SpeakingTopics } from "@/components/speaking-topics";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiSpeakingCopy } from "@/lib/ai-speaking-copy";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { getSpeakingCategories } from "@/lib/speaking-topics";

export default async function SpeakingPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const aiCopy = getAiSpeakingCopy(locale);
  const categories = getSpeakingCategories(locale);

  return (
    <Section>
      <Eyebrow>{copy.speakingEyebrow}</Eyebrow>
      <h1 className="mt-4 font-serif text-5xl font-bold">{copy.speakingTitle}</h1>
      <p className="mt-4 text-muted">{aiCopy.description}</p>
      <div className="mt-10">
        <SpeakingTopics categories={categories} copy={copy} aiCopy={aiCopy} />
      </div>
    </Section>
  );
}
