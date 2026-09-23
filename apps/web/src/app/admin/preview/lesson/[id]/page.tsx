import { notFound } from "next/navigation";
import { LessonRunner } from "@/components/lesson-runner";
import { Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { getAdminActor } from "@/modules/auth/authorization";
import { findLessonForPreview } from "@/modules/lessons/repository";

export const dynamic = "force-dynamic";

export default async function LessonPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminActor()).isAdmin) notFound();
  const lesson = await findLessonForPreview((await params).id);
  if (!lesson) notFound();
  const locale = await getLocale();
  const note = locale === "vi"
    ? "Xem trước trong CMS · chỉ có thể nộp câu luyện tập sau khi xuất bản."
    : "CMS preview · practice submission is available only after publishing.";
  return <Section className="max-w-4xl"><p className="rounded-ui bg-amber-100 p-3 text-sm font-bold text-amber-950">{note}</p><h1 className="mt-6 font-serif text-5xl font-bold">{lesson.title}</h1><LessonRunner lessonId={lesson.id} blocks={lesson.blocks} locale={locale} /></Section>;
}
