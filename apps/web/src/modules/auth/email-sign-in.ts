import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isLocalDatabase } from "@/modules/auth/demo-account";

/**
 * Email sign-in sends a one-time link through Resend (AUTH_RESEND_KEY and AUTH_EMAIL_FROM).
 * For local development and E2E, E4F_MAIL_OUTBOX=true writes the link to .local-mail/ instead;
 * like the demo account, that only works against a local english4free* database.
 */
export function isMailOutboxEnabled(): boolean {
  return process.env.E4F_MAIL_OUTBOX === "true" && isLocalDatabase();
}

export function isEmailSignInConfigured(): boolean {
  return Boolean(process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM) || isMailOutboxEnabled();
}

export const emailFrom = () => process.env.AUTH_EMAIL_FROM ?? "English 4 Free <no-reply@english4free.local>";

/** Where the outbox keeps the latest link for an address. */
export function outboxFile(email: string) {
  return resolve(process.cwd(), ".local-mail", `${email.toLowerCase().replace(/[^a-z0-9@._-]/gu, "_")}.json`);
}

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
export async function sendSignInEmail({ identifier, url, provider }: { identifier: string; url: string; provider: { apiKey?: string; from?: string } }) {
  const { subject, text, html } = message(url, new URL(url).host);
  if (isMailOutboxEnabled()) {
    const file = outboxFile(identifier);
    await mkdir(resolve(file, ".."), { recursive: true });
    await writeFile(file, JSON.stringify({ to: identifier, subject, url, sentAt: new Date().toISOString() }, null, 2));
    console.info(`[mail outbox] sign-in link for ${identifier} written to ${file}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${provider.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from: provider.from ?? emailFrom(), to: identifier, subject, html, text })
  });
  if (!response.ok) throw new Error(`Resend rejected the sign-in email (${response.status})`);
}
