import type { MetadataRoute } from "next";
import { listPublicExams } from "@/modules/exams/exam-engine";
import { lessonHref, listPathLessons } from "@/modules/path/repository";
import { languageAlternates, siteUrl } from "@/lib/metadata";

// Built from the database on request, so new published content appears without a rebuild.
export const dynamic = "force-dynamic";

const staticPaths = ["/", "/learn", "/grammar", "/vocabulary", "/pronunciation", "/skills", "/skills/listening", "/skills/reading", "/skills/speaking", "/skills/writing", "/exam-prep", "/toeic", "/ielts", "/ielts/writing", "/ielts/speaking", "/about", "/privacy", "/terms"];

/**
 * Every public page with its own canonical URL (pages filtered by a query parameter point their
 * canonical at the unfiltered page, so they are left out). Each entry is the Vietnamese URL,
 * with the English version (`?lang=en`) as an hreflang alternate.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const absolute = (path: string) => new URL(path, base).toString();
  const entry = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly"): MetadataRoute.Sitemap[number] => ({
    url: absolute(path),
    changeFrequency,
    priority,
    alternates: { languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([language, href]) => [language, absolute(href)])) }
  });

  const [lessons, toeic, ielts] = await Promise.all([
    listPathLessons().catch(() => []),
    listPublicExams("TOEIC").catch(() => []),
    listPublicExams("IELTS").catch(() => [])
  ]);

  return [
    ...staticPaths.map((path) => entry(path, path === "/" ? 1 : 0.8, path === "/" ? "weekly" : "monthly")),
    ...lessons.map((lesson) => entry(lessonHref(lesson), 0.7)),
    ...[...toeic, ...ielts].map((exam) => entry(`/exams/${exam.slug}`, 0.7))
  ];
}
