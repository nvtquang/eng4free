import { SkillLessonList } from "@/components/skill-lesson-list";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { defaultSkillLevel } from "@/modules/onboarding/default-level";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Luyện đọc tiếng Anh theo trình độ", description: "Bài đọc A1–C2 theo chủ đề quen thuộc, có câu hỏi đọc hiểu và lời giải." }, en: { title: "English reading practice by level", description: "A1–C2 reading passages on everyday topics with comprehension questions and explanations." } }, "/skills/reading");
}

export const dynamic = "force-dynamic";

export default async function ReadingPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const level = (await searchParams).level ?? await defaultSkillLevel("READING");
  return <SkillLessonList locale={locale} skill="READING" eyebrow={copy.readingEyebrow} title={copy.readingTitle} intro={copy.readingIntro} level={level} basePath="/skills/reading" />;
}
