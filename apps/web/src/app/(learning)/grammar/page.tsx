import { SkillLessonList } from "@/components/skill-lesson-list";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";

export default async function GrammarPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  return <SkillLessonList locale={locale} skill="GRAMMAR" eyebrow={copy.grammarEyebrow} title={copy.grammarTitle} intro={copy.grammarIntro} />;
}
