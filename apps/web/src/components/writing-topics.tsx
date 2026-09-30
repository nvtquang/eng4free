"use client";

import { TopicBrowser } from "@/components/topic-browser";
import { WritingWorkspace } from "@/components/writing-workspace";
import type { TopicCategory } from "@/modules/topics/repository";

type SkillsCopy = ReturnType<typeof import("@/lib/skills-copy").getSkillsCopy>;
type FeedbackCopy = (typeof import("@/lib/ai-feedback-copy").aiFeedbackCopy)[keyof typeof import("@/lib/ai-feedback-copy").aiFeedbackCopy];

/** Free-writing topics; each topic keeps its own drafts and history. */
export function WritingTopics({ categories, copy, feedbackCopy }: { categories: TopicCategory[]; copy: SkillsCopy; feedbackCopy: FeedbackCopy }) {
  return <TopicBrowser
    categories={categories}
    labels={{ heading: copy.writingTopicsTitle, suggestionsTitle: copy.phrasesTitle, basicLabel: copy.basicLabel, advancedLabel: copy.advancedLabel }}
    renderPractice={(topic) => <WritingWorkspace key={topic.id} copy={copy} feedbackCopy={feedbackCopy} prompt={topic.prompt} task={{ topicId: topic.id, taskType: "GENERAL", examType: null }} />}
  />;
}
