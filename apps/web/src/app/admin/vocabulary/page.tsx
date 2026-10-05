import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { createDatabase } from "@/db/client";
import { getLocale } from "@/lib/i18n";
import { getAdminActor } from "@/modules/auth/authorization";
import { catalogSummary, listCatalog, type CatalogFilter } from "@/modules/vocabulary/catalog";
import { LEVELS } from "@/modules/vocabulary/catalog-rules";

export const dynamic = "force-dynamic";

const copy = {
  vi: { title: "Từ vựng", back: "Quay lại CMS", level: "Level", status: "Trạng thái", reviewed: "Đã duyệt", search: "Tìm từ hoặc nghĩa", filter: "Lọc", all: "Tất cả", yes: "Rồi", no: "Chưa", total: "từ", none: "Không có từ nào khớp bộ lọc.", noExample: "(chưa có ví dụ)", prev: "Trang trước", next: "Trang sau", summary: "Theo level: đã publish / bản nháp chưa duyệt", help: "Từ vựng chỉ lưu trong PostgreSQL. Sửa một từ ở đây sẽ ghi lịch sử; từ đã publish đổi ngay cho người học." },
  en: { title: "Vocabulary", back: "Back to CMS", level: "Level", status: "Status", reviewed: "Reviewed", search: "Search a word or meaning", filter: "Filter", all: "All", yes: "Yes", no: "No", total: "words", none: "No word matches the filter.", noExample: "(no example yet)", prev: "Previous", next: "Next", summary: "Per level: published / unreviewed drafts", help: "Vocabulary lives only in PostgreSQL. Every edit here is logged; a published word changes for learners at once." }
} as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const fieldClass = "mt-1 rounded-ui border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand";

export default async function AdminVocabularyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!(await getAdminActor()).isAdmin) notFound();
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const text = copy[locale];
  const db = createDatabase();
  if (!db) return <Section><p className="text-muted">DATABASE_URL is required.</p></Section>;
  const filter: CatalogFilter = {
    level: params.level, q: params.q, page: Number(params.page) || 1,
    status: STATUSES.find((status) => status === params.status),
    reviewed: params.reviewed === "yes" || params.reviewed === "no" ? params.reviewed : undefined
  };
  const [{ rows, total, page, pageSize }, summary] = await Promise.all([listCatalog(db, filter), catalogSummary(db)]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = (overrides: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ level: filter.level, status: filter.status, reviewed: filter.reviewed, q: filter.q, page, ...overrides })) if (value !== undefined && value !== "") query.set(key, String(value));
    return `/admin/vocabulary?${query.toString()}`;
  };
  const perLevel = LEVELS.map((level) => ({
    level,
    published: summary.filter((row) => row.level === level && row.status === "PUBLISHED").reduce((sum, row) => sum + row.count, 0),
    waiting: summary.filter((row) => row.level === level && row.status === "DRAFT" && !row.reviewed).reduce((sum, row) => sum + row.count, 0)
  }));

  return <Section>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Eyebrow>Admin CMS</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{text.title}</h1></div><Link href="/admin"><Button variant="secondary">{text.back}</Button></Link></div>
    <p className="mt-4 max-w-3xl text-muted">{text.help}</p>
    <Card className="mt-6"><p className="text-sm font-bold">{text.summary}</p><div className="mt-3 flex flex-wrap gap-3 text-sm">{perLevel.map((row) => <Link key={row.level} href={link({ level: row.level, page: 1 })} className="rounded-full bg-band px-3 py-1"><b>{row.level}</b> {row.published} / {row.waiting}</Link>)}</div></Card>
    <form className="mt-6 flex flex-wrap items-end gap-3" action="/admin/vocabulary">
      <label className="text-sm font-bold">{text.level}<br /><select name="level" defaultValue={filter.level ?? ""} className={fieldClass}><option value="">{text.all}</option>{LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label>
      <label className="text-sm font-bold">{text.status}<br /><select name="status" defaultValue={filter.status ?? ""} className={fieldClass}><option value="">{text.all}</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
      <label className="text-sm font-bold">{text.reviewed}<br /><select name="reviewed" defaultValue={filter.reviewed ?? ""} className={fieldClass}><option value="">{text.all}</option><option value="yes">{text.yes}</option><option value="no">{text.no}</option></select></label>
      <label className="text-sm font-bold">{text.search}<br /><input name="q" defaultValue={filter.q ?? ""} className={fieldClass} /></label>
      <Button type="submit">{text.filter}</Button>
    </form>
    <p className="mt-6 text-sm text-muted">{total} {text.total}</p>
    {rows.length === 0 ? <Card className="mt-3">{text.none}</Card> : <div className="mt-3 overflow-x-auto rounded-ui border border-line">
      <table className="w-full text-left text-sm">
        <tbody>{rows.map((row) => <tr key={row.id} className="border-b border-line align-top last:border-0">
          <td className="p-3"><Link className="font-bold text-brand underline-offset-2 hover:underline" href={`/admin/vocabulary/${row.id}`}>{row.headword}</Link><div className="text-xs text-muted">{row.partOfSpeech} · {row.cefrLevel}</div></td>
          <td className="p-3">{row.meaning}<div className="text-xs text-muted">{row.example ?? text.noExample}</div></td>
          <td className="p-3 text-xs"><span className="rounded-full bg-band px-2 py-1 font-bold">{row.status}</span>{row.reviewedAt ? <div className="mt-2 text-muted">✓ {row.reviewedBy}</div> : null}</td>
        </tr>)}</tbody>
      </table>
    </div>}
    <nav className="mt-6 flex gap-3">{page > 1 && <Link href={link({ page: page - 1 })}><Button variant="secondary">{text.prev}</Button></Link>}<span className="self-center text-sm text-muted">{page} / {pages}</span>{page < pages && <Link href={link({ page: page + 1 })}><Button variant="secondary">{text.next}</Button></Link>}</nav>
  </Section>;
}
