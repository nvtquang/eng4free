"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DELETE_CONFIRMATION } from "@/modules/account/confirmation";

const copy = {
  vi: {
    title: "Dữ liệu của bạn", exportText: "Tải về toàn bộ dữ liệu học của bạn (tiến độ, bài làm, bài viết, bản chép lời bài nói, sổ từ) dưới dạng tệp JSON.", export: "Tải dữ liệu về",
    deleteTitle: "Xoá dữ liệu", deleteSignedIn: "Xoá vĩnh viễn tài khoản và toàn bộ dữ liệu học, kể cả bản ghi âm. Không thể khôi phục.", deleteGuest: "Xoá vĩnh viễn dữ liệu học trên trình duyệt này, kể cả bản ghi âm. Không thể khôi phục.",
    word: "xoá", prompt: "Gõ “xoá” để xác nhận", confirm: "Xoá vĩnh viễn", deleting: "Đang xoá…", failed: "Chưa xoá được. Hãy thử lại."
  },
  en: {
    title: "Your data", exportText: "Download all of your learning data (progress, answers, writing, speaking transcripts, wordbook) as a JSON file.", export: "Download my data",
    deleteTitle: "Delete data", deleteSignedIn: "Permanently delete your account and all learning data, including recordings. This cannot be undone.", deleteGuest: "Permanently delete the learning data on this browser, including recordings. This cannot be undone.",
    word: "delete", prompt: "Type “delete” to confirm", confirm: "Delete permanently", deleting: "Deleting…", failed: "Could not delete. Please try again."
  }
} as const;

/** Download and delete for the learner's own data (privacy page promises both). */
export function AccountData({ locale, signedIn }: { locale: "vi" | "en"; signedIn: boolean }) {
  const text = copy[locale];
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"idle" | "deleting" | "failed">("idle");
  const ready = typed.trim().toLowerCase() === text.word || (locale === "vi" && typed.trim().toLowerCase() === "xóa");

  async function remove() {
    setState("deleting");
    const response = await fetch("/api/account/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: DELETE_CONFIRMATION }) }).catch(() => null);
    if (!response?.ok) { setState("failed"); return; }
    window.location.assign("/");
  }

  return <Card className="mt-6">
    <h2 className="font-serif text-2xl font-bold">{text.title}</h2>
    <p className="mt-3 text-sm leading-6 text-muted">{text.exportText}</p>
    <a className="mt-4 inline-flex min-h-11 items-center rounded-ui border border-line bg-surface px-5 text-sm font-bold text-ink transition hover:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href="/api/account/export" download>{text.export}</a>
    <div className="mt-8 border-t border-line pt-6">
      <h3 className="font-bold text-ink">{text.deleteTitle}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{signedIn ? text.deleteSignedIn : text.deleteGuest}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input value={typed} onChange={(event) => setTyped(event.target.value)} aria-label={text.prompt} placeholder={text.prompt} className="min-h-11 rounded-ui border border-line bg-canvas px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" />
        <button type="button" disabled={!ready || state === "deleting"} onClick={() => void remove()} className="inline-flex min-h-11 items-center rounded-ui bg-red-700 px-5 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50">{state === "deleting" ? text.deleting : text.confirm}</button>
      </div>
      {state === "failed" && <p className="mt-3 text-sm text-red-700" role="alert">{text.failed}</p>}
    </div>
  </Card>;
}
