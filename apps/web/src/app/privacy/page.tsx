import Link from "next/link";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { retentionPolicyFromEnv } from "@/modules/account/retention";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Quyền riêng tư", description: "Dữ liệu nào được lưu, lưu bao lâu, khi nào gửi tới AI và cách tải về hoặc xoá dữ liệu của bạn." }, en: { title: "Privacy", description: "What is stored and for how long, when content is sent to AI, and how to download or delete your data." } }, "/privacy");
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  // The numbers come from the same settings the retention job uses.
  const { recordingDays, guestDays, emptyGuestDays } = retentionPolicyFromEnv();
  const copy = locale === "vi"
    ? { eyebrow: "Quyền riêng tư", title: "Dữ liệu của bạn được dùng như thế nào", updated: "Cập nhật ngày 2 tháng 10 năm 2026", sections: [
      ["Dữ liệu được lưu", "Tiến độ học, câu trả lời bài tập và bài thi, bài viết, bản ghi âm, bản chép lời và nhận xét, từ vựng đã ôn và hồ sơ học tập (mục tiêu, trình độ). Nếu bạn chưa đăng nhập, dữ liệu được gắn với một mã khách lưu trong cookie của trình duyệt."],
      ["Đăng nhập", "Khi đăng nhập bằng Google, chúng tôi chỉ nhận tên, email và ảnh đại diện để nhận diện tài khoản. Khi đăng nhập bằng email, chúng tôi lưu email của bạn và gửi một đường link đăng nhập dùng một lần. Khi đăng nhập, tiến độ ở chế độ khách trên trình duyệt đó được gộp vào tài khoản."],
      ["Nhận xét bằng AI", "Khi bạn nộp bài viết, bản ghi âm hoặc hỏi trợ giảng, nội dung đó được gửi tới Google Gemini để tạo bản chép lời và nhận xét. Đáp án của đề thi không bao giờ được gửi kèm. Phản hồi AI được lưu tạm tối đa 24 giờ để không phải tạo lại cho cùng một nội dung."],
      ["Cookie", "Chúng tôi chỉ dùng cookie cần thiết: mã khách, phiên đăng nhập và ngôn ngữ giao diện. Không có cookie quảng cáo hay theo dõi của bên thứ ba."],
      ["Thời hạn lưu", `Bản ghi âm bài nói được xoá sau ${recordingDays} ngày (bản chép lời và nhận xét vẫn được giữ). Dữ liệu của khách không quay lại trong ${guestDays} ngày được xoá; khách chưa từng học bài nào được xoá sau ${emptyGuestDays} ngày. Dữ liệu của tài khoản đã đăng nhập được giữ cho tới khi bạn xoá.`],
      ["Quyền của bạn", "Ở trang Hồ sơ học tập, bạn có thể tải về toàn bộ dữ liệu của mình dưới dạng tệp JSON, hoặc xoá vĩnh viễn dữ liệu học và tài khoản, kể cả bản ghi âm. Việc xoá có hiệu lực ngay và không thể khôi phục."]
    ] }
    : { eyebrow: "Privacy", title: "How your data is used", updated: "Updated 2 October 2026", sections: [
      ["What is stored", "Learning progress, exercise and exam answers, writing, recordings with their transcripts and feedback, reviewed vocabulary and your learning profile (goal, level). If you are not signed in, this data is linked to a guest ID kept in a browser cookie."],
      ["Signing in", "When you sign in with Google, we receive only your name, email and profile picture to identify your account. When you sign in with email, we store your email address and send you a one-time sign-in link. When you sign in, the guest progress on that browser is merged into your account."],
      ["AI feedback", "When you submit writing or a recording, or ask the tutor, that content is sent to Google Gemini to produce a transcript and feedback. Exam answer keys are never included. AI responses are cached for up to 24 hours so the same content is not processed twice."],
      ["Cookies", "We only use necessary cookies: the guest ID, your sign-in session and the interface language. There are no advertising or third-party tracking cookies."],
      ["How long data is kept", `Speaking recordings are deleted after ${recordingDays} days (transcripts and feedback are kept). Data of guests who do not return for ${guestDays} days is deleted; guests who never completed any activity are deleted after ${emptyGuestDays} days. Data of signed-in accounts is kept until you delete it.`],
      ["Your rights", "On the Learning profile page you can download all of your data as a JSON file, or permanently delete your learning data and account, including recordings. Deletion takes effect immediately and cannot be undone."]
    ] };
  return <Section className="max-w-3xl">
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{copy.title}</h1>
    <p className="mt-4 text-sm text-muted">{copy.updated}</p>
    <div className="mt-8 space-y-8">{copy.sections.map(([title, text]) => <section key={title}><h2 className="font-serif text-2xl font-bold">{title}</h2><p className="mt-3 leading-8 text-muted">{text}</p></section>)}</div>
    <p className="mt-10 text-sm text-muted"><Link className="font-bold text-brand hover:underline" href="/profile">{locale === "vi" ? "Tải về hoặc xoá dữ liệu" : "Download or delete your data"}</Link> · <Link className="font-bold text-brand hover:underline" href="/terms">{locale === "vi" ? "Điều khoản sử dụng" : "Terms of use"}</Link></p>
  </Section>;
}
