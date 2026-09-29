import "server-only";
import type { WritingDiagnostics, WritingSubmission } from "@english4free/content-schemas";

/**
 * Deterministic, offline practice feedback used when the Gemini provider is
 * unreachable (for example a lost connection mid-demo). It never pretends to be a
 * model response or an official band: it is computed from observable signals in the
 * learner's own text (length, structure, connectives, repetition) and is clearly
 * disclaimered as offline feedback. This keeps the writing and speaking flows useful
 * even with no network, and needs no API quota.
 */

type RubricLevel = "NEEDS_WORK" | "DEVELOPING" | "SECURE";
type Criterion = { level: RubricLevel; feedback: string };

const connectives = ["however", "therefore", "moreover", "furthermore", "because", "although", "in addition", "for example", "on the other hand", "as a result", "firstly", "secondly", "finally", "in conclusion"];
const fillers = ["um", "uh", "er", "like", "you know", "kind of", "sort of", "i mean"];

function sentences(text: string): string[] {
  return text.split(/[.!?]+/u).map((part) => part.trim()).filter(Boolean);
}

function words(text: string): string[] {
  return text.trim() ? text.trim().split(/\s+/u) : [];
}

function repeatedWords(list: string[]): string[] {
  const counts = new Map<string, number>();
  for (const raw of list) {
    const word = raw.toLowerCase().replace(/[^a-z']/gu, "");
    if (word.length < 5) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count >= 4).map(([word]) => word);
}

function countConnectives(text: string): number {
  const lower = ` ${text.toLowerCase()} `;
  return connectives.filter((word) => lower.includes(` ${word} `) || lower.includes(`${word},`)).length;
}

export type WritingModelFeedback = {
  summary: string;
  rubric: { taskResponse: Criterion; coherenceAndCohesion: Criterion; lexicalResource: Criterion; grammaticalRangeAndAccuracy: Criterion };
  grammarIssues: Array<{ message: string; start: number; end: number; suggestion?: string }>;
  vocabularyIssues: Array<{ message: string; start: number; end: number; suggestion?: string }>;
  coherenceIssues: string[];
  revisionSuggestions: string[];
};

/** Offline writing feedback derived from the submission's structure and diagnostics. */
export function offlineWritingFeedback(input: WritingSubmission, diagnostics: WritingDiagnostics): WritingModelFeedback {
  const text = input.text.trim();
  const wordList = words(text);
  const sentenceList = sentences(text);
  const avgSentenceWords = sentenceList.length ? Math.round(wordList.length / sentenceList.length) : 0;
  const connectiveCount = countConnectives(text);
  const repeats = repeatedWords(wordList);
  const meetsLength = diagnostics.meetsExpectedWordCount !== false;

  const taskResponse: Criterion = meetsLength && sentenceList.length >= 4
    ? { level: "DEVELOPING", feedback: `You have written ${diagnostics.wordCount} words across ${diagnostics.paragraphCount || 1} paragraph(s), enough to address the task. Check that every part of the prompt is answered with a clear position.` }
    : { level: "NEEDS_WORK", feedback: `The response is ${diagnostics.wordCount} words${input.expectedMinimumWords ? ` against an expected ${input.expectedMinimumWords}` : ""}. Develop each main idea with an example so the task is fully covered.` };
  const coherenceAndCohesion: Criterion = diagnostics.paragraphCount >= 2 && connectiveCount >= 3
    ? { level: "SECURE", feedback: `Clear paragraphing and ${connectiveCount} linking expressions help the reader follow your argument.` }
    : { level: "DEVELOPING", feedback: diagnostics.paragraphCount < 2 ? "Use separate paragraphs for the introduction, each main idea, and a conclusion." : "Add a few more linking words (however, therefore, for example) to connect your ideas." };
  const lexicalResource: Criterion = repeats.length > 0
    ? { level: "DEVELOPING", feedback: `Vary your word choice — "${repeats.slice(0, 3).join('", "')}" appear frequently. Introduce synonyms or paraphrase.` }
    : { level: "DEVELOPING", feedback: "A reasonable range of vocabulary. Add a few precise, topic-specific words to lift the response." };
  const grammaticalRangeAndAccuracy: Criterion = avgSentenceWords > 0 && avgSentenceWords <= 25
    ? { level: "DEVELOPING", feedback: `Sentences average about ${avgSentenceWords} words. Mix short and complex sentences, and proofread for articles and verb tense.` }
    : { level: "NEEDS_WORK", feedback: avgSentenceWords > 25 ? "Some sentences are very long; break them up so the grammar stays accurate." : "Write in complete sentences and vary the structures you use." };

  const coherenceIssues = [] as string[];
  if (diagnostics.paragraphCount < 2) coherenceIssues.push("The writing is not divided into clear paragraphs.");
  if (connectiveCount < 3) coherenceIssues.push("Few cohesive devices link the ideas together.");

  const revisionSuggestions = [
    "Re-read the prompt and confirm you have answered every part.",
    diagnostics.paragraphCount < 2 ? "Split the text into introduction, body paragraphs, and a conclusion." : "Check that each paragraph has one clear main idea.",
    repeats.length ? `Replace repeated words such as "${repeats[0]}" with synonyms.` : "Proofread for articles, prepositions, and subject–verb agreement."
  ];

  return {
    summary: `Offline practice feedback based on your ${diagnostics.wordCount}-word response. Connection to the AI reviewer was unavailable, so this is a structural review of your own writing, not a model evaluation.`,
    rubric: { taskResponse, coherenceAndCohesion, lexicalResource, grammaticalRangeAndAccuracy },
    grammarIssues: [],
    vocabularyIssues: [],
    coherenceIssues,
    revisionSuggestions
  };
}

export type SpeakingModelFeedback = {
  summary: string;
  rubric: { taskResponse: Criterion; fluency: Criterion; grammar: Criterion; vocabulary: Criterion };
  corrections: Array<{ original: string; correction: string; explanation: string }>;
  strengths: string[];
  nextSteps: string[];
};

/** Offline speaking feedback derived from the verbatim transcript. */
export function offlineSpeakingFeedback(input: { prompt: string; transcript: string }): SpeakingModelFeedback {
  const transcript = input.transcript.trim();
  const wordList = words(transcript);
  const sentenceList = sentences(transcript);
  const lower = ` ${transcript.toLowerCase()} `;
  const fillerCount = fillers.reduce((total, filler) => total + (lower.split(` ${filler} `).length - 1), 0);
  const connectiveCount = countConnectives(transcript);
  const repeats = repeatedWords(wordList);
  const enough = wordList.length >= 40;

  const taskResponse: Criterion = enough
    ? { level: "DEVELOPING", feedback: `You spoke about ${wordList.length} words, which develops the topic. Make sure you address each part of the question directly.` }
    : { level: "NEEDS_WORK", feedback: `The answer is short (${wordList.length} words). Extend each point with a reason and an example.` };
  const fluency: Criterion = fillerCount <= 2 && sentenceList.length >= 3
    ? { level: "SECURE", feedback: "The response flows with few fillers and clear separate ideas." }
    : { level: "DEVELOPING", feedback: fillerCount > 2 ? `Reduce fillers (about ${fillerCount} spotted, e.g. "um", "like") to sound more fluent.` : "Group your ideas into full sentences to improve flow." };
  const grammar: Criterion = { level: "DEVELOPING", feedback: sentenceList.length >= 3 ? "You use several full sentences. Vary tenses and check verb agreement as you speak." : "Aim for complete sentences with a clear subject and verb." };
  const vocabulary: Criterion = repeats.length
    ? { level: "DEVELOPING", feedback: `Broaden your vocabulary — "${repeats.slice(0, 3).join('", "')}" recur. Try synonyms or topic words.` }
    : { level: "DEVELOPING", feedback: "Reasonable vocabulary range; add a few precise, topic-specific words." };

  const strengths = [] as string[];
  if (enough) strengths.push("You produced a full-length answer.");
  if (connectiveCount >= 2) strengths.push("You linked ideas with connective words.");
  if (fillerCount <= 2) strengths.push("You kept hesitation to a minimum.");
  if (strengths.length === 0) strengths.push("You attempted the full task — keep practising to build fluency.");

  return {
    summary: `Offline practice feedback from your transcript (${wordList.length} words). The AI reviewer was unreachable, so this reviews only what you said, not pronunciation or an official band.`,
    rubric: { taskResponse, fluency, grammar, vocabulary },
    corrections: [],
    strengths,
    nextSteps: [
      "Record the same answer again and aim for one more supporting example.",
      fillerCount > 2 ? "Pause silently instead of using fillers." : "Add linking words to connect your points.",
      repeats.length ? `Swap repeated words like "${repeats[0]}" for synonyms.` : "Use one or two new topic-specific words."
    ]
  };
}
