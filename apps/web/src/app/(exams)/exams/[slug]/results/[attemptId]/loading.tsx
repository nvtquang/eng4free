import { Skeleton } from "@/components/ui/skeleton";

/** Exam runner shape: title, progress and timer, then question cards. */
export default function ExamLoading() {
  return <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24" role="status" aria-live="polite">
    <span className="sr-only">Đang tải đề… · Loading the test…</span>
    <Skeleton className="h-3 w-32" />
    <Skeleton className="mt-5 h-12 w-full max-w-lg" />
    <div className="mt-8 flex justify-between gap-4"><Skeleton className="h-6 w-40" /><Skeleton className="h-8 w-20" /></div>
    <div className="mt-8 space-y-5">{[0, 1, 2].map((item) => <Skeleton className="h-48" key={item} />)}</div>
  </section>;
}
