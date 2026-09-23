import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentImporter } from "@/components/content-importer";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { getAdminActor } from "@/modules/auth/authorization";
import { listContentImports } from "@/modules/content-management/content-importer";

export const dynamic = "force-dynamic";

export default async function ContentImportsPage() {
  if (!(await getAdminActor()).isAdmin) notFound();
  const [locale, imports] = await Promise.all([getLocale(), listContentImports()]);
  return <Section><div className="flex flex-wrap items-center justify-between gap-4"><div><Eyebrow>Admin CMS</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">Content Importer</h1></div><Link href="/admin"><Button variant="secondary">{locale === "vi" ? "Quay lại CMS" : "Back to CMS"}</Button></Link></div>{imports === null ? <p className="mt-8 text-muted">DATABASE_URL is required.</p> : <ContentImporter locale={locale} imports={imports} />}</Section>;
}
