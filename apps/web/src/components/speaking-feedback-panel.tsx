"use client";

import type { SpeakingFeedback } from "@english4free/content-schemas";
import type { AiSpeakingCopy } from "@/lib/ai-speaking-copy";

export function SpeakingFeedbackPanel({ feedback, copy }: { feedback: SpeakingFeedback; copy: AiSpeakingCopy }) {
  const levelLabels = {
    NEEDS_WORK: copy.needsWork,
    DEVELOPING: copy.developing,
    SECURE: copy.secure
  } as const;
  const criteria = [
    [copy.taskResponse, feedback.rubric.taskResponse],
    [copy.fluency, feedback.rubric.fluency],
    [copy.grammar, feedback.rubric.grammar],
    [copy.vocabulary, feedback.rubric.vocabulary]
  ] as const;

  return (
    <div className="mt-4 rounded-ui border border-brand/20 bg-brand-soft/50 p-4 text-sm leading-6">
      <p className="font-bold text-brand">{copy.feedback}</p>
      <p className="mt-2">{feedback.summary}</p>
      <p className="mt-2 text-xs text-muted">{copy.noOfficialScore}: {copy.disclaimer}</p>
      <h3 className="mt-4 font-bold">{copy.rubric}</h3>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        {criteria.map(([label, criterion]) => (
          <div className="rounded-ui border border-line bg-surface p-3" key={label}>
            <dt className="font-medium">{label} · {levelLabels[criterion.level]}</dt>
            <dd className="mt-1 text-muted">{criterion.feedback}</dd>
          </div>
        ))}
      </dl>
      <FeedbackList title={copy.corrections} items={feedback.corrections.map((item) => `${item.original} → ${item.correction}: ${item.explanation}`)} />
      <FeedbackList title={copy.strengths} items={feedback.strengths} />
      <FeedbackList title={copy.nextSteps} items={feedback.nextSteps} />
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
        {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </div>
  );
}
