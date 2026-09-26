import type { PublicQuestion } from "@english4free/content-schemas";

/** Picture attached to a question (TOEIC Part 1 photographs). */
export function QuestionImage({ question }: { question: PublicQuestion }) {
  const image = "image" in question.content ? question.content.image : undefined;
  if (!image) return null;
  // eslint-disable-next-line @next/next/no-img-element -- local SVG/https demo media; next/image adds nothing here.
  return <img alt={image.alt} className="mb-4 w-full max-w-xl rounded-ui border border-line bg-surface" height={420} loading="lazy" src={image.src} width={640} />;
}
