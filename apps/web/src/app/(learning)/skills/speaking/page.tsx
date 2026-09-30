import { SpeakingTopics } from "@/components/speaking-topics";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiSpeakingCopy } from "@/lib/ai-speaking-copy";
import { EmptyState } from "@/components/ui/empty-state";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { listTopicCategories } from "@/modules/topics/repository";

export default async function SpeakingPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const aiCopy = getAiSpeakingCopy(locale);
  const categories = await listTopicCategories("FREE_SPEAKING", locale);

  return (
    <Section>
      <Eyebrow>{copy.speakingEyebrow}</Eyebrow>
      <h1 className="mt-4 font-serif text-5xl font-bold">{copy.speakingTitle}</h1>
      <p className="mt-4 text-muted">{aiCopy.description}</p>
      <div className="mt-10">
        {categories.length ? <SpeakingTopics categories={categories} copy={copy} aiCopy={aiCopy} /> : <EmptyState title={getMessages(locale).operability.noData} />}
      </div>
    </Section>
  );
}
