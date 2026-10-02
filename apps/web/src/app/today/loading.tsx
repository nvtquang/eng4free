import { Skeleton } from "@/components/ui/skeleton";

/** Today shape: profile line, next lesson and the daily cards. */
export default function TodayLoading() {
  return <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24" role="status" aria-live="polite">
    <span className="sr-only">Đang tải… · Loading…</span>
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-5 h-12 w-full max-w-md" />
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton className="h-28" key={item} />)}</div>
    <Skeleton className="mt-8 h-40" />
    <div className="mt-8 grid gap-6 lg:grid-cols-2">{[0, 1, 2, 3].map((item) => <Skeleton className="h-56" key={item} />)}</div>
  </section>;
}
