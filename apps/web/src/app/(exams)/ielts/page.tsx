import Link from "next/link";
import { ExamCatalog } from "@/components/exam-catalog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { listPublicExams } from "@/modules/exams/exam-engine";

export const dynamic = "force-dynamic";

export default async function IeltsPage() {
  const locale = await getLocale();
  const copy = locale === "vi"
    ? { title: "Luyện IELTS", description: "Luyện đủ bốn kỹ năng: làm đề Listening và Reading có tính giờ, viết Task 2 và nói theo đề thi thật.", history: "Lịch sử làm đề", examsTitle: "Listening & Reading", productiveTitle: "Writing & Speaking", writing: "Writing Task 2", writingText: "Viết bài luận, lưu nháp và nhận nhận xét theo bốn tiêu chí chấm.", speaking: "Speaking Part 1", speakingText: "Ghi âm câu trả lời, xem bản chép lời và nhận xét để luyện tiếp.", open: "Bắt đầu luyện" }
    : { title: "IELTS practice", description: "Practise all four skills: timed Listening and Reading, Writing Task 2 and exam-style Speaking.", history: "Exam history", examsTitle: "Listening & Reading", productiveTitle: "Writing & Speaking", writing: "Writing Task 2", writingText: "Write an essay, save drafts and receive feedback on the four assessment criteria.", speaking: "Speaking Part 1", speakingText: "Record your answer, read the transcript and use the feedback to practise again.", open: "Start practice" };
  let exams: Awaited<ReturnType<typeof listPublicExams>> = [];
  try { exams = await listPublicExams("IELTS"); } catch { /* Local setup may not have a database yet. */ }
  return <Section>
    <Eyebrow>IELTS</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{copy.title}</h1>
    <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{copy.description}</p>
    <Link className="mt-6 inline-flex" href="/toeic/history"><Button variant="secondary">{copy.history}</Button></Link>
    <h2 className="mt-12 font-serif text-3xl font-bold">{copy.examsTitle}</h2>
    <ExamCatalog exams={exams} locale={locale} />
    <h2 className="mt-12 font-serif text-3xl font-bold">{copy.productiveTitle}</h2>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      {[{ title: copy.writing, text: copy.writingText, href: "/ielts/writing" }, { title: copy.speaking, text: copy.speakingText, href: "/ielts/speaking" }].map((item) => <Card className="flex min-h-52 flex-col" key={item.href}><h3 className="font-serif text-3xl font-bold">{item.title}</h3><p className="mt-3 flex-1 leading-7 text-muted">{item.text}</p><Link className="mt-6 inline-flex" href={item.href}><Button>{copy.open}</Button></Link></Card>)}
    </div>
  </Section>;
}
