import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { getSkillsCopy } from "@/lib/skills-copy";
import { getRequestActor } from "@/modules/auth/request-actor";
import { listLessonCompletionHistory } from "@/modules/lessons/repository";
export default async function ListeningPage() { const locale = await getLocale(); const copy = getSkillsCopy(locale); let history: Awaited<ReturnType<typeof listLessonCompletionHistory>> = []; try { history = await listLessonCompletionHistory((await getRequestActor(false)).actor, "LISTENING"); } catch {} return <Section><Eyebrow>Listening</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{copy.listeningTitle}</h1><p className="mt-4 text-muted">{copy.localOnly}</p><div className="mt-10 grid gap-5 md:grid-cols-2">{[{ title: "Hear the nuance", level: "C1", href: "/learn/c1/nuance" }, { title: "Interpret precise language", level: "C2", href: "/learn/c2/precision" }].map((item) => <Card key={item.href}><p className="text-sm font-bold text-brand">{item.level}</p><h2 className="mt-3 font-serif text-2xl font-bold">{item.title}</h2><Link className="mt-6 inline-flex" href={item.href}><Button>{copy.openExercise}</Button></Link></Card>)}</div><h2 className="mt-12 font-serif text-3xl font-bold">{copy.history}</h2><div className="mt-5 space-y-3">{history.length === 0 && <p className="text-muted">{copy.noHistory}</p>}{history.map((item) => <Card className="p-4" key={item.id}><p className="font-bold">{item.title}</p><p className="text-sm text-muted">{item.rawScore}/{item.totalQuestions} · {new Date(item.completedAt).toLocaleString()}</p></Card>)}</div></Section>; }
