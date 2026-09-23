import { SpeakingPractice } from "@/components/speaking-practice";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
export default async function SpeakingPage() { const locale = await getLocale(); const copy = getSkillsCopy(locale); const prompt = locale === "vi" ? "Nói bằng tiếng Anh: hãy kể về một kỹ năng hữu ích bạn đã học và cách bạn học kỹ năng đó." : "Talk about a useful skill you learned and explain how you learned it."; return <Section><Eyebrow>{locale === "vi" ? "Nói" : "Speaking"}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{copy.speakingTitle}</h1><p className="mt-4 text-muted">{copy.localOnly}</p><div className="mt-10"><SpeakingPractice copy={copy} prompt={prompt} /></div></Section>; }
