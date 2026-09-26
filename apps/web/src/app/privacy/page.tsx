import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";

export default async function PrivacyPage() {
  const locale = await getLocale();
  const copy = locale === "vi"
    ? { eyebrow: "Quyền riêng tư", title: "Dữ liệu của bạn được dùng như thế nào", sections: [["Dữ liệu được lưu", "Tiến độ học, câu trả lời bài tập và bài thi, bài viết, bản ghi âm và từ vựng đã ôn. Nếu bạn chưa đăng nhập, dữ liệu được gắn với một mã khách lưu trong cookie của trình duyệt."], ["Đăng nhập", "Khi đăng nhập bằng Google, chúng tôi chỉ nhận tên, email và ảnh đại diện để nhận diện tài khoản."], ["Nhận xét bằng AI", "Khi bạn nộp bài viết hoặc bản ghi âm để nhận xét, nội dung đó được gửi tới Google Gemini để tạo nhận xét. Đáp án của đề thi không bao giờ được gửi kèm."], ["Quyền của bạn", "Bạn có thể ngừng sử dụng bất cứ lúc nào. Xóa cookie của trình duyệt sẽ tách bạn khỏi dữ liệu học ở chế độ khách."]] }
    : { eyebrow: "Privacy", title: "How your data is used", sections: [["What is stored", "Learning progress, exercise and exam answers, writing, recordings and reviewed vocabulary. If you are not signed in, this data is linked to a guest ID kept in a browser cookie."], ["Signing in", "When you sign in with Google, we receive only your name, email and profile picture to identify your account."], ["AI feedback", "When you submit writing or a recording for feedback, that content is sent to Google Gemini to generate the feedback. Exam answer keys are never included."], ["Your choices", "You can stop using the service at any time. Clearing your browser cookies disconnects you from guest learning data."]] };
  return <Section className="max-w-3xl">
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{copy.title}</h1>
    <div className="mt-8 space-y-8">{copy.sections.map(([title, text]) => <section key={title}><h2 className="font-serif text-2xl font-bold">{title}</h2><p className="mt-3 leading-8 text-muted">{text}</p></section>)}</div>
  </Section>;
}
