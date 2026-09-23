import { ContentWorkflowControl } from "@/components/content-workflow-control";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getAdminActor } from "@/modules/auth/authorization";
import { getAdminEditorData, listContentBatches } from "@/modules/content-management/repository";
import { AdminContentOperations } from "@/components/admin-content-operations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminCopy } from "@/lib/admin-copy";
import { getLocale } from "@/lib/i18n";
export default async function AdminPage() { const copy = getAdminCopy(await getLocale()); const actor = await getAdminActor(); if (!actor.isAdmin) return <Section className="max-w-3xl"><Eyebrow>{copy.eyebrow}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold">{copy.accessRequired}</h1><p className="mt-5 leading-7 text-muted">{copy.accessHelp}</p></Section>; const [batches, editorData] = await Promise.all([listContentBatches(), getAdminEditorData()]); return <Section><Eyebrow>{copy.eyebrow}</Eyebrow><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-5xl font-bold">{copy.workflow}</h1><p className="mt-5 text-muted">{copy.signedInAs} {actor.email}</p></div><Link href="/admin/imports"><Button variant="secondary">Content Importer</Button></Link></div>{editorData ? <AdminContentOperations copy={copy} data={editorData} /> : <Card className="mt-10">{copy.databaseRequired}</Card>}{batches && <div className="mt-10 grid gap-4">{batches.map((batch) => <Card key={batch.id}><p className="font-bold">{batch.source}</p><p className="mt-1 text-sm text-muted">{batch.version}</p><ContentWorkflowControl batch={batch} /></Card>)}{batches.length === 0 && <Card>{copy.noBatches}</Card>}</div>}</Section>; }
