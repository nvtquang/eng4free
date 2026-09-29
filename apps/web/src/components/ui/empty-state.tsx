import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/** Consistent empty/idle state: a soft card with a title and optional supporting content. */
export function EmptyState({ title, className, children }: { title: string; className?: string; children?: ReactNode }) {
  return <Card className={cn("bg-brand-soft", className)} role="status">
    <h2 className="font-serif text-2xl font-bold">{title}</h2>
    {children && <div className="mt-3 leading-7 text-muted">{children}</div>}
  </Card>;
}
