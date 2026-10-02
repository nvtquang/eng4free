"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/section";
import { reportClientError } from "@/lib/report-client-error";

const copy = {
  vi: { eyebrow: "Có lỗi xảy ra", title: "Trang này chưa tải được", text: "Tiến độ học của bạn đã được lưu. Hãy thử tải lại; nếu vẫn lỗi, quay về trang chủ rồi thử lại sau ít phút.", retry: "Thử lại", home: "Về trang chủ", code: "Mã lỗi" },
  en: { eyebrow: "Something went wrong", title: "This page could not load", text: "Your learning progress is saved. Try again; if it still fails, go back to the home page and try again in a few minutes.", retry: "Try again", home: "Back to home", code: "Error code" }
} as const;

/** Errors inside a page: the header, footer and navigation stay usable. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale, setLocale] = useState<"vi" | "en">("vi");
  useEffect(() => { setLocale(document.documentElement.lang === "en" ? "en" : "vi"); }, []);
  useEffect(() => { console.error(error); reportClientError(error); }, [error]);
  const text = copy[locale];
  return <Section className="max-w-3xl" role="alert">
    <Eyebrow>{text.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{text.title}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{text.text}</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <Button onClick={reset}>{text.retry}</Button>
      <Link href="/"><Button variant="secondary">{text.home}</Button></Link>
    </div>
    {error.digest && <p className="mt-6 text-xs text-muted">{text.code}: {error.digest}</p>}
  </Section>;
}
