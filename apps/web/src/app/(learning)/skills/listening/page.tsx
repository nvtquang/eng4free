import { SkillLessonList } from "@/components/skill-lesson-list";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { defaultSkillLevel } from "@/modules/onboarding/default-level";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Luyện nghe tiếng Anh theo trình độ", description: "Bài nghe A1–C2 có ghi âm nhiều giọng, câu hỏi và lời giải." }, en: { title: "English listening practice by level", description: "A1–C2 listening lessons with multi-voice recordings, questions and explanations." } }, "/skills/listening");
}

export const dynamic = "force-dynamic";

export default async function ListeningPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const level = (await searchParams).level ?? await defaultSkillLevel("LISTENING");
  return <SkillLessonList locale={locale} skill="LISTENING" eyebrow={copy.listeningEyebrow} title={copy.listeningTitle} intro={copy.listeningIntro} level={level} basePath="/skills/listening" />;
}
