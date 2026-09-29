import { SkillLessonList } from "@/components/skill-lesson-list";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { defaultSkillLevel } from "@/modules/onboarding/default-level";

export const dynamic = "force-dynamic";

export default async function ReadingPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  const level = (await searchParams).level ?? await defaultSkillLevel();
  return <SkillLessonList locale={locale} skill="READING" eyebrow={copy.readingEyebrow} title={copy.readingTitle} intro={copy.readingIntro} level={level} basePath="/skills/reading" />;
}
