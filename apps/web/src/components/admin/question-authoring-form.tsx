"use client";

import { useMemo, useState, type FormEvent } from "react";
import { buildQuestionFromAuthoring, GRADABLE_QUESTION_TYPES, splitAuthoringList, type GradableQuestionType, type QuestionAuthoring } from "@english4free/content-schemas";
import { Button } from "@/components/ui/button";

type Part = { id: string; examTitle: string; partNumber: number; title: string };
type Passage = { id: string; title: string | null };
type Request = (operation: string, payload: Record<string, unknown>, message: string) => Promise<boolean>;

const fieldClass = "mt-1 w-full rounded-ui border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand";
const labelClass = "block text-sm font-bold";
const LETTERS = "ABCDEF";

const copy = {
  vi: {
    type: "Dạng câu hỏi", part: "Phần thi", passage: "Bài đọc / transcript", none: "Không gắn", prompt: "Đề bài", option: "Lựa chọn", correct: "Đáp án đúng", accepted: "Đáp án được chấp nhận", items: "Các mục (mỗi dòng một mục)", audio: "Câu được đọc (nếu khác đáp án)", wordLimit: "Giới hạn số từ mỗi ô", explanation: "Giải thích", tags: "Nhãn, cách nhau bằng dấu phẩy", submit: "Thêm câu hỏi", saving: "Đang lưu…", done: "Đã thêm câu hỏi. Đáp án vẫn được giữ ở server.", valid: "Hợp lệ", preview: "Kiểm tra",
    types: { MCQ: "Trắc nghiệm một đáp án", MULTI_SELECT: "Chọn nhiều đáp án", TRUE_FALSE: "True / False / Not Given", FILL_BLANK: "Điền vào chỗ trống", MATCHING: "Nối (matching)", ORDERING: "Sắp xếp thứ tự", DICTATION: "Nghe – chép chính tả" },
    hints: { MCQ: "Nhập các lựa chọn và một chữ cái đáp án, ví dụ B.", MULTI_SELECT: "Nhập đáp án là các chữ cái, ví dụ A, D. Người học phải chọn đúng số lượng đó.", TRUE_FALSE: "Đáp án: True, False, Not Given (hoặc Yes, No, Not Given).", FILL_BLANK: "Đánh dấu chỗ trống bằng ___ trong đề bài. Đáp án: các ô cách nhau bằng dấu ; và các cách viết được chấp nhận cách nhau bằng dấu |, ví dụ: 10:30 | 10.30; B12.", MATCHING: "Mục bên trái nhập mỗi dòng một mục; lựa chọn bên phải nhập vào A–F. Đáp án là một chữ cái cho mỗi mục, ví dụ C, A, B.", ORDERING: "Nhập các mục theo ĐÚNG thứ tự; hệ thống sẽ tự xáo trộn khi hiển thị.", DICTATION: "Nhập các câu được chấp nhận, cách nhau bằng dấu |. Không phân biệt hoa/thường và dấu câu." }
  },
  en: {
    type: "Question type", part: "Exam part", passage: "Passage / transcript", none: "None", prompt: "Prompt", option: "Option", correct: "Correct answer", accepted: "Accepted answers", items: "Items (one per line)", audio: "Spoken sentence (if different from the answer)", wordLimit: "Word limit per blank", explanation: "Explanation", tags: "Tags, separated by commas", submit: "Add question", saving: "Saving…", done: "Question added. The answer key remains on the server.", valid: "Valid", preview: "Check",
    types: { MCQ: "Multiple choice (one answer)", MULTI_SELECT: "Multiple selection", TRUE_FALSE: "True / False / Not Given", FILL_BLANK: "Fill in the blanks", MATCHING: "Matching", ORDERING: "Ordering", DICTATION: "Dictation" },
    hints: { MCQ: "Enter the options and one correct letter, for example B.", MULTI_SELECT: "Enter the correct letters, for example A, D. Learners must choose exactly that many.", TRUE_FALSE: "Answer: True, False, Not Given (or Yes, No, Not Given).", FILL_BLANK: "Mark each blank with ___ in the prompt. Answers: separate blanks with ; and alternatives with |, for example: 10:30 | 10.30; B12.", MATCHING: "Enter left-side items one per line and right-side choices in A–F. The answer is one letter per item, for example C, A, B.", ORDERING: "Enter the items in the CORRECT order; they are shuffled automatically for learners.", DICTATION: "Enter accepted sentences separated by |. Case and punctuation are ignored." }
  }
} as const;

const uses = {
  options: new Set<GradableQuestionType>(["MCQ", "MULTI_SELECT", "MATCHING"]),
  correct: new Set<GradableQuestionType>(["MCQ", "MULTI_SELECT", "TRUE_FALSE", "MATCHING"]),
  accepted: new Set<GradableQuestionType>(["FILL_BLANK", "DICTATION"]),
  items: new Set<GradableQuestionType>(["MATCHING", "ORDERING"])
};

