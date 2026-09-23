import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/ui/level-badge";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";

const topics = [{ level: "A2", title: { vi: "Kế hoạch với be going to", en: "Plans with be going to" }, description: { vi: "Diễn đạt dự định đã quyết định trước đó.", en: "Talk about plans decided before speaking." }, href: "/learn/a2/plans" }, { level: "B2", title: { vi: "Liên kết ý trong lập luận", en: "Linking ideas in an argument" }, description: { vi: "Dùng however, therefore và for example rõ ràng.", en: "Use however, therefore and for example precisely." }, href: "/learn/b2/arguments" }];
export default async function GrammarPage() { const locale = await getLocale(); const vi = locale === "vi"; return <Section><Eyebrow>{vi ? "Ngữ pháp" : "Grammar"}</Eyebrow><h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold tracking-tight sm:text-6xl">{vi ? "Ngữ pháp theo trình độ" : "Grammar by level"}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{vi ? "Các bài demo này được seed từ content pack local, có giải thích và bài tập chấm ở server." : "These local-content-pack demos include an explanation and server-scored practice."}</p><div className="mt-12 grid gap-5 md:grid-cols-2">{topics.map((topic) => <Card key={topic.level}><LevelBadge>{topic.level}</LevelBadge><h2 className="mt-5 font-serif text-3xl font-bold">{topic.title[locale]}</h2><p className="mt-4 leading-7 text-muted">{topic.description[locale]}</p><Link className="mt-7 inline-flex" href={topic.href}><Button>{vi ? "Học bài này" : "Open lesson"}</Button></Link></Card>)}</div></Section>; }
