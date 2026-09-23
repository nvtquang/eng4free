import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet"; children: ReactNode };

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("inline-flex min-h-11 items-center justify-center rounded-ui px-5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60", variant === "primary" && "bg-brand text-white hover:bg-brand-deep", variant === "secondary" && "border border-line bg-surface text-ink hover:border-brand", variant === "quiet" && "text-brand hover:bg-brand-soft", className)} {...props} />;
}
