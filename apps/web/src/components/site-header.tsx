"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale, Messages } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

export function SiteHeader({ locale, messages, viewer }: { locale: Locale; messages: Messages; viewer: { name: string | null; email: string } | null }) {
  const [open, setOpen] = useState(false);
  const nav = [["/learn", messages.nav.learn], ["/skills", messages.nav.skills], ["/vocabulary", messages.nav.vocabulary], ["/grammar", messages.nav.grammar], ["/pronunciation", messages.nav.pronunciation], ["/toeic", messages.nav.toeic], ["/ielts", messages.nav.ielts]] as const;
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown); }, []);
  return <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
    <Link href="/" className="font-serif text-xl font-bold tracking-tight text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">English <span className="text-brand">4 Free</span></Link>
    <nav className="hidden items-center gap-5 lg:flex" aria-label={messages.common.primaryNavigation}>{nav.map(([href, label]) => <Link className="text-sm font-semibold text-muted transition hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" href={href} key={href}>{label}</Link>)}</nav>
    <div className="flex items-center gap-2"><LanguageSwitcher locale={locale} label={messages.common.language} /><div className="hidden items-center gap-3 sm:flex">{viewer ? <AvatarLink viewer={viewer} /> : <Link className="text-sm font-bold text-brand hover:text-brand-deep" href="/login">{messages.common.login}</Link>}</div><button className="grid size-11 place-items-center rounded-ui border border-line text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:hidden" aria-label={open ? messages.common.close : messages.common.menu} aria-expanded={open} onClick={() => setOpen((value) => !value)}><span aria-hidden="true" className="text-xl">{open ? "×" : "☰"}</span></button></div>
  </div>{open && <div className="border-t border-line bg-surface px-5 py-5 shadow-card sm:hidden"><nav className="grid gap-1" aria-label={messages.common.mobileNavigation}>{nav.map(([href, label]) => <Link className="rounded-ui px-3 py-3 text-sm font-bold text-ink hover:bg-brand-soft" href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav><div className="mt-5 flex items-center justify-between border-t border-line pt-5">{viewer ? <Link className="flex min-w-0 items-center gap-2.5" href="/dashboard" onClick={() => setOpen(false)}><Avatar viewer={viewer} /><span className="truncate text-sm font-bold text-ink">{viewer.name || viewer.email}</span></Link> : <Link href="/login" onClick={() => setOpen(false)}><Button variant="secondary">{messages.common.login}</Button></Link>}</div></div>}</header>;
}

function Avatar({ viewer }: { viewer: { name: string | null; email: string } }) {
  const initial = (viewer.name || viewer.email).trim().charAt(0).toUpperCase();
  return <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-accent-navy text-sm font-bold text-white shadow-card">{initial}</span>;
}

function AvatarLink({ viewer }: { viewer: { name: string | null; email: string } }) {
  return <Link className="flex max-w-52 min-w-0 items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-4 transition hover:border-brand hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href="/dashboard" title={viewer.email}><Avatar viewer={viewer} /><span className="truncate text-sm font-bold text-ink">{viewer.name || viewer.email}</span></Link>;
}
