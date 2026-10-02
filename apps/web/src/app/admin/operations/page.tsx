import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { createDatabase } from "@/db/client";
import { getLocale } from "@/lib/i18n";
import { getAdminActor } from "@/modules/auth/authorization";
import { aiToday, eventCounts, learnerFunnel, recentErrors, type Funnel } from "@/modules/operations/repository";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vận hành · Operations", robots: { index: false } };

const copy = {
  vi: {
    eyebrow: "Quản trị", title: "Vận hành", denied: "Cần quyền quản trị.", back: "← Nội dung", noDb: "Chưa cấu hình database.",
    funnel: "Phễu người học", days: "{n} ngày qua", visitors: "Phiên khách mới", onboarded: "Hoàn tất thiết lập", firstLesson: "Học xong bài đầu", returned: "Quay lại ngày khác",
    funnelNote: "Tính trên người học xuất hiện lần đầu trong khoảng thời gian. Phiên khách gồm cả bot chạy JavaScript.",
    ai: "AI hôm nay (UTC)", budget: "Ngân sách", text: "Nhận xét và trợ giảng", transcription: "Chép lời bài nói", operation: "Tác vụ", status: "Trạng thái", count: "Số lượt", noAi: "Chưa có lượt gọi AI nào hôm nay.",
    errors: "Lỗi 7 ngày qua", noErrors: "Không có lỗi nào.", source: "Nguồn", lastSeen: "Lần cuối",
    events: "Sự kiện 7 ngày qua", noEvents: "Chưa có sự kiện."
  },
  en: {
    eyebrow: "Admin", title: "Operations", denied: "Admin access required.", back: "← Content", noDb: "No database configured.",
    funnel: "Learner funnel", days: "Last {n} days", visitors: "New guest sessions", onboarded: "Finished setup", firstLesson: "Finished a first lesson", returned: "Came back another day",
    funnelNote: "Counts learners first seen in the period. Guest sessions include bots that run JavaScript.",
    ai: "AI today (UTC)", budget: "Budget", text: "Feedback and tutor", transcription: "Speech transcription", operation: "Operation", status: "Status", count: "Calls", noAi: "No AI calls today yet.",
    errors: "Errors, last 7 days", noErrors: "No errors.", source: "Source", lastSeen: "Last seen",
    events: "Events, last 7 days", noEvents: "No events yet."
  }
} as const;

function percent(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

export default async function OperationsPage() {
  const locale = await getLocale();
  const text = copy[locale];
  const actor = await getAdminActor();
  if (!actor.isAdmin) return <Section className="max-w-3xl"><Eyebrow>{text.eyebrow}</Eyebrow><h1 className="mt-4 font-serif text-4xl font-bold">{text.denied}</h1></Section>;
  const db = createDatabase();
  if (!db) return <Section><h1 className="font-serif text-4xl font-bold">{text.title}</h1><p className="mt-4">{text.noDb}</p></Section>;
  const [week, month, ai, errors, events] = await Promise.all([learnerFunnel(db, 7), learnerFunnel(db, 30), aiToday(db), recentErrors(db, 7), eventCounts(db, 7)]);
  const steps: Array<keyof Funnel> = ["visitors", "onboarded", "firstLesson", "returned"];
  const dateTime = (value: Date) => new Date(value).toLocaleString(locale === "vi" ? "vi-VN" : "en-GB");

  return <Section>
    <Link className="text-sm font-bold text-brand hover:underline" href="/admin">{text.back}</Link>
    <Eyebrow className="mt-6">{text.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-5xl font-bold">{text.title}</h1>

    <Card className="mt-10">
      <h2 className="font-serif text-2xl font-bold">{text.funnel}</h2>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">{([[7, week], [30, month]] as const).map(([days, funnel]) => <div key={days}>
        <h3 className="text-sm font-bold text-muted">{text.days.replace("{n}", String(days))}</h3>
        <dl className="mt-3 space-y-2">{steps.map((step) => <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2" key={step}><dt>{text[step]}</dt><dd className="font-bold tabular-nums">{funnel[step]} <span className="ml-2 text-sm font-normal text-muted">{step === "visitors" ? "" : percent(funnel[step], funnel.visitors)}</span></dd></div>)}</dl>
      </div>)}</div>
      <p className="mt-4 text-sm text-muted">{text.funnelNote}</p>
    </Card>

    <Card className="mt-6">
      <h2 className="font-serif text-2xl font-bold">{text.ai}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">{(["TEXT", "TRANSCRIPTION"] as const).map((budget) => <div className="rounded-ui bg-band p-4" key={budget}><dt className="text-sm font-bold text-muted">{text.budget} · {budget === "TEXT" ? text.text : text.transcription}</dt><dd className="mt-1 font-serif text-3xl font-bold tabular-nums">{ai.budget[budget].used}/{ai.budget[budget].limit}</dd></div>)}</dl>
      {ai.usage.length === 0 ? <p className="mt-4 text-sm text-muted">{text.noAi}</p> : <table className="mt-5 w-full text-left text-sm"><thead><tr className="text-muted"><th className="py-1">{text.operation}</th><th>{text.status}</th><th className="text-right">{text.count}</th></tr></thead><tbody>{ai.usage.map((row) => <tr className="border-t border-line" key={`${row.operation}-${row.status}`}><td className="py-1.5">{row.operation}</td><td>{row.status}</td><td className="text-right tabular-nums">{row.count}</td></tr>)}</tbody></table>}
    </Card>

    <Card className="mt-6">
      <h2 className="font-serif text-2xl font-bold">{text.errors}</h2>
      {errors.length === 0 ? <p className="mt-4 text-sm text-muted">{text.noErrors}</p> : <ul className="mt-4 space-y-3">{errors.map((error, index) => <li className="border-b border-line pb-3" key={index}>
        <p className="font-bold">{error.name}: <span className="font-normal">{error.message}</span></p>
        <p className="mt-1 text-sm text-muted">{error.path ?? "—"} · {text.source}: {error.source ?? "—"} · ×{error.count} · {text.lastSeen}: {dateTime(error.lastSeen)}</p>
      </li>)}</ul>}
    </Card>

    <Card className="mt-6">
      <h2 className="font-serif text-2xl font-bold">{text.events}</h2>
      {events.length === 0 ? <p className="mt-4 text-sm text-muted">{text.noEvents}</p> : <dl className="mt-4 grid gap-3 sm:grid-cols-3">{events.map((event) => <div className="rounded-ui border border-line p-3" key={event.name}><dt className="text-sm text-muted">{event.name}</dt><dd className="font-serif text-2xl font-bold tabular-nums">{event.count}</dd></div>)}</dl>}
    </Card>
  </Section>;
}
