import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isLocalDatabase } from "@/modules/auth/demo-account";

/**
 * Outgoing email goes through Resend (AUTH_RESEND_KEY and AUTH_EMAIL_FROM). For local
 * development and E2E, E4F_MAIL_OUTBOX=true writes each message to apps/web/.local-mail/
 * instead; like the demo account, that only works against a local english4free* database.
 */
export function isMailOutboxEnabled(): boolean {
  return process.env.E4F_MAIL_OUTBOX === "true" && isLocalDatabase();
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM) || isMailOutboxEnabled();
}

export const emailFrom = () => process.env.AUTH_EMAIL_FROM ?? "English 4 Free <no-reply@english4free.local>";

/** Where the outbox keeps the latest message of one kind for an address (sign-in links use no suffix). */
export function outboxFile(email: string, kind?: string) {
  const name = email.toLowerCase().replace(/[^a-z0-9@._-]/gu, "_");
  return resolve(process.cwd(), ".local-mail", `${name}${kind ? `.${kind}` : ""}.json`);
}

export type OutgoingEmail = {
  to: string; subject: string; html: string; text: string;
  /** Outbox file suffix, e.g. "reminder". */
  kind?: string;
  /** Extra headers such as List-Unsubscribe. */
  headers?: Record<string, string>;
  /** Kept in the outbox file only, for tests (the sign-in link, the unsubscribe link). */
  outboxData?: Record<string, unknown>;
  apiKey?: string;
};

export async function sendEmail(email: OutgoingEmail): Promise<void> {
  if (isMailOutboxEnabled()) {
    const file = outboxFile(email.to, email.kind);
    await mkdir(resolve(file, ".."), { recursive: true });
    await writeFile(file, JSON.stringify({ to: email.to, subject: email.subject, text: email.text, headers: email.headers ?? {}, ...email.outboxData, sentAt: new Date().toISOString() }, null, 2));
    console.info(`[mail outbox] ${email.kind ?? "sign-in"} email for ${email.to} written to ${file}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${email.apiKey ?? process.env.AUTH_RESEND_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: emailFrom(), to: email.to, subject: email.subject, html: email.html, text: email.text, headers: email.headers })
  });
  if (!response.ok) throw new Error(`Resend rejected the email (${response.status})`);
}
