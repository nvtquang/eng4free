import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs font-bold uppercase tracking-[0.16em] text-brand", className)} {...props} />;
}
