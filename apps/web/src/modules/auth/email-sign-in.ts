import { emailFrom, isEmailConfigured, sendEmail } from "@/modules/email/send";

export { emailFrom };
export const isEmailSignInConfigured = isEmailConfigured;

function message(url: string, host: string) {
  const subject = "Đăng nhập English 4 Free · Sign in to English 4 Free";
  const text = `Bấm vào đường link sau để đăng nhập English 4 Free (link dùng một lần, hết hạn sau 24 giờ):\n${url}\n\nClick the link below to sign in to English 4 Free (single use, expires in 24 hours):\n${url}\n\nNếu bạn không yêu cầu email này, hãy bỏ qua nó. If you did not request this email, ignore it.\n${host}`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#202522">
<p style="font-size:20px;font-weight:700">English <span style="color:#506a58">4 Free</span></p>
<p>Bấm nút dưới đây để đăng nhập. Link dùng một lần và hết hạn sau 24 giờ.<br><span style="color:#5c635d">Click the button below to sign in. The link works once and expires in 24 hours.</span></p>
<p><a href="${url}" style="display:inline-block;background:#506a58;color:#fff;padding:12px 20px;border-radius:8px;font-weight:700;text-decoration:none">Đăng nhập · Sign in</a></p>
<p style="color:#5c635d;font-size:13px">Nếu bạn không yêu cầu email này, hãy bỏ qua nó.<br>If you did not request this email, you can ignore it.</p></div>`;
  return { subject, text, html };
}

/** Auth.js calls this with the one-time link for the address the learner typed. */
export async function sendSignInEmail({ identifier, url, provider }: { identifier: string; url: string; provider: { apiKey?: string } }) {
  const { subject, text, html } = message(url, new URL(url).host);
  await sendEmail({ to: identifier, subject, text, html, apiKey: provider.apiKey, outboxData: { url } });
}
