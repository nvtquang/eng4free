import { WritingWorkspace } from "@/components/writing-workspace";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiFeedbackCopy } from "@/lib/ai-feedback-copy";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";

export default async function WritingPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const prompt = locale === "vi" ? "Write in English: Describe one change that would improve your neighbourhood." : "Describe one change that would improve your neighbourhood.";
  return <Section><Eyebrow>{copy.writingEyebrow}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{copy.writingTitle}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{copy.writingIntro}</p><div className="mt-10"><WritingWorkspace copy={copy} feedbackCopy={getAiFeedbackCopy(locale)} prompt={prompt} /></div></Section>;
}
