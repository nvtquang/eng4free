"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const copy = {
  vi: {
    title: "Nhắc học qua email", intro: "Nhận một email ngắn vào giờ bạn chọn, vào những ngày bạn chưa học: chuỗi ngày đang giữ, từ đến hạn ôn và bài tiếp theo. Nếu bạn nghỉ lâu, email sẽ thưa dần rồi dừng.",
    to: "Gửi tới", enable: "Gửi email nhắc học cho tôi", hour: "Giờ nhận (giờ Việt Nam)", save: "Lưu", saving: "Đang lưu…", saved: "Đã lưu.", failed: "Chưa lưu được. Hãy thử lại.",
    guest: "Đăng nhập để nhận email nhắc học mỗi ngày.", signIn: "Đăng nhập"
  },
  en: {
    title: "Email study reminders", intro: "Get a short email at the hour you choose on days you have not studied yet: your streak, words due and the next lesson. If you take a long break, the emails slow down and then stop.",
    to: "Sent to", enable: "Email me study reminders", hour: "Time (Vietnam time)", save: "Save", saving: "Saving…", saved: "Saved.", failed: "Could not save. Please try again.",
    guest: "Sign in to get a daily study reminder by email.", signIn: "Sign in"
  }
} as const;

const hours = Array.from({ length: 18 }, (_, index) => index + 5);

export function ReminderSettings({ locale, email, enabled, hour }: { locale: "vi" | "en"; email: string | null; enabled: boolean; hour: number }) {
  const text = copy[locale];
  const [on, setOn] = useState(enabled);
  const [time, setTime] = useState(hour);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  if (!email) return <Card className="mt-6" id="reminders"><h2 className="font-serif text-2xl font-bold">{text.title}</h2><p className="mt-3 text-sm leading-6 text-muted">{text.guest}</p><Link className="mt-4 inline-flex" href="/login"><Button variant="secondary">{text.signIn}</Button></Link></Card>;

  async function save() {
    setState("saving");
    const response = await fetch("/api/reminders", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: on, hour: time }) }).catch(() => null);
    setState(response?.ok ? "saved" : "failed");
  }

  return <Card className="mt-6" id="reminders">
    <h2 className="font-serif text-2xl font-bold">{text.title}</h2>
    <p className="mt-3 text-sm leading-6 text-muted">{text.intro}</p>
    <p className="mt-3 text-sm"><span className="text-muted">{text.to}:</span> <span className="font-bold">{email}</span></p>
    <label className="mt-5 flex items-center gap-3 font-bold"><input type="checkbox" className="size-5 accent-[var(--brand)]" checked={on} onChange={(event) => { setOn(event.target.checked); setState("idle"); }} />{text.enable}</label>
    <label className="mt-4 block text-sm font-bold" htmlFor="reminder-hour">{text.hour}</label>
    <select id="reminder-hour" className="mt-2 min-h-11 rounded-ui border border-line bg-canvas px-3 disabled:opacity-50" disabled={!on} value={time} onChange={(event) => { setTime(Number(event.target.value)); setState("idle"); }}>{hours.map((value) => <option key={value} value={value}>{String(value).padStart(2, "0")}:00</option>)}</select>
    <div className="mt-5 flex items-center gap-3"><Button disabled={state === "saving"} onClick={() => void save()}>{state === "saving" ? text.saving : text.save}</Button>{state === "saved" && <p className="text-sm text-brand" role="status">{text.saved}</p>}{state === "failed" && <p className="text-sm text-red-700" role="alert">{text.failed}</p>}</div>
  </Card>;
}
