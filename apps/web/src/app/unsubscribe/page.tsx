import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { createDatabase } from "@/db/client";
import { getLocale } from "@/lib/i18n";
import { captureEvent } from "@/lib/observability";
import { disableReminders } from "@/modules/reminders/service";
import { isValidUnsubscribeToken } from "@/modules/reminders/unsubscribe";

export const metadata = { title: "Tắt nhắc học · Stop reminders", robots: { index: false } };

const copy = {
  vi: { title: "Tắt email nhắc học?", text: "Bạn sẽ không nhận email nhắc học nữa. Có thể bật lại bất cứ lúc nào trong hồ sơ học tập.", confirm: "Tắt email nhắc học", doneTitle: "Đã tắt email nhắc học", doneText: "Bạn sẽ không nhận thêm email nhắc học. Muốn bật lại, vào Hồ sơ học tập.", invalid: "Link này không hợp lệ hoặc đã bị cắt bớt. Hãy mở lại từ email, hoặc tắt nhắc học trong hồ sơ.", profile: "Mở hồ sơ học tập" },
  en: { title: "Stop study reminder emails?", text: "You will no longer get study reminders. You can turn them back on at any time in your learning profile.", confirm: "Stop reminder emails", doneTitle: "Study reminders are off", doneText: "You will not get more reminder emails. To turn them back on, open your learning profile.", invalid: "This link is not valid or was cut short. Open it again from the email, or turn reminders off in your profile.", profile: "Open learning profile" }
} as const;

/** Asks before unsubscribing, because mail scanners open links in emails on their own. */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ u?: string; t?: string; done?: string }> }) {
  const text = copy[await getLocale()];
  const { u = "", t = "", done } = await searchParams;
  const valid = Boolean(u && t && isValidUnsubscribeToken(u, t));

  async function unsubscribe() {
    "use server";
    const db = createDatabase();
    // Check again here: the action runs as its own request.
    if (!db || !isValidUnsubscribeToken(u, t)) redirect("/unsubscribe");
    await disableReminders(db, u);
    await captureEvent({ name: "reminders_unsubscribed", properties: { via: "page" } });
    redirect("/unsubscribe?done=1");
  }

  const body = done ? <><h1 className="font-serif text-3xl font-bold">{text.doneTitle}</h1><p className="mt-4 leading-7 text-muted">{text.doneText}</p></>
    : !valid ? <p className="leading-7 text-muted" role="alert">{text.invalid}</p>
      : <><h1 className="font-serif text-3xl font-bold">{text.title}</h1><p className="mt-4 leading-7 text-muted">{text.text}</p><form className="mt-6" action={unsubscribe}><Button type="submit">{text.confirm}</Button></form></>;
  return <Section className="grid min-h-[50vh] place-items-center"><Card className="w-full max-w-md">
    {body}
    <Link className="mt-6 inline-block text-sm font-bold text-brand hover:underline" href="/profile">{text.profile}</Link>
  </Card></Section>;
}
