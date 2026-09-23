import { ExamCatalog } from "@/components/exam-catalog";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { listPublicExams } from "@/modules/exams/exam-engine";

export const dynamic = "force-dynamic";

export default async function IeltsPage() {
  const locale = await getLocale();
  const title = locale === "vi" ? "Luyện IELTS" : "IELTS practice";
  const description = locale === "vi" ? "Làm bài Listening và Reading với timer, autosave, kết quả và review." : "Take Listening and Reading practice with a timer, autosave, results and review.";
  let exams: Awaited<ReturnType<typeof listPublicExams>> = [];
  try { exams = await listPublicExams("IELTS"); } catch { /* Local setup may not have a database yet. */ }
  return <Section><Eyebrow>IELTS</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{description}</p><ExamCatalog exams={exams} locale={locale} /></Section>;
}
