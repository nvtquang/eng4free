import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { examModeLabel, getExamCopy } from "@/lib/exam-copy";

type CatalogExam = { slug: string; title: string; mode: string; durationSeconds: number };

export function ExamCatalog({ exams, locale }: { exams: CatalogExam[]; locale: "vi" | "en" }) {
  const examCopy = getExamCopy(locale);
  const copy = locale === "vi"
    ? { empty: "Chưa có đề nào.", start: "Bắt đầu làm bài", duration: "Thời lượng", minutes: "phút" }
    : { empty: "No exams yet.", start: "Start attempt", duration: "Duration", minutes: "min" };
  if (!exams.length) return <Card className="mt-8"><p className="text-muted">{copy.empty}</p></Card>;
  return <div className="mt-8 grid gap-5 lg:grid-cols-2">{exams.map((exam) => <Card className="flex min-h-52 flex-col" key={exam.slug}><p className="text-sm font-bold text-brand">{examModeLabel(examCopy, exam.mode)}</p><h2 className="mt-4 font-serif text-3xl font-bold">{exam.title}</h2><p className="mt-3 flex-1 text-sm text-muted">{copy.duration}: {Math.ceil(exam.durationSeconds / 60)} {copy.minutes}</p><Link className="mt-6 inline-flex" href={"/exams/" + exam.slug}><Button>{copy.start}</Button></Link></Card>)}</div>;
}
