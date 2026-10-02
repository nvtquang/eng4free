import Link from "next/link";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Điều khoản sử dụng", description: "Điều kiện sử dụng English 4 Free: dịch vụ miễn phí, nội dung và giấy phép, nhận xét AI, tài khoản và dữ liệu." }, en: { title: "Terms of use", description: "The terms for using English 4 Free: a free service, content and licences, AI feedback, accounts and data." } }, "/terms");
}

const updated = { vi: "Cập nhật ngày 2 tháng 10 năm 2026", en: "Updated 2 October 2026" };

const sections = {
  vi: [
    ["Dịch vụ", "English 4 Free là dịch vụ học tiếng Anh miễn phí. Bạn có thể học ở chế độ khách mà không cần tài khoản, hoặc đăng nhập để giữ tiến độ trên nhiều thiết bị. Dịch vụ được cung cấp “nguyên trạng”: chúng tôi cố gắng giữ nội dung chính xác và trang hoạt động ổn định nhưng không bảo đảm dịch vụ không bao giờ gián đoạn hay không có lỗi."],
    ["Nội dung và giấy phép", "Bài học, câu hỏi và đề luyện là nội dung gốc của English 4 Free hoặc nội dung có giấy phép mở; nguồn và giấy phép được ghi ở trang Giới thiệu và cạnh từng nội dung (ví dụ nghĩa từ vựng từ Wiktionary theo CC BY-SA 4.0). Bạn được dùng nội dung để tự học; khi chia sẻ lại nội dung có giấy phép mở, hãy giữ đúng ghi công và giấy phép. Đề luyện TOEIC, IELTS không phải đề chính thức của ETS, British Council, IDP hay Cambridge."],
    ["Điểm ước tính và nhận xét AI", "Điểm TOEIC, band IELTS và nhận xét do AI tạo ra chỉ để luyện tập, không phải kết quả chính thức và có thể sai. Đừng dùng chúng để thay cho kết quả thi thật hay quyết định quan trọng."],
    ["Bài làm của bạn", "Bài viết, bản ghi âm và câu trả lời bạn gửi vẫn thuộc về bạn. Bạn cho phép chúng tôi lưu và xử lý chúng (kể cả gửi tới dịch vụ AI để tạo nhận xét) chỉ để cung cấp tính năng cho bạn, như mô tả ở trang Quyền riêng tư."],
    ["Sử dụng hợp lý", "Không dùng dịch vụ để gửi nội dung vi phạm pháp luật hay xâm phạm quyền của người khác, không cố truy cập dữ liệu của người khác, và không dùng công cụ tự động để làm quá tải dịch vụ hay khai thác giới hạn nhận xét AI. Chúng tôi có thể giới hạn hoặc chặn truy cập khi có hành vi như vậy."],
    ["Tài khoản và xoá dữ liệu", "Bạn có thể tải về hoặc xoá vĩnh viễn dữ liệu học và tài khoản của mình bất cứ lúc nào ở trang Hồ sơ học tập. Dữ liệu của khách lâu không quay lại được xoá theo thời hạn ghi ở trang Quyền riêng tư."],
    ["Thay đổi", "Điều khoản có thể được cập nhật khi dịch vụ thay đổi; ngày cập nhật được ghi ở đầu trang. Tiếp tục sử dụng sau khi cập nhật nghĩa là bạn đồng ý với điều khoản mới."]
  ],
  en: [
    ["The service", "English 4 Free is a free English learning service. You can study as a guest without an account, or sign in to keep your progress across devices. The service is provided “as is”: we work to keep content accurate and the site available, but we do not guarantee it will never be interrupted or free of errors."],
    ["Content and licences", "Lessons, questions and practice tests are original English 4 Free content or openly licensed content; sources and licences are listed on the About page and next to the content itself (for example, vocabulary meanings from Wiktionary under CC BY-SA 4.0). You may use the content for your own learning; when you share openly licensed content, keep its attribution and licence. TOEIC and IELTS practice tests are not official tests from ETS, the British Council, IDP or Cambridge."],
    ["Estimated scores and AI feedback", "TOEIC scores, IELTS bands and AI-generated feedback are practice estimates, not official results, and they can be wrong. Do not rely on them in place of a real test or for important decisions."],
    ["Your work", "The writing, recordings and answers you submit remain yours. You allow us to store and process them (including sending them to an AI service to generate feedback) only to provide the features to you, as described on the Privacy page."],
    ["Fair use", "Do not use the service to submit unlawful content or content that infringes others' rights, do not try to access other people's data, and do not use automated tools to overload the service or exhaust the AI feedback limits. We may limit or block access when this happens."],
    ["Accounts and deleting data", "You can download or permanently delete your learning data and account at any time from the Learning profile page. Data of guests who stop returning is deleted after the periods listed on the Privacy page."],
    ["Changes", "These terms may be updated when the service changes; the date at the top shows the latest update. Continuing to use the service after an update means you accept the new terms."]
  ]
} as const;

export default async function TermsPage() {
  const locale = await getLocale();
  return <Section className="max-w-3xl">
    <Eyebrow>{locale === "vi" ? "Điều khoản" : "Terms"}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{locale === "vi" ? "Điều khoản sử dụng" : "Terms of use"}</h1>
    <p className="mt-4 text-sm text-muted">{updated[locale]}</p>
    <div className="mt-8 space-y-8">{sections[locale].map(([title, text]) => <section key={title}><h2 className="font-serif text-2xl font-bold">{title}</h2><p className="mt-3 leading-8 text-muted">{text}</p></section>)}</div>
    <p className="mt-10 text-sm text-muted"><Link className="font-bold text-brand hover:underline" href="/privacy">{locale === "vi" ? "Quyền riêng tư" : "Privacy"}</Link> · <Link className="font-bold text-brand hover:underline" href="/about">{locale === "vi" ? "Giới thiệu và nguồn nội dung" : "About and content sources"}</Link></p>
  </Section>;
}
