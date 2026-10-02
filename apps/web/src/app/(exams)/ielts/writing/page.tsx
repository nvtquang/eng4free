import Link from "next/link";
import { WritingWorkspace } from "@/components/writing-workspace";
import { ContentImage } from "@/components/questions/question-image";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAiFeedbackCopy } from "@/lib/ai-feedback-copy";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { listIeltsTopics } from "@/modules/topics/repository";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "IELTS Writing Task 1 và Task 2", description: "Đề Task 1 có biểu đồ và đề Task 2, viết và nhận nhận xét theo bốn tiêu chí chấm, không phải band chính thức." }, en: { title: "IELTS Writing Task 1 and Task 2", description: "Task 1 prompts with charts and Task 2 essays, with practice feedback on the four marking criteria." } }, "/ielts/writing");
}

const promptCopy = {
  vi: { choose: "Chọn đề", task1: "Task 1", task2: "Task 2", minutes: "phút", words: "từ tối thiểu" },
  en: { choose: "Choose a task", task1: "Task 1", task2: "Task 2", minutes: "minutes", words: "words minimum" }
} as const;

export default async function IeltsWritingPage({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const locale = await getLocale();
  const copy = getMessages(locale).ielts;
  const text = promptCopy[locale];
  const prompts = await listIeltsTopics(["IELTS_WRITING_TASK_1", "IELTS_WRITING_TASK_2"]);
  const { prompt: requested } = await searchParams;
  const selected = prompts.find((item) => item.slug === requested) ?? prompts.find((item) => item.kind === "IELTS_WRITING_TASK_2") ?? prompts[0];
  return <Section>
    <Eyebrow>{copy.eyebrow} · {copy.writing}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.writingTitle}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.writingDescription}</p>
    {prompts.length > 0 && <nav aria-label={text.choose} className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{text.choose}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{prompts.map((item) => <li key={item.slug}><Link aria-current={item.slug === selected?.slug ? "page" : undefined} className={"block rounded-ui border p-3 text-sm leading-6 " + (item.slug === selected?.slug ? "border-brand bg-brand-soft/40 font-bold" : "border-line hover:border-brand")} href={`/ielts/writing?prompt=${item.slug}`}>{item.title}</Link></li>)}</ul>
    </nav>}
    {selected && <div className="mt-8 rounded-ui bg-band/40 p-5">
      <p className="text-sm font-bold text-brand">{selected.kind === "IELTS_WRITING_TASK_1" ? text.task1 : text.task2} · {selected.content.minutes} {text.minutes} · {selected.content.minWords} {text.words}</p>
      <p className="mt-2 leading-7 text-muted">{selected.content.instructions}</p>
      {selected.content.image && <div className="mt-4"><ContentImage image={selected.content.image} /></div>}
    </div>}
    {selected && <div className="mt-8">
      <WritingWorkspace key={selected.id} copy={getSkillsCopy(locale)} feedbackCopy={getAiFeedbackCopy(locale)} prompt={selected.content.prompt} task={{ topicId: selected.id, taskType: selected.kind === "IELTS_WRITING_TASK_1" ? "IELTS_TASK_1" : "IELTS_TASK_2", examType: "IELTS" }} />
    </div>}
  </Section>;
}
