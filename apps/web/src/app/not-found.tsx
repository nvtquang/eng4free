import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";

const copy = {
  vi: { eyebrow: "Lỗi 404", title: "Không tìm thấy trang này", text: "Đường dẫn có thể đã sai, hoặc bài học, đề thi này không còn được xuất bản. Bạn có thể quay lại việc học từ một trong các trang dưới đây.", home: "Về trang chủ", today: "Hôm nay", path: "Lộ trình", exams: "Luyện thi" },
  en: { eyebrow: "Error 404", title: "This page could not be found", text: "The link may be wrong, or this lesson or test is no longer published. Pick up your learning from one of the pages below.", home: "Back to home", today: "Today", path: "Path", exams: "Exam prep" }
} as const;

export const metadata: Metadata = { title: "404", robots: { index: false } };

export default async function NotFound() {
  const text = copy[await getLocale()];
  return <Section className="max-w-3xl">
    <Eyebrow>{text.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{text.title}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{text.text}</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/"><Button>{text.home}</Button></Link>
      <Link href="/today"><Button variant="secondary">{text.today}</Button></Link>
      <Link href="/learn"><Button variant="secondary">{text.path}</Button></Link>
      <Link href="/exam-prep"><Button variant="secondary">{text.exams}</Button></Link>
    </div>
  </Section>;
}
