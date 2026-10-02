import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Giới thiệu English 4 Free", description: "English 4 Free là gì, nội dung đến từ đâu và các nguồn, giấy phép được sử dụng." }, en: { title: "About English 4 Free", description: "What English 4 Free is, where its content comes from and the sources and licences it uses." } }, "/about");
}

/** Attribution required by the CC BY / CC BY-SA sources used in the content. */
const credits = [
  { vi: "Nghĩa tiếng Việt và phiên âm IPA của từ vựng: English Wiktionary, qua bản trích xuất kaikki.org", en: "Vietnamese meanings and IPA for vocabulary: English Wiktionary, via the kaikki.org extraction", license: "CC BY-SA 4.0", url: "https://en.wiktionary.org" },
  { vi: "Cấp độ CEFR của từ vựng A1–B2: Words-CEFR Dataset", en: "CEFR levels for A1–B2 vocabulary: Words-CEFR Dataset", license: "MIT", url: "https://github.com/Maximax67/Words-CEFR-Dataset" },
  { vi: "Cấp độ CEFR của từ vựng C1–C2: Octanove Vocabulary Profile", en: "CEFR levels for C1–C2 vocabulary: Octanove Vocabulary Profile", license: "CC BY-SA 4.0", url: "https://github.com/openlanguageprofiles/olp-en-cefrj" },
  { vi: "Giọng đọc audio (Piper TTS) được huấn luyện trên VCTK (Đại học Edinburgh) và LibriTTS-R", en: "Audio voices (Piper TTS) trained on VCTK (University of Edinburgh) and LibriTTS-R", license: "CC BY 4.0", url: "https://github.com/OHF-Voice/piper1-gpl" },
  { vi: "Ảnh TOEIC Part 1: ảnh CC0 qua Openverse, tên tác giả ghi dưới từng ảnh", en: "TOEIC Part 1 photographs: CC0 photos via Openverse, credited under each picture", license: "CC0 1.0", url: "https://openverse.org" }
];

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
    <section className="mt-14 border-t border-line pt-8">
      <h2 className="font-serif text-2xl font-bold">{locale === "vi" ? "Nguồn và giấy phép" : "Sources and licences"}</h2>
      <p className="mt-3 leading-7 text-muted">{locale === "vi" ? "Bài học, đề thi và câu ví dụ là nội dung gốc của English 4 Free. Các dữ liệu dưới đây được dùng theo giấy phép mở:" : "Lessons, tests and example sentences are original English 4 Free content. The following data is used under open licences:"}</p>
      <ul className="mt-4 space-y-2 text-sm leading-6">{credits.map((credit) => <li key={credit.url}><a className="underline" href={credit.url} rel="noreferrer" target="_blank">{credit[locale]}</a> — {credit.license}</li>)}</ul>
    </section>
  </Section>;
}
