import type { PublicQuestion } from "@english4free/content-schemas";

export type ContentImageValue = { src: string; alt: string; credit?: string };

export function isContentImage(value: unknown): value is ContentImageValue {
  return Boolean(value && typeof value === "object" && typeof (value as ContentImageValue).src === "string" && typeof (value as ContentImageValue).alt === "string");
}

/** A photograph or graphic attached to a question or passage, with its credit line. */
export function ContentImage({ image }: { image: ContentImageValue }) {
  return <figure className="mb-4 max-w-xl">
    {/* eslint-disable-next-line @next/next/no-img-element -- local demo media; next/image adds nothing for these static files. */}
    <img alt={image.alt} className="w-full rounded-ui border border-line bg-surface" height={420} loading="lazy" src={image.src} width={640} />
    {image.credit && <figcaption className="mt-1 text-xs text-muted">{image.credit}</figcaption>}
  </figure>;
}

/** Picture attached to a question (TOEIC Part 1 photographs). */
export function QuestionImage({ question }: { question: PublicQuestion }) {
  const image = "image" in question.content ? question.content.image : undefined;
  return image ? <ContentImage image={image} /> : null;
}
