import { WritingWorkspace } from "@/components/writing-workspace";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiFeedbackCopy } from "@/lib/ai-feedback-copy";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";

export default async function IeltsWritingPage() {
  const locale = await getLocale();
  const copy = getMessages(locale).ielts;
  return <Section><Eyebrow>{copy.eyebrow} · {copy.writing}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.writingTitle}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.writingDescription}</p><div className="mt-12"><WritingWorkspace copy={getSkillsCopy(locale)} feedbackCopy={getAiFeedbackCopy(locale)} prompt={copy.writingPrompt} task={{ promptId: "technology-social-task-2", taskType: "IELTS_TASK_2", examType: "IELTS" }} /></div></Section>;
}
