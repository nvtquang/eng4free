import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function AboutPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = locale === "vi"
    ? { title: "Học tiếng Anh miễn phí, có lộ trình rõ ràng", intro: "English 4 Free giúp người Việt học tiếng Anh từ A1 đến C2 và luyện thi TOEIC, IELTS mà không phải trả phí.", points: [["Lộ trình theo CEFR", "Bài học ngắn theo sáu trình độ, kết hợp nghe, nói, đọc, viết, ngữ pháp và từ vựng."], ["Luyện thi có phản hồi", "Đề luyện có tính giờ, tự động lưu, chấm ngay và giải thích từng câu."], ["Nhận xét bằng AI", "Bài viết và bài nói được nhận xét theo tiêu chí; ứng dụng không bao giờ tự đặt ra band điểm chính thức."], ["Nội dung minh bạch", "Nội dung được biên soạn gốc hoặc có giấy phép rõ ràng, không sao chép đề thi có bản quyền."]] }
    : { title: "Free English learning with a clear path", intro: "English 4 Free helps learners go from A1 to C2 and prepare for TOEIC and IELTS at no cost.", points: [["A CEFR pathway", "Short lessons across six levels that combine listening, speaking, reading, writing, grammar and vocabulary."], ["Exam practice with feedback", "Timed practice that saves automatically, is scored instantly and explains every answer."], ["AI feedback", "Writing and speaking receive criterion-based feedback; the app never invents an official band."], ["Transparent content", "Content is original or clearly licensed; copyrighted exam papers are never copied."]] };
  return <Section className="max-w-4xl">
    <Eyebrow>{messages.common.about}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight">{copy.title}</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{copy.intro}</p>
    <div className="mt-10 grid gap-5 sm:grid-cols-2">{copy.points.map(([title, text]) => <Card key={title}><h2 className="font-serif text-2xl font-bold">{title}</h2><p className="mt-3 leading-7 text-muted">{text}</p></Card>)}</div>
    <Link className="mt-10 inline-flex" href="/learn"><Button>{messages.common.start}</Button></Link>
  </Section>;
}
