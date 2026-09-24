"use client";

import type { aiFeedbackCopy } from "@/lib/ai-feedback-copy";

export type WritingFeedbackView = {
  summary: string;
  rubric: Record<"taskResponse" | "coherenceAndCohesion" | "lexicalResource" | "grammaticalRangeAndAccuracy", { level: "NEEDS_WORK" | "DEVELOPING" | "SECURE"; feedback: string }>;
  grammarIssues: Array<{ message: string; suggestion?: string }>;
  vocabularyIssues: Array<{ message: string; suggestion?: string }>;
  coherenceIssues: string[];
  revisionSuggestions: string[];
  rubricDisclaimer: string;
};

type Copy = (typeof aiFeedbackCopy)[keyof typeof aiFeedbackCopy];
const rubricLabels = { taskResponse: "Task response", coherenceAndCohesion: "Coherence & cohesion", lexicalResource: "Vocabulary", grammaticalRangeAndAccuracy: "Grammar" } as const;
const levelLabels = { NEEDS_WORK: "Needs work", DEVELOPING: "Developing", SECURE: "Secure" } as const;

export function WritingFeedbackPanel({ feedback, copy }: { feedback: WritingFeedbackView; copy: Copy }) {
  return <section className="mt-6 rounded-ui border border-brand/20 bg-brand-soft/50 p-5 text-sm leading-6" aria-live="polite">
    <p className="font-bold text-brand">{copy.aiFeedback}</p>
    <p className="mt-2">{feedback.summary}</p>
    <p className="mt-2 text-xs text-muted">{copy.notOfficialBand}: {feedback.rubricDisclaimer}</p>
    <h3 className="mt-5 font-bold">{copy.rubric}</h3>
    <dl className="mt-2 grid gap-3 sm:grid-cols-2">{(Object.keys(rubricLabels) as Array<keyof typeof rubricLabels>).map((key) => <div className="rounded-ui border border-line bg-surface p-3" key={key}><dt className="font-medium">{rubricLabels[key]} · {levelLabels[feedback.rubric[key].level]}</dt><dd className="mt-1 text-muted">{feedback.rubric[key].feedback}</dd></div>)}</dl>
    <FeedbackList title={copy.grammar} items={feedback.grammarIssues.map((item) => item.suggestion ? `${item.message} → ${item.suggestion}` : item.message)} />
    <FeedbackList title={copy.vocabulary} items={feedback.vocabularyIssues.map((item) => item.suggestion ? `${item.message} → ${item.suggestion}` : item.message)} />
    <FeedbackList title={copy.coherence} items={feedback.coherenceIssues} />
    <FeedbackList title={copy.revisionSuggestions} items={feedback.revisionSuggestions} />
  </section>;
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return <div className="mt-4"><h3 className="font-bold">{title}</h3><ul className="mt-1 list-disc space-y-1 pl-5 text-muted">{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul></div>;
}