function authoringFrom(form: FormData, type: GradableQuestionType): QuestionAuthoring {
  const text = (name: string) => String(form.get(name) ?? "").trim();
  const wordLimit = Number(text("wordLimit"));
  return {
    type, prompt: text("prompt"),
    options: uses.options.has(type) ? LETTERS.split("").map((letter) => text(`option-${letter}`)) : [],
    correct: uses.correct.has(type) ? text("correct") : undefined,
    acceptedAnswers: uses.accepted.has(type) ? text("acceptedAnswers") : undefined,
    items: uses.items.has(type) ? splitAuthoringList(text("items").replace(/\|/gu, "\n")) : [],
    audioText: type === "DICTATION" ? text("audioText") || undefined : undefined,
    wordLimit: type === "FILL_BLANK" && wordLimit > 0 ? wordLimit : undefined
  };
}

/** CMS form for every gradable type; validates with the same rules the server and importer use. */
export function QuestionAuthoringForm({ locale, parts, passages, request, pending }: { locale: "vi" | "en"; parts: Part[]; passages: Passage[]; request: Request; pending: boolean }) {
  const t = copy[locale];
  const [type, setType] = useState<GradableQuestionType>("MCQ");
  const [check, setCheck] = useState<{ ok: boolean; message: string } | null>(null);
  const hint = useMemo(() => t.hints[type], [t, type]);

  function validate(form: HTMLFormElement) {
    const result = buildQuestionFromAuthoring(authoringFrom(new FormData(form), type));
    setCheck(result.success ? { ok: true, message: t.valid } : { ok: false, message: result.error });
    return result.success;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validate(form)) return;
    const data = new FormData(form);
    void request("question", {
      examPartId: data.get("examPartId"), passageId: String(data.get("passageId") ?? "") || undefined,
      explanation: String(data.get("explanation") ?? "").trim(),
      tags: String(data.get("tags") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
      authoring: authoringFrom(data, type)
    }, t.done).then((saved) => { if (saved) { form.reset(); setType("MCQ"); setCheck(null); } });
  }

  return <form className="grid gap-4 md:grid-cols-2" onChange={() => setCheck(null)} onSubmit={submit}>
    <label className={labelClass}>{t.part}<select className={fieldClass} name="examPartId" required>{parts.map((item) => <option key={item.id} value={item.id}>{item.examTitle} · {item.partNumber} · {item.title}</option>)}</select></label>
    <label className={labelClass}>{t.passage}<select className={fieldClass} name="passageId"><option value="">{t.none}</option>{passages.map((item) => <option key={item.id} value={item.id}>{item.title ?? item.id.slice(0, 8)}</option>)}</select></label>
    <label className={labelClass + " md:col-span-2"}>{t.type}<select className={fieldClass} name="type" value={type} onChange={(event) => setType(event.target.value as GradableQuestionType)}>{GRADABLE_QUESTION_TYPES.map((item) => <option key={item} value={item}>{t.types[item]}</option>)}</select></label>
    <p className="rounded-ui bg-band p-3 text-sm text-muted md:col-span-2">{hint}</p>
    <label className={labelClass + " md:col-span-2"}>{t.prompt}<textarea className={fieldClass + " min-h-24"} name="prompt" required /></label>
    {uses.items.has(type) && <label className={labelClass + " md:col-span-2"}>{t.items}<textarea className={fieldClass + " min-h-28"} name="items" required /></label>}
    {uses.options.has(type) && LETTERS.split("").map((letter, index) => <label className={labelClass} key={letter}>{t.option} {letter}<input className={fieldClass} name={`option-${letter}`} required={index < 2} /></label>)}
    {uses.correct.has(type) && <label className={labelClass}>{t.correct}<input className={fieldClass} name="correct" required /></label>}
    {uses.accepted.has(type) && <label className={labelClass + " md:col-span-2"}>{t.accepted}<textarea className={fieldClass + " min-h-20"} name="acceptedAnswers" required /></label>}
    {type === "FILL_BLANK" && <label className={labelClass}>{t.wordLimit}<input className={fieldClass} name="wordLimit" type="number" min={1} max={5} /></label>}
    {type === "DICTATION" && <label className={labelClass + " md:col-span-2"}>{t.audio}<input className={fieldClass} name="audioText" /></label>}
    <label className={labelClass}>{t.tags}<input className={fieldClass} name="tags" /></label>
    <label className={labelClass + " md:col-span-2"}>{t.explanation}<textarea className={fieldClass + " min-h-20"} name="explanation" required /></label>
    {check && <p className={"text-sm md:col-span-2 " + (check.ok ? "text-brand" : "text-red-700")} role={check.ok ? "status" : "alert"}>{check.message}</p>}
    <div className="flex flex-wrap gap-3 md:col-span-2"><Button variant="secondary" onClick={(event) => { const form = event.currentTarget.form; if (form) validate(form); }}>{t.preview}</Button><Button type="submit" disabled={pending}>{pending ? t.saving : t.submit}</Button></div>
  </form>;
}
