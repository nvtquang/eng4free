import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminVocabularyEditor } from "@/components/admin-vocabulary-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { createDatabase } from "@/db/client";
import { getLocale } from "@/lib/i18n";
import { getAdminActor } from "@/modules/auth/authorization";
import { getCatalogEntry } from "@/modules/vocabulary/catalog";
import { checkCatalogEntry } from "@/modules/vocabulary/catalog-rules";

export const dynamic = "force-dynamic";

const show = (value: unknown) => value === null || value === undefined ? "—" : typeof value === "string" ? value : JSON.stringify(value);

export default async function AdminVocabularyWordPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminActor()).isAdmin) notFound();
  const db = createDatabase();
  if (!db) notFound();
  const [locale, { id }] = await Promise.all([getLocale(), params]);
  const found = await getCatalogEntry(db, id);
  if (!found) notFound();
  const { entry, revisions } = found;
  const vi = locale === "vi";
  const issues = entry.status === "ARCHIVED" ? [] : checkCatalogEntry(entry);

  return <Section className="max-w-4xl">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><Eyebrow>{vi ? "Từ vựng" : "Vocabulary"} · {entry.partOfSpeech} · {entry.cefrLevel}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{entry.headword}</h1></div>
      <Link href={`/admin/vocabulary?level=${entry.cefrLevel ?? ""}`}><Button variant="secondary">{vi ? "Danh sách" : "Word list"}</Button></Link>
    </div>
    <p className="mt-4 text-sm text-muted"><span className="rounded-full bg-band px-2 py-1 font-bold">{entry.status}</span> {entry.reviewedAt ? `${vi ? "Đã duyệt bởi" : "Reviewed by"} ${entry.reviewedBy} · ${entry.reviewedAt.toISOString().slice(0, 10)}` : vi ? "Chưa duyệt" : "Not reviewed yet"}</p>
    {issues.length > 0 && <Card className="mt-4 border-red-700"><p className="font-bold">{vi ? "Chưa đạt luật chất lượng:" : "Does not pass the rules yet:"}</p><ul className="mt-2 list-disc pl-5 text-sm">{issues.map((issue) => <li key={issue.problem}>{issue.problem}</li>)}</ul></Card>}
    <AdminVocabularyEditor locale={locale} entry={{ id: entry.id, headword: entry.headword, cefrLevel: entry.cefrLevel ?? "", ipa: entry.ipa ?? "", ipaUs: entry.attribution.ipaUs ?? "", meaning: entry.meaning ?? "", example: entry.example ?? "", senseGroups: entry.senseGroups, senseChoice: entry.senseChoice.map(String), meaningByEditor: entry.attribution.sources?.meaning?.name === "English 4 Free editors", archived: entry.status === "ARCHIVED", reviewed: Boolean(entry.reviewedAt) }} />
    <Card className="mt-8">
      <p className="font-bold">{vi ? "Nguồn" : "Sources"}</p>
      <ul className="mt-2 text-sm">{Object.entries(entry.attribution.sources ?? {}).map(([field, source]) => <li key={field}><b>{field}</b>: {source ? <a className="text-brand underline" href={source.url}>{source.name}</a> : "—"} {source?.license ? `(${source.license})` : ""}</li>)}</ul>
    </Card>
    <Card className="mt-6">
      <p className="font-bold">{vi ? "Lịch sử thay đổi" : "Change history"}</p>
      {revisions.length === 0 ? <p className="mt-2 text-sm text-muted">—</p> : <ul className="mt-3 grid gap-3 text-sm">{revisions.map((revision, index) => <li key={index} className="border-b border-line pb-3 last:border-0">
        <p><b>{revision.action}</b> · {revision.changedBy} · {revision.changedAt.toISOString().replace("T", " ").slice(0, 16)}</p>
        <ul className="mt-1 text-xs text-muted">{Object.entries(revision.changes).filter(([field]) => field !== "attribution").map(([field, [before, after]]) => <li key={field}>{field}: {show(before)} → {show(after)}</li>)}</ul>
      </li>)}</ul>}
    </Card>
  </Section>;
}
