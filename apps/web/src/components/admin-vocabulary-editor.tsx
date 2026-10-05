"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Editable = {
  id: string; headword: string; cefrLevel: string; ipa: string; ipaUs: string; meaning: string; example: string;
  senseGroups: Array<{ sense: string; words: string[] }>; senseChoice: string[]; meaningByEditor: boolean; archived: boolean; reviewed: boolean;
};
const fieldClass = "mt-1 w-full rounded-ui border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand";
const labelClass = "block text-sm font-bold";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const copy = {
  vi: { senses: "Nghĩa theo Wiktionary: chọn cả nhóm hoặc từng từ", own: "Tự viết nghĩa (thay cho Wiktionary)", meaning: "Nghĩa tiếng Việt", example: "Câu ví dụ", level: "Level", ipa: "IPA (Anh)", ipaUs: "IPA (Mỹ)", save: "Lưu", saveReview: "Lưu và đánh dấu đã duyệt", saved: "Đã lưu.", exclude: "Loại từ này", reason: "Lý do loại (bắt buộc)", confirmExclude: "Xác nhận loại", whole: "cả nhóm", archived: "Từ này đã bị loại." },
  en: { senses: "Wiktionary senses: pick a whole group or single words", own: "Write my own meaning (instead of Wiktionary)", meaning: "Vietnamese meaning", example: "Example sentence", level: "Level", ipa: "IPA (UK)", ipaUs: "IPA (US)", save: "Save", saveReview: "Save and mark reviewed", saved: "Saved.", exclude: "Exclude this word", reason: "Reason (required)", confirmExclude: "Confirm exclusion", whole: "whole group", archived: "This word is excluded." }
} as const;

export function AdminVocabularyEditor({ locale, entry }: { locale: "vi" | "en"; entry: Editable }) {
  const text = copy[locale];
  const router = useRouter();
  const [choice, setChoice] = useState<string[]>(entry.senseChoice);
  const [ownMeaning, setOwnMeaning] = useState(entry.meaningByEditor || entry.senseGroups.length === 0);
  const [meaning, setMeaning] = useState(entry.meaning);
  const [example, setExample] = useState(entry.example);
  const [level, setLevel] = useState(entry.cefrLevel);
  const [ipa, setIpa] = useState(entry.ipa);
  const [ipaUs, setIpaUs] = useState(entry.ipaUs);
  const [excluding, setExcluding] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; lines: string[] } | null>(null);

  const toggle = (pick: string) => setChoice((current) => current.includes(pick) ? current.filter((value) => value !== pick) : [...current.filter((value) => !(pick.includes(".") ? value === pick.split(".")[0] : value.startsWith(`${pick}.`))), pick]);

  async function save(markReviewed: boolean) {
    setPending(true); setMessage(null);
    try {
      const body = { ...(ownMeaning ? { meaningText: meaning } : { senseChoice: choice.map((pick) => pick.includes(".") ? pick : Number(pick)) }), example, ipa, ipaUs: ipaUs || null, cefrLevel: level, markReviewed };
      const response = await fetch(`/api/admin/vocabulary/${entry.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({})) as { error?: string; issues?: Array<{ problem: string }> };
      if (!response.ok) { setMessage({ ok: false, lines: result.issues?.map((issue) => issue.problem) ?? [result.error ?? `HTTP ${response.status}`] }); return; }
      setMessage({ ok: true, lines: [text.saved] }); router.refresh();
    } finally { setPending(false); }
  }

  async function exclude() {
    setPending(true); setMessage(null);
    try {
      const response = await fetch(`/api/admin/vocabulary/${entry.id}/exclude`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason }) });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setMessage({ ok: false, lines: [result.error ?? `HTTP ${response.status}`] }); return; }
      setExcluding(false); router.refresh();
    } finally { setPending(false); }
  }

  if (entry.archived) return <Card className="mt-6">{text.archived}</Card>;
  return <Card className="mt-6 grid gap-5">
    {entry.senseGroups.length > 0 && <fieldset disabled={ownMeaning} className={ownMeaning ? "opacity-50" : ""}>
      <legend className={labelClass}>{text.senses}</legend>
      <div className="mt-2 grid gap-3">{entry.senseGroups.map((group, index) => <div key={index} className="rounded-ui border border-line p-3 text-sm">
        <p className="text-muted">{group.sense || "—"}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <label className="font-bold"><input type="checkbox" checked={choice.includes(String(index))} onChange={() => toggle(String(index))} /> {text.whole}</label>
          {group.words.map((word, wordIndex) => <label key={word}><input type="checkbox" checked={choice.includes(`${index}.${wordIndex}`)} onChange={() => toggle(`${index}.${wordIndex}`)} /> {word}</label>)}
        </div>
      </div>)}</div>
    </fieldset>}
    <label className="text-sm"><input type="checkbox" checked={ownMeaning} onChange={(event) => setOwnMeaning(event.target.checked)} /> {text.own}</label>
    {ownMeaning && <label className={labelClass}>{text.meaning}<input className={fieldClass} value={meaning} onChange={(event) => setMeaning(event.target.value)} /></label>}
    <label className={labelClass}>{text.example}<textarea className={`${fieldClass} min-h-20`} value={example} onChange={(event) => setExample(event.target.value)} /></label>
    <div className="grid gap-4 md:grid-cols-3">
      <label className={labelClass}>{text.level}<select className={fieldClass} value={level} onChange={(event) => setLevel(event.target.value)}>{LEVELS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className={labelClass}>{text.ipa}<input className={fieldClass} value={ipa} onChange={(event) => setIpa(event.target.value)} /></label>
      <label className={labelClass}>{text.ipaUs}<input className={fieldClass} value={ipaUs} onChange={(event) => setIpaUs(event.target.value)} /></label>
    </div>
    {message && <div className={`rounded-ui p-3 text-sm ${message.ok ? "bg-band" : "border border-red-700"}`} role="status">{message.lines.map((line) => <p key={line}>{line}</p>)}</div>}
    <div className="flex flex-wrap gap-3">
      <Button disabled={pending} onClick={() => save(false)} variant="secondary">{text.save}</Button>
      <Button disabled={pending} onClick={() => save(true)}>{text.saveReview}</Button>
      <Button disabled={pending} variant="quiet" onClick={() => setExcluding((value) => !value)}>{text.exclude}</Button>
    </div>
    {excluding && <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
      <label className={labelClass}>{text.reason}<input className={fieldClass} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <Button disabled={pending || reason.trim().length < 3} onClick={exclude}>{text.confirmExclude}</Button>
    </div>}
  </Card>;
}
