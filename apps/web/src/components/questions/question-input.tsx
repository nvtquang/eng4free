"use client";

import { Fragment } from "react";
import { blankTokens, type PublicQuestion, type QuestionResponse } from "@english4free/content-schemas";
import { Button } from "@/components/ui/button";
import { LimitedAudio } from "@/components/questions/limited-audio";
import { QuestionImage } from "@/components/questions/question-image";
import type { ExamCopy } from "@/lib/exam-copy";

type Copy = ExamCopy["questions"];
type Props = { question: PublicQuestion & { id: string }; value: unknown; onChange: (response: QuestionResponse) => void; disabled?: boolean; copy: Copy; label: string };

const optionClass = "flex gap-3 rounded-ui border border-line p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-soft/40";
const fieldClass = "rounded-ui border border-line bg-surface px-3 py-2 outline-none focus:border-brand disabled:opacity-60";

function asRecord(value: unknown, key: string): Record<string, string> {
  const inner = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
  return inner && typeof inner === "object" ? inner as Record<string, string> : {};
}
function asList(value: unknown, key: string): string[] {
  const inner = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
  return Array.isArray(inner) ? inner.filter((item): item is string => typeof item === "string") : [];
}
function asText(value: unknown, key: string): string {
  const inner = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
  return typeof inner === "string" ? inner : "";
}

/** Learner input for one question of any gradable type; emits a response in that type's shape. */
export function QuestionInput(props: Props) {
  return <><QuestionImage question={props.question} /><QuestionControl {...props} /></>;
}

