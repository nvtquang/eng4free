"use client";

import { SpeakingPractice } from "@/components/speaking-practice";
import { TopicBrowser } from "@/components/topic-browser";
import type { AiSpeakingCopy } from "@/lib/ai-speaking-copy";
import type { SpeakingCategory } from "@/lib/speaking-topics";

type SkillsCopy = ReturnType<typeof import("@/lib/skills-copy").getSkillsCopy>;

/** Free-talk speaking topics; each topic has its own recorder and history (promptId `free-talk:<id>`). */
export function SpeakingTopics({ categories, copy, aiCopy }: { categories: SpeakingCategory[]; copy: SkillsCopy; aiCopy: AiSpeakingCopy }) {
  return <TopicBrowser
    categories={categories}
    labels={{ heading: aiCopy.topicsTitle, suggestionsTitle: aiCopy.suggestionsTitle, basicLabel: aiCopy.basicLabel, advancedLabel: aiCopy.advancedLabel }}
    renderPractice={(topic) => <SpeakingPractice key={topic.id} copy={copy} aiCopy={aiCopy} prompt={topic.prompt} promptId={`free-talk:${topic.id}`} />}
  />;
}
