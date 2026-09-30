import { WritingTopics } from "@/components/writing-topics";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiFeedbackCopy } from "@/lib/ai-feedback-copy";
import { EmptyState } from "@/components/ui/empty-state";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { listTopicCategories } from "@/modules/topics/repository";

export default async function WritingPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const categories = await listTopicCategories("FREE_WRITING", locale);
  return <Section>
    <Eyebrow>{copy.writingEyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{copy.writingTitle}</h1>
    <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{copy.writingIntro}</p>
    <div className="mt-10">{categories.length ? <WritingTopics categories={categories} copy={copy} feedbackCopy={getAiFeedbackCopy(locale)} /> : <EmptyState title={getMessages(locale).operability.noData} />}</div>
  </Section>;
}
