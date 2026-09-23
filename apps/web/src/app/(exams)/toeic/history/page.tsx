import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { getRequestActor } from "@/modules/auth/request-actor";
import { listAttemptHistory } from "@/modules/attempts/history";
import type { AttemptHistoryItem } from "@/modules/attempts/history";
export default async function ToeicHistoryPage() { let history: AttemptHistoryItem[] = []; try { const { actor } = await getRequestActor(false); history = await listAttemptHistory(actor); } catch { /* No guest attempt yet. */ } return <Section className="max-w-4xl"><Eyebrow>TOEIC</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">Practice history</h1><div className="mt-10 grid gap-4">{history.map((attempt) => <Card key={attempt.id}><p className="font-serif text-2xl font-bold">{attempt.examTitle}</p><p className="mt-2 text-muted">{attempt.rawScore ?? 0}/{attempt.totalQuestions} · {attempt.submittedAt?.toLocaleDateString() ?? "In progress"}</p></Card>)}{history.length === 0 && <Card><p>No completed TOEIC attempts yet.</p><Link className="mt-5 inline-flex" href="/toeic/practice/part-5"><Button>Start Part 5</Button></Link></Card>}</div></Section>; }
