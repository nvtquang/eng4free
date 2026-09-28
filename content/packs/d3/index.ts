import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BatchKey, ExamDef, LessonDef, PromptDef, VocabularySelection } from "./types";
import { grammarLessons } from "./lessons/grammar";
import { skillLessons } from "./lessons/skills";
import { toeicExams } from "./toeic";
import { ieltsExams, ieltsPrompts } from "./ielts";
import { vocabularyExamples } from "./vocabulary/examples";

export const D3_VERSION = "d3-1";
const packRoot = resolve(process.cwd(), "content/packs/d3");

/** One content batch per area, so each can be reviewed and published on its own. */
export const d3Batches: Record<BatchKey, { key: BatchKey; title: string; source: string; license: string; generatedBy: string }> = {
  lessons: { key: "lessons", title: "CEFR skill lessons", source: "https://github.com/nvtquang/eng4free/tree/main/content/packs/d3/lessons", license: "English 4 Free original content", generatedBy: "AI-drafted (Claude, Anthropic); human spot review" },
  grammar: { key: "grammar", title: "Grammar topics", source: "https://github.com/nvtquang/eng4free/tree/main/content/packs/d3/lessons", license: "English 4 Free original content", generatedBy: "AI-drafted (Claude, Anthropic); human spot review" },
  vocabulary: { key: "vocabulary", title: "CEFR vocabulary", source: "https://github.com/nvtquang/eng4free/tree/main/content/packs/d3/vocabulary", license: "Meanings and IPA: English Wiktionary, CC BY-SA 4.0 · Levels: Words-CEFR (MIT), Octanove C1/C2 (CC BY-SA 4.0) · Examples: English 4 Free original", generatedBy: "Sourced data; example sentences AI-drafted (Claude, Anthropic)" },
  toeic: { key: "toeic", title: "TOEIC full mock and part practice", source: "https://github.com/nvtquang/eng4free/tree/main/content/packs/d3/toeic", license: "English 4 Free original content · photographs CC0 (see credits)", generatedBy: "AI-drafted (Claude, Anthropic); human spot review" },
  ielts: { key: "ielts", title: "IELTS Listening, Reading, Writing and Speaking", source: "https://github.com/nvtquang/eng4free/tree/main/content/packs/d3/ielts", license: "English 4 Free original content", generatedBy: "AI-drafted (Claude, Anthropic); human spot review" }
};

export const d3Lessons: LessonDef[] = [...grammarLessons, ...skillLessons];
export const d3Exams: ExamDef[] = [...toeicExams, ...ieltsExams];
export const d3Prompts: PromptDef[] = ieltsPrompts;

export function d3Vocabulary(): Array<VocabularySelection & { example?: string }> {
  const selection = JSON.parse(readFileSync(resolve(packRoot, "vocabulary/selection.json"), "utf8")) as VocabularySelection[];
  return selection.map((entry) => ({ ...entry, example: vocabularyExamples[`${entry.headword}|${entry.pos}`] }));
}

/**
 * Older demo content that D3 replaces. It is archived only when the D3 batch that covers
 * it is published, so no page goes empty while D3 is still in review.
 */
export const d3Retires: Record<BatchKey, { examSlugs?: string[]; lessonBatchVersions?: string[]; courseSlugPrefixes?: string[]; vocabularyOutsideBatch?: boolean }> = {
  lessons: {},
  grammar: { lessonBatchVersions: ["0.1.0"], courseSlugPrefixes: ["content-pack-v01-cefr-"] },
  vocabulary: { vocabularyOutsideBatch: true },
  toeic: { examSlugs: ["toeic-fixture-v01", "toeic-part-1-demo", "toeic-part-2-demo", "toeic-part-3-demo", "toeic-part-4-demo", "toeic-part-5-demo", "toeic-part-6-demo", "toeic-part-7-demo", "toeic-mini-demo", "toeic-full-demo", "toeic-part-5-starter"] },
  ielts: { examSlugs: ["ielts-fixture-v01", "ielts-listening-demo", "ielts-reading-demo"] }
};
