import { notFound } from "next/navigation";
import { ExamReview } from "@/components/exam-review";
import { Eyebrow, Section } from "@/components/ui/section";
import { examModeLabel, getExamCopy } from "@/lib/exam-copy";
import { getLocale } from "@/lib/i18n";
import { getRequestActor } from "@/modules/auth/request-actor";
import { getExamAttemptReview } from "@/modules/exams/exam-engine";

export const dynamic = "force-dynamic";

export default async function ExamResultPage({ params }: { params: Promise<{ slug: string; attemptId: string }> }) {
  const { slug, attemptId } = await params;
  try {
    const [{ actor }, locale] = await Promise.all([getRequestActor(false), getLocale()]);
    const review = await getExamAttemptReview(slug, attemptId, actor);
    if (!review) notFound();
    const copy = getExamCopy(locale);
    return <Section className="max-w-5xl"><Eyebrow>{review.exam.type} · {examModeLabel(copy, review.exam.mode)}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{review.exam.title}</h1><ExamReview exam={review.exam} result={{ attempt: review.attempt, results: review.results }} copy={copy} /></Section>;
  } catch {
    notFound();
  }
}
