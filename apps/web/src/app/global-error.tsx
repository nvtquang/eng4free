"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";

/**
 * Last resort when the root layout itself fails: it replaces the whole document, so it carries
 * its own <html>, inline styles and both languages (the locale cannot be read here).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { reportClientError(error); }, [error]);
  return <html lang="vi">
    <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f5ef", color: "#202522", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <main style={{ maxWidth: 560, padding: 24 }} role="alert">
        <p style={{ fontWeight: 700, color: "#506a58" }}>English 4 Free</p>
        <h1 style={{ fontSize: 32, margin: "12px 0" }}>Có lỗi xảy ra · Something went wrong</h1>
        <p style={{ lineHeight: 1.7, color: "#5c635d" }}>Tiến độ học của bạn đã được lưu. Hãy thử tải lại trang.<br />Your progress is saved. Please reload the page.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="button" onClick={reset} style={{ background: "#506a58", color: "#fff", border: 0, borderRadius: 8, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}>Thử lại · Try again</button>
          <Link href="/" style={{ border: "1px solid #ddd9cf", borderRadius: 8, padding: "12px 20px", fontWeight: 700, color: "#202522", textDecoration: "none" }}>Trang chủ · Home</Link>
        </div>
        {error.digest && <p style={{ marginTop: 20, fontSize: 12, color: "#5c635d" }}>{error.digest}</p>}
      </main>
    </body>
  </html>;
}
