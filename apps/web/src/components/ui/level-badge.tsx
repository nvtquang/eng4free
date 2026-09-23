import { cn } from "@/lib/cn";

export function LevelBadge({ children, className }: { children: string; className?: string }) {
  return <span className={cn("inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep", className)}>{children}</span>;
}
