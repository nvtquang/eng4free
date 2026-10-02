import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SkillLessonList } from "@/components/skill-lesson-list";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { countOpenMistakes } from "@/modules/mistakes/repository";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Ngữ pháp tiếng Anh theo trình độ", description: "Các chủ đề ngữ pháp từ A1 đến C2, giải thích bằng tiếng Việt, có ví dụ, lỗi người Việt hay gặp và bài tập có lời giải." }, en: { title: "English grammar by level", description: "Grammar topics from A1 to C2 with explanations, examples, common mistakes and practice questions with answers." } }, "/grammar");
}

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const mistakesCopy = getMessages(locale).mistakes;
  let wrongCount = 0;
  try { wrongCount = await countOpenMistakes((await getRequestLearner(false)).learner, "GRAMMAR"); } catch { /* No learner cookie yet. */ }
  const banner = wrongCount > 0
    ? <Link href="/mistakes?skill=GRAMMAR" className="mx-auto block w-full max-w-7xl px-5 sm:px-8"><Card className="flex flex-wrap items-center justify-between gap-3 border-brand bg-brand-soft transition hover:-translate-y-0.5"><div><p className="font-serif text-xl font-bold">{mistakesCopy.title}</p><p className="mt-1 text-sm text-muted">{mistakesCopy.count.replace("{count}", String(wrongCount))}</p></div><span className="text-sm font-bold text-brand">{mistakesCopy.practice} →</span></Card></Link>
    : null;
  return <>
    {banner}
    <SkillLessonList locale={locale} skill="GRAMMAR" eyebrow={copy.grammarEyebrow} title={copy.grammarTitle} intro={copy.grammarIntro} />
  </>;
}
