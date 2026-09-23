import { ExamCatalog } from "@/components/exam-catalog";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { listPublicExams } from "@/modules/exams/exam-engine";

export const dynamic = "force-dynamic";

export default async function ToeicPage() {
  const locale = await getLocale();
  const title = locale === "vi" ? "Luyện TOEIC" : "TOEIC practice";
  const description = locale === "vi" ? "Luyện từng Part, mini test và full mock. Đáp án được tự động lưu trên server." : "Practice individual parts, mini tests and full mocks. Answers autosave to the server.";
  let exams: Awaited<ReturnType<typeof listPublicExams>> = [];
  try { exams = await listPublicExams("TOEIC"); } catch { /* Local setup may not have a database yet. */ }
  return <Section><Eyebrow>TOEIC</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{description}</p><ExamCatalog exams={exams} locale={locale} /></Section>;
}
