import { notFound } from "next/navigation";
import { ExamRunner } from "@/components/exam-runner";
import { Eyebrow, Section } from "@/components/ui/section";
import { examModeLabel, getExamCopy } from "@/lib/exam-copy";
import { getLocale } from "@/lib/i18n";
import { getPublicExamBySlug } from "@/modules/exams/exam-engine";
import { pageMetadata } from "@/lib/metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = await getPublicExamBySlug(slug).catch(() => null);
  if (!exam) return { title: "404", robots: { index: false } };
  const minutes = Math.round(exam.durationSeconds / 60);
  return pageMetadata({
    vi: { title: exam.title, description: `Đề luyện ${exam.type} ${exam.totalQuestions} câu, ${minutes} phút. Đáp án tự lưu, nộp bài có điểm ước tính, kết quả theo phần và lời giải từng câu.` },
    en: { title: exam.title, description: `A ${exam.totalQuestions}-question ${exam.type} practice test, ${minutes} minutes. Answers save as you go; results include an estimated score, results by part and an explanation for every question.` }
  }, `/exams/${slug}`);
}
export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const copy = getExamCopy(await getLocale()); let exam; try { exam = await getPublicExamBySlug(slug); } catch { exam = null; } if (!exam) notFound(); return <Section className="max-w-5xl"><Eyebrow>{exam.type} · {examModeLabel(copy, exam.mode)}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{exam.title}</h1><p className="mt-4 text-muted">{copy.intro}</p><ExamRunner copy={copy} slug={slug} /></Section>; }
