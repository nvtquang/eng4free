import { SkillLessonList } from "@/components/skill-lesson-list";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";

export default async function ReadingPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  return <SkillLessonList locale={locale} skill="READING" eyebrow={copy.readingEyebrow} title={copy.readingTitle} intro={copy.readingIntro} />;
}
