"use client";

import { useEffect, useRef, useState } from "react";
import type { Messages } from "@/lib/i18n";

type Turn = { role: "user" | "assistant"; content: string };

function RobotIcon({ size = 26 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v3" /><circle cx="12" cy="2.5" r="1" fill="currentColor" stroke="none" />
    <rect x="4" y="6" width="16" height="12" rx="3" />
    <circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <path d="M9.5 15.5h5" /><path d="M2 11v3" /><path d="M22 11v3" />
  </svg>;
}

/** Floating, general-purpose helper chatbot for quick English/website questions. */
export function AiAssistantWidget({ copy, name }: { copy: Messages["assistant"]; name: string | null }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greeting = copy.welcome.replace("{name}", name?.trim() || copy.friend);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [turns, pending]);

  async function send() {
    const question = draft.trim();
    if (!question || pending) return;
    const next: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(next); setDraft(""); setPending(true);
    try {
      const response = await fetch("/api/ai/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const body = await response.json().catch(() => ({})) as { reply?: string; error?: string };
      const reply = response.ok && body.reply ? body.reply : response.status === 429 ? copy.rateLimited : copy.unavailable;
      setTurns((current) => [...current, { role: "assistant", content: reply }]);
    } catch {
      setTurns((current) => [...current, { role: "assistant", content: copy.unavailable }]);
    } finally { setPending(false); }
  }

  return <>
    {open && <div role="dialog" aria-label={copy.title} className="fixed bottom-24 right-4 left-4 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-[1.1rem] border border-line bg-surface shadow-card sm:left-auto sm:w-96">
      <div className="flex items-center gap-2.5 border-b border-line bg-brand px-4 py-3 text-white">
        <span className="grid size-8 place-items-center rounded-full bg-white/15"><RobotIcon size={18} /></span>
        <p className="font-serif text-lg font-bold">{copy.title}</p>
        <button className="ml-auto rounded-ui px-2 py-1 text-sm font-bold text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" onClick={() => setOpen(false)} aria-label={copy.close}>×</button>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="rounded-ui bg-brand-soft p-3 text-sm leading-6">{greeting}</div>
        {turns.map((turn, index) => <div key={index} className={`max-w-[85%] rounded-ui p-3 text-sm leading-6 ${turn.role === "user" ? "ml-auto bg-band" : "bg-brand-soft"}`}>{turn.content}</div>)}
        {pending && <div className="rounded-ui bg-brand-soft p-3 text-sm text-muted" role="status">{copy.thinking}</div>}
      </div>
      <div className="flex items-center gap-2 border-t border-line p-3">
        <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void send(); }} disabled={pending} placeholder={copy.placeholder} aria-label={copy.placeholder} className="min-h-10 flex-1 rounded-ui border border-line bg-canvas px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60" />
        <button onClick={() => void send()} disabled={pending || !draft.trim()} className="grid size-10 shrink-0 place-items-center rounded-ui bg-brand text-white transition hover:bg-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50" aria-label={copy.send}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
        </button>
      </div>
    </div>}
    <button onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={copy.open} className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-brand text-white shadow-card transition hover:bg-brand-deep hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      {open ? <span className="text-2xl leading-none" aria-hidden="true">×</span> : <RobotIcon />}
    </button>
  </>;
}
