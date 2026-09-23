import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentImportReview } from "@/components/content-import-review";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { getAdminActor } from "@/modules/auth/authorization";
import { getAdminEditorData } from "@/modules/content-management/repository";
import { findContentImport } from "@/modules/content-management/content-importer";

export const dynamic = "force-dynamic";

export default async function ContentImportReviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminActor()).isAdmin) notFound();
  const [locale, item, editor] = await Promise.all([getLocale(), findContentImport((await params).id), getAdminEditorData()]);
  if (!item || !editor) notFound();
  return <Section><div className="flex flex-wrap items-center justify-between gap-4"><div><Eyebrow>Content Importer</Eyebrow><h1 className="mt-4 break-words font-serif text-5xl font-bold">{item.fileName}</h1><p className="mt-3 text-muted">{item.fileType} · {item.status}</p></div><Link href="/admin/imports"><Button variant="secondary">{locale === "vi" ? "Tất cả bản nháp" : "All staged imports"}</Button></Link></div><ContentImportReview locale={locale} item={item} units={editor.units} /></Section>;
}
