import { cn } from "@/lib/cn";

/** A grey placeholder block shown while a page loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-ui bg-band", className)} />;
}

/** Page-shaped loading state: a heading, an intro line and a few cards. */
export function PageSkeleton({ cards = 3, label = "Đang tải… · Loading…" }: { cards?: number; label?: string }) {
  return <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24" role="status" aria-live="polite">
    <span className="sr-only">{label}</span>
    <Skeleton className="h-3 w-28" />
    <Skeleton className="mt-5 h-12 w-full max-w-xl" />
    <Skeleton className="mt-5 h-5 w-full max-w-2xl" />
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: cards }, (_, index) => <Skeleton className="h-40" key={index} />)}</div>
  </section>;
}
