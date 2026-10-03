import type { ReminderKind } from "./schedule";

export type ReminderContent = {
  kind: ReminderKind;
  streakDays: number;
  minutesGoal: number | null;
  wordsDue: number;
  mistakesDue: number;
  nextLesson: string | null;
  todayUrl: string;
  unsubscribeUrl: string;
};

const escape = (value: string) => value.replace(/[&<>"']/gu, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/**
 * The reminder email, in Vietnamese with an English line (accounts store no language). It says
 * what is waiting today: the streak at stake, words due, mistakes to retry and the next lesson.
 */
export function reminderMessage(content: ReminderContent): { subject: string; text: string; html: string } {
  const subject = content.kind === "keep-streak"
    ? `Giữ chuỗi ${content.streakDays} ngày học của bạn · Keep your ${content.streakDays}-day streak`
    : content.kind === "come-back"
      ? "Bài học của bạn vẫn đang chờ · Your lessons are waiting"
      : "Hôm nay học tiếng Anh một chút nhé · Time for a little English today";
  const lead = content.kind === "keep-streak"
    ? `Bạn đã học ${content.streakDays} ngày liền. Học một bài hôm nay để giữ chuỗi.`
    : content.kind === "come-back"
      ? "Đã một thời gian bạn chưa học. Chỉ cần vài phút để bắt đầu lại."
      : `Dành ${content.minutesGoal ?? 10} phút hôm nay để tiến thêm một bước.`;
  const items = [
    content.nextLesson ? `Bài tiếp theo: ${content.nextLesson}` : null,
    content.wordsDue > 0 ? `${content.wordsDue} từ đến hạn ôn` : null,
    content.mistakesDue > 0 ? `${content.mistakesDue} câu sai cần luyện lại` : null
  ].filter((item): item is string => Boolean(item));

  const text = [lead, ...items.map((item) => `- ${item}`), "", `Học ngay / Study now: ${content.todayUrl}`, "", `Tắt email nhắc học / Stop these reminders: ${content.unsubscribeUrl}`].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#202522">
<p style="font-size:20px;font-weight:700">English <span style="color:#506a58">4 Free</span></p>
<p style="font-size:16px;line-height:1.6">${escape(lead)}</p>
${items.length ? `<ul style="line-height:1.8;padding-left:20px">${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>` : ""}
<p><a href="${escape(content.todayUrl)}" style="display:inline-block;background:#506a58;color:#fff;padding:12px 20px;border-radius:8px;font-weight:700;text-decoration:none">Học ngay · Study now</a></p>
<p style="color:#5c635d;font-size:13px">Bạn nhận email này vì đã bật nhắc học trong hồ sơ. You get this email because you turned on study reminders.<br><a href="${escape(content.unsubscribeUrl)}" style="color:#5c635d">Tắt email nhắc học · Stop these reminders</a></p></div>`;
  return { subject, text, html };
}
