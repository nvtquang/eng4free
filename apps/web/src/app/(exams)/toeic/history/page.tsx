import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { getRequestActor } from "@/modules/auth/request-actor";
import { listAttemptHistory } from "@/modules/attempts/history";
import type { AttemptHistoryItem } from "@/modules/attempts/history";

export const dynamic = "force-dynamic";

export default async function ExamHistoryPage() {
  const locale = await getLocale();
  const copy = locale === "vi"
    ? { eyebrow: "TOEIC · IELTS", title: "Lịch sử làm đề", expired: "Hết giờ", empty: "Bạn chưa hoàn thành đề nào.", toeic: "Luyện TOEIC", ielts: "Luyện IELTS", review: "Xem lại" }
    : { eyebrow: "TOEIC · IELTS", title: "Exam history", expired: "Time expired", empty: "You have not completed an exam yet.", toeic: "TOEIC practice", ielts: "IELTS practice", review: "Review" };
  let history: AttemptHistoryItem[] = [];
  try { const { actor } = await getRequestActor(false); history = await listAttemptHistory(actor); } catch { /* No guest attempt yet. */ }
  return <Section className="max-w-4xl">
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{copy.title}</h1>
    <div className="mt-10 grid gap-4">
      {history.map((attempt) => <Card className="flex flex-wrap items-center justify-between gap-4" key={attempt.id}><div><p className="font-serif text-2xl font-bold">{attempt.examTitle}</p><p className="mt-2 text-muted">{attempt.rawScore ?? 0}/{attempt.totalQuestions} · {attempt.status === "EXPIRED" ? copy.expired + " · " : ""}{attempt.submittedAt?.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}</p></div><Link href={`/exams/${attempt.examSlug}/results/${attempt.id}`}><Button variant="secondary">{copy.review}</Button></Link></Card>)}
      {history.length === 0 && <Card><p>{copy.empty}</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/toeic"><Button>{copy.toeic}</Button></Link><Link href="/ielts"><Button variant="secondary">{copy.ielts}</Button></Link></div></Card>}
    </div>
  </Section>;
}
