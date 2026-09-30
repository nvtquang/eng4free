"use client";

import { SpeakingPractice } from "@/components/speaking-practice";
import { TopicBrowser } from "@/components/topic-browser";
import type { AiSpeakingCopy } from "@/lib/ai-speaking-copy";
import type { TopicCategory } from "@/modules/topics/repository";

type SkillsCopy = ReturnType<typeof import("@/lib/skills-copy").getSkillsCopy>;

/** Free-talk speaking topics; each topic has its own recorder and history. */
export function SpeakingTopics({ categories, copy, aiCopy }: { categories: TopicCategory[]; copy: SkillsCopy; aiCopy: AiSpeakingCopy }) {
  return <TopicBrowser
    categories={categories}
    labels={{ heading: aiCopy.topicsTitle, suggestionsTitle: aiCopy.suggestionsTitle, basicLabel: aiCopy.basicLabel, advancedLabel: aiCopy.advancedLabel }}
    renderPractice={(topic) => <SpeakingPractice key={topic.id} copy={copy} aiCopy={aiCopy} prompt={topic.prompt} topicId={topic.id} />}
  />;
}
