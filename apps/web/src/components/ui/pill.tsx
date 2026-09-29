import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A rounded selector chip used for level pickers, filters and tool links. Renders a Link when `href` is set, otherwise a button (client only). */
export function Pill({ href, onClick, active = false, ariaCurrent = false, className, children }: { href?: string; onClick?: () => void; active?: boolean; ariaCurrent?: boolean; className?: string; children: ReactNode }) {
  const classes = cn("inline-flex rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand", active ? "bg-brand text-white" : "bg-band text-muted hover:bg-brand-soft hover:text-brand-deep", className);
  if (href) return <Link href={href} aria-current={active && ariaCurrent ? "page" : undefined} className={classes}>{children}</Link>;
  return <button type="button" aria-pressed={active} onClick={onClick} className={classes}>{children}</button>;
}
