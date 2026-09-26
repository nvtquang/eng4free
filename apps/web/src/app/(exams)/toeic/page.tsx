import Link from "next/link";
import { ExamCatalog } from "@/components/exam-catalog";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { listPublicExams } from "@/modules/exams/exam-engine";

export const dynamic = "force-dynamic";

export default async function ToeicPage() {
  const locale = await getLocale();
  const title = locale === "vi" ? "Luyện TOEIC" : "TOEIC practice";
  const description = locale === "vi" ? "Luyện từng Part, làm mini test và thi thử. Đáp án được tự động lưu, bạn có thể dừng và làm tiếp bất cứ lúc nào." : "Practise individual parts, take mini tests and mock tests. Answers save automatically, so you can stop and continue at any time.";
  const history = locale === "vi" ? "Lịch sử làm đề" : "Exam history";
  let exams: Awaited<ReturnType<typeof listPublicExams>> = [];
  try { exams = await listPublicExams("TOEIC"); } catch { /* Local setup may not have a database yet. */ }
  return <Section><Eyebrow>TOEIC</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{description}</p><Link className="mt-6 inline-flex" href="/toeic/history"><Button variant="secondary">{history}</Button></Link><ExamCatalog exams={exams} locale={locale} /></Section>;
}
