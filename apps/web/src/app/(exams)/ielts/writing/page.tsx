import { IeltsWritingForm } from "@/components/ielts-writing-form";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
export default async function IeltsWritingPage() { const copy = getMessages(await getLocale()).ielts; return <Section className="max-w-4xl"><Eyebrow>{copy.eyebrow} · {copy.writing}</Eyebrow><h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.writingTitle}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.description}</p><div className="mt-12"><IeltsWritingForm copy={copy} /></div></Section>; }
