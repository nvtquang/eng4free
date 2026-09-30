"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { Locale, Messages } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

type Viewer = { name: string | null; email: string } | null;

/** Which main section a path belongs to, so the header can mark it as current. */
const sections: Array<[string, string[]]> = [
  ["/today", ["/today"]],
  ["/learn", ["/learn"]],
  ["/skills", ["/skills", "/vocabulary", "/grammar", "/pronunciation", "/mistakes"]],
  ["/exam-prep", ["/exam-prep", "/toeic", "/ielts", "/exams"]]
];

export function SiteHeader({ locale, messages, viewer }: { locale: Locale; messages: Messages; viewer: Viewer }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const labels: Record<string, string> = { "/today": messages.nav.today, "/learn": messages.nav.path, "/skills": messages.nav.practice, "/exam-prep": messages.nav.examPrep };
  const current = sections.find(([, prefixes]) => prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/")))?.[0];
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown); }, []);
  useEffect(() => setOpen(false), [pathname]);

  return <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
    <Link href="/" className="font-serif text-xl font-bold tracking-tight text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">English <span className="text-brand">4 Free</span></Link>
    <nav className="hidden items-center gap-1 lg:flex" aria-label={messages.common.primaryNavigation}>{sections.map(([href]) => <Link aria-current={current === href ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${current === href ? "bg-brand-soft text-brand-deep" : "text-muted hover:text-brand"}`} href={href} key={href}>{labels[href]}</Link>)}</nav>
    <div className="flex items-center gap-2">
      <LanguageSwitcher locale={locale} label={messages.common.language} />
      <div className="hidden sm:block"><AccountMenu viewer={viewer} messages={messages} /></div>
      <button className="grid size-11 place-items-center rounded-ui border border-line text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden" aria-label={open ? messages.common.close : messages.common.menu} aria-expanded={open} onClick={() => setOpen((value) => !value)}><span aria-hidden="true" className="text-xl">{open ? "×" : "☰"}</span></button>
    </div>
  </div>{open && <div className="border-t border-line bg-surface px-5 py-5 shadow-card lg:hidden">
    <nav className="grid gap-1" aria-label={messages.common.mobileNavigation}>{sections.map(([href]) => <Link aria-current={current === href ? "page" : undefined} className={`rounded-ui px-3 py-3 text-sm font-bold hover:bg-brand-soft ${current === href ? "bg-brand-soft text-brand-deep" : "text-ink"}`} href={href} key={href}>{labels[href]}</Link>)}</nav>
    <div className="mt-4 grid gap-1 border-t border-line pt-4 sm:hidden">
      {viewer && <p className="flex items-center gap-2.5 px-3 py-2"><Avatar viewer={viewer} /><span className="truncate text-sm font-bold text-ink">{viewer.name || viewer.email}</span></p>}
      <Link className="rounded-ui px-3 py-3 text-sm font-bold text-ink hover:bg-brand-soft" href="/dashboard">{messages.account.progress}</Link>
      <Link className="rounded-ui px-3 py-3 text-sm font-bold text-ink hover:bg-brand-soft" href="/profile">{messages.account.profile}</Link>
      {viewer ? <button className="rounded-ui px-3 py-3 text-left text-sm font-bold text-muted hover:bg-brand-soft" onClick={() => void signOut({ callbackUrl: "/" })}>{messages.common.logout}</button> : <Link className="mt-2" href="/login"><Button variant="secondary">{messages.common.login}</Button></Link>}
    </div>
  </div>}</header>;
}

/** Avatar button with Progress, Learning profile and Log in / Log out. Guests get it too, since their progress is real. */
function AccountMenu({ viewer, messages }: { viewer: Viewer; messages: Messages }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const item = "block rounded-ui px-3 py-2 text-sm font-bold text-ink hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand";
  return <div className="relative" ref={ref}>
    <button aria-haspopup="menu" aria-expanded={open} aria-label={messages.account.menu} onClick={() => setOpen((value) => !value)} className="flex max-w-52 min-w-0 items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-4 transition hover:border-brand hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      {viewer ? <Avatar viewer={viewer} /> : <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-band text-muted"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg></span>}
      <span className="truncate text-sm font-bold text-ink">{viewer ? viewer.name || viewer.email : messages.account.guest}</span>
    </button>
    {open && <div role="menu" className="absolute right-0 mt-2 w-64 rounded-ui border border-line bg-surface p-2 shadow-card">
      {viewer ? <p className="truncate px-3 py-2 text-xs text-muted">{viewer.email}</p> : <p className="px-3 py-2 text-xs leading-5 text-muted">{messages.account.guestNote}</p>}
      <Link role="menuitem" className={item} href="/dashboard" onClick={() => setOpen(false)}>{messages.account.progress}</Link>
      <Link role="menuitem" className={item} href="/profile" onClick={() => setOpen(false)}>{messages.account.profile}</Link>
      <div className="my-1 border-t border-line" />
      {viewer
        ? <button role="menuitem" className={`${item} w-full text-left text-muted`} onClick={() => void signOut({ callbackUrl: "/" })}>{messages.common.logout}</button>
        : <Link role="menuitem" className={`${item} text-brand`} href="/login" onClick={() => setOpen(false)}>{messages.common.login}</Link>}
    </div>}
  </div>;
}

function Avatar({ viewer }: { viewer: { name: string | null; email: string } }) {
  const initial = (viewer.name || viewer.email).trim().charAt(0).toUpperCase();
  return <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-accent-navy text-sm font-bold text-white shadow-card">{initial}</span>;
}
