import { WritingTopics } from "@/components/writing-topics";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiFeedbackCopy } from "@/lib/ai-feedback-copy";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { getWritingCategories } from "@/lib/writing-topics";

export default async function WritingPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  return <Section>
    <Eyebrow>{copy.writingEyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{copy.writingTitle}</h1>
    <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{copy.writingIntro}</p>
    <div className="mt-10"><WritingTopics categories={getWritingCategories(locale)} copy={copy} feedbackCopy={getAiFeedbackCopy(locale)} /></div>
  </Section>;
}
