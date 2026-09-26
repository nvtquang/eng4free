import { SkillLessonList } from "@/components/skill-lesson-list";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";

export default async function ListeningPage() {
  const locale = await getLocale();
  const copy = getSkillsCopy(locale);
  return <SkillLessonList locale={locale} skill="LISTENING" eyebrow={copy.listeningEyebrow} title={copy.listeningTitle} intro={copy.listeningIntro} />;
}
