import { notFound } from "next/navigation";
import { ExamRunner } from "@/components/exam-runner";
import { Eyebrow, Section } from "@/components/ui/section";
import { getExamCopy } from "@/lib/exam-copy";
import { getLocale } from "@/lib/i18n";
import { getPublicExamBySlug } from "@/modules/exams/exam-engine";
export const dynamic = "force-dynamic";
export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const copy = getExamCopy(await getLocale()); let exam; try { exam = await getPublicExamBySlug(slug); } catch { exam = null; } if (!exam) notFound(); return <Section className="max-w-5xl"><Eyebrow>{exam.type} · {exam.mode}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{exam.title}</h1><p className="mt-4 text-muted">{copy.localDemo}</p><ExamRunner copy={copy} slug={slug} /></Section>; }
