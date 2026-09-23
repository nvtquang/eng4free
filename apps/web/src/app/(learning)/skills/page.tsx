import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
const skills = [{ slug: "listening", vi: "Nghe", en: "Listening" }, { slug: "speaking", vi: "Nói", en: "Speaking" }, { slug: "reading", vi: "Đọc", en: "Reading" }, { slug: "writing", vi: "Viết", en: "Writing" }];
export default async function SkillsPage() { const locale = await getLocale(); return <Section><Eyebrow>{locale === "vi" ? "Bốn kỹ năng" : "Four skills"}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{locale === "vi" ? "Luyện tập theo kỹ năng" : "Practice by skill"}</h1><div className="mt-10 grid gap-5 sm:grid-cols-2">{skills.map((skill) => <Link href={`/skills/${skill.slug}`} key={skill.slug}><Card className="transition hover:border-brand"><h2 className="font-serif text-3xl font-bold">{skill[locale]}</h2></Card></Link>)}</div></Section>; }