function QuestionControl({ question, value, onChange, disabled = false, copy, label }: Props) {
  switch (question.type) {
    case "MCQ": {
      const selected = asText(value, "optionId");
      return <fieldset><legend className="font-bold"><span className="text-brand">{label}</span> {question.content.prompt}</legend><div className="mt-3 grid gap-2">{question.content.options.map((option) => <label className={optionClass} key={option.id}><input type="radio" name={question.id} checked={selected === option.id} disabled={disabled} onChange={() => onChange({ optionId: option.id })} />{option.text}</label>)}</div></fieldset>;
    }
    case "MULTI_SELECT": {
      const selected = asList(value, "optionIds");
      const full = selected.length >= question.content.selectCount;
      const toggle = (id: string) => onChange({ optionIds: selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id] });
      return <fieldset><legend className="font-bold"><span className="text-brand">{label}</span> {question.content.prompt}</legend><p className="mt-1 text-sm text-muted">{copy.chooseCount.replace("{count}", String(question.content.selectCount))}</p><div className="mt-3 grid gap-2">{question.content.options.map((option) => { const checked = selected.includes(option.id); return <label className={optionClass} key={option.id}><input type="checkbox" checked={checked} disabled={disabled || (!checked && full)} onChange={() => toggle(option.id)} /><span><strong className="mr-2">{option.id.toUpperCase()}</strong>{option.text}</span></label>; })}</div></fieldset>;
    }
    case "TRUE_FALSE": {
      const selected = asText(value, "value");
      const labels = question.content.variant === "YES_NO_NOT_GIVEN" ? copy.yesNo : copy.trueFalse;
      const values = question.content.variant === "TRUE_FALSE" ? (["TRUE", "FALSE"] as const) : (["TRUE", "FALSE", "NOT_GIVEN"] as const);
      return <fieldset><legend className="font-bold"><span className="text-brand">{label}</span> {question.content.prompt}</legend><div className="mt-3 flex flex-wrap gap-2">{values.map((item) => <label className={optionClass + " min-w-28"} key={item}><input type="radio" name={question.id} checked={selected === item} disabled={disabled} onChange={() => onChange({ value: item })} />{labels[item]}</label>)}</div></fieldset>;
    }
    case "FILL_BLANK": {
      const blanks = asRecord(value, "blanks");
      const parts = question.content.prompt.split(/(\{\{\s*[A-Za-z0-9_-]{1,16}\s*\}\})/u);
      const tokens = blankTokens(question.content.prompt);
      return <div><p className="text-sm font-bold text-brand">{label}</p>{question.content.wordLimit && <p className="mt-1 text-sm text-muted">{copy.wordLimit.replace("{count}", String(question.content.wordLimit))}</p>}<p className="mt-2 whitespace-pre-line leading-10">{parts.map((part, index) => { const token = /^\{\{\s*([A-Za-z0-9_-]{1,16})\s*\}\}$/u.exec(part)?.[1]; if (!token) return <Fragment key={index}>{part}</Fragment>; const number = tokens.indexOf(token) + 1; return <input aria-label={`${label} · ${copy.blank} ${number}`} autoComplete="off" className={fieldClass + " mx-1 w-40 py-1"} disabled={disabled} key={index} spellCheck={false} value={blanks[token] ?? ""} onChange={(event) => onChange({ blanks: { ...blanks, [token]: event.target.value } })} />; })}</p></div>;
    }
    case "MATCHING": {
      const matches = asRecord(value, "matches");
      return <fieldset><legend className="font-bold"><span className="text-brand">{label}</span> {question.content.prompt}</legend><div className="mt-3 rounded-ui bg-band/60 p-4 text-sm"><p className="font-bold">{copy.matchOptions}</p><ul className="mt-2 grid gap-1 sm:grid-cols-2">{question.content.options.map((option) => <li key={option.id}><strong className="mr-2">{option.id.toUpperCase()}</strong>{option.text}</li>)}</ul></div><div className="mt-3 grid gap-2">{question.content.items.map((item) => <label className="flex flex-wrap items-center justify-between gap-3 rounded-ui border border-line p-3" key={item.id}><span>{item.text}</span><select aria-label={item.text} className={fieldClass} disabled={disabled} value={matches[item.id] ?? ""} onChange={(event) => onChange({ matches: { ...matches, [item.id]: event.target.value } })}><option value="">{copy.chooseMatch}</option>{question.content.options.map((option) => <option key={option.id} value={option.id}>{option.id.toUpperCase()}</option>)}</select></label>)}</div></fieldset>;
    }
    case "ORDERING": {
      const stored = asList(value, "order");
      const order = stored.length === question.content.items.length ? stored : question.content.items.map((item) => item.id);
      const byId = new Map(question.content.items.map((item) => [item.id, item]));
      const move = (index: number, offset: number) => { const next = [...order]; const [item] = next.splice(index, 1); next.splice(index + offset, 0, item!); onChange({ order: next }); };
      return <fieldset><legend className="font-bold"><span className="text-brand">{label}</span> {question.content.prompt}</legend><p className="mt-1 text-sm text-muted">{copy.reorderHint}</p><ol className="mt-3 grid gap-2">{order.map((id, index) => <li className="flex items-center gap-3 rounded-ui border border-line p-3" key={id}><span className="w-6 text-sm font-bold text-muted">{index + 1}.</span><span className="flex-1">{byId.get(id)?.text}</span><Button aria-label={`${copy.moveUp}: ${byId.get(id)?.text}`} className="min-h-8 px-3" disabled={disabled || index === 0} variant="secondary" onClick={() => move(index, -1)}>↑</Button><Button aria-label={`${copy.moveDown}: ${byId.get(id)?.text}`} className="min-h-8 px-3" disabled={disabled || index === order.length - 1} variant="secondary" onClick={() => move(index, 1)}>↓</Button></li>)}</ol></fieldset>;
    }
    case "DICTATION":
      return <div><p className="font-bold"><span className="text-brand">{label}</span> {question.content.prompt}</p><DictationAudio copy={copy} mediaId={question.content.mediaId} audioUrl={question.content.audioUrl} playbackText={question.content.playbackText} maxPlays={question.content.maxPlays} /><textarea aria-label={label} className={fieldClass + " mt-3 min-h-24 w-full leading-7"} disabled={disabled} placeholder={copy.dictationPlaceholder} spellCheck={false} value={asText(value, "text")} onChange={(event) => onChange({ text: event.target.value })} /></div>;
  }
}

function DictationAudio({ copy, mediaId, audioUrl, playbackText, maxPlays }: { copy: Copy; mediaId?: string; audioUrl?: string; playbackText?: string; maxPlays: number }) {
  const url = mediaId ? `/api/content-media/${mediaId}` : audioUrl;
  return <div className="mt-3"><LimitedAudio url={url} text={playbackText} limit={maxPlays} lang="en-GB" rate={0.85} variant="secondary" labels={{ play: copy.playDictation, playing: copy.playing, unavailable: copy.audioUnavailable }} /></div>;
}
