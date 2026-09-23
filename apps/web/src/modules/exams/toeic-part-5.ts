import { McqQuestionWithAnswerSchema, toLearnerQuestion, type McqLearnerQuestion, type McqQuestionWithAnswer } from "@english4free/content-schemas";

export const TOEIC_PART_5_EXAM_ID = "d049d8e2-0a0d-4303-95fb-d4f97126dc53";
export const TOEIC_PART_5_EXAM_SLUG = "toeic-part-5-starter";
export const TOEIC_PART_5_PART_ID = "9d810452-bdb1-4f03-a3ef-daef64135b08";
export const TOEIC_PART_5_CONTENT_BATCH_ID = "34f225a7-5ccc-4ecb-9b03-82af51f0d324";

const provenance = {
  source: "https://english4free.local/content/toeic-part-5-starter",
  license: "English 4 Free original content",
  author: "English 4 Free",
  reviewedBy: "English 4 Free",
  importedAt: "2026-09-21T00:00:00.000Z",
  version: "1"
} as const;

const privateQuestions = [
  {
    id: "f98278d7-b7b6-46a8-a368-39cf2bc0b907",
    schemaVersion: 1,
    type: "MCQ",
    cefrLevel: "B1",
    skill: "READING",
    tags: ["toeic-part-5", "verb-form"],
    content: { prompt: "Please ___ the report before the meeting begins.", options: [{ id: "a", text: "review" }, { id: "b", text: "reviews" }, { id: "c", text: "reviewed" }, { id: "d", text: "reviewing" }] },
    answer: { correctOptionId: "a" },
    explanation: "After 'Please', use the base form of the verb.",
    provenance,
    status: "PUBLISHED"
  },
  {
    id: "8e94c08a-ff82-4bf8-a752-cd409460a05d",
    schemaVersion: 1,
    type: "MCQ",
    cefrLevel: "B1",
    skill: "READING",
    tags: ["toeic-part-5", "preposition"],
    content: { prompt: "The new policy will take effect ___ July 1.", options: [{ id: "a", text: "in" }, { id: "b", text: "on" }, { id: "c", text: "at" }, { id: "d", text: "by" }] },
    answer: { correctOptionId: "b" },
    explanation: "Use 'on' before a specific date.",
    provenance,
    status: "PUBLISHED"
  },
  {
    id: "2180d1ae-0191-4a40-9aee-24685c4886ed",
    schemaVersion: 1,
    type: "MCQ",
    cefrLevel: "B2",
    skill: "READING",
    tags: ["toeic-part-5", "relative-clause"],
    content: { prompt: "Ms. Tran, ___ manages the sales team, will lead the presentation.", options: [{ id: "a", text: "who" }, { id: "b", text: "which" }, { id: "c", text: "whose" }, { id: "d", text: "whom" }] },
    answer: { correctOptionId: "a" },
    explanation: "'Who' is the subject relative pronoun for a person.",
    provenance,
    status: "PUBLISHED"
  }
] as const;

export const toeicPart5Questions: McqQuestionWithAnswer[] = privateQuestions.map((question) => McqQuestionWithAnswerSchema.parse(question));

export type LearnerExam = {
  id: string;
  slug: string;
  title: string;
  type: "TOEIC";
  partNumber: 5;
  durationSeconds: number;
  questions: McqLearnerQuestion[];
};

export function getToeicPart5LearnerExam(): LearnerExam {
  return {
    id: TOEIC_PART_5_EXAM_ID,
    slug: TOEIC_PART_5_EXAM_SLUG,
    title: "TOEIC Part 5 Starter",
    type: "TOEIC",
    partNumber: 5,
    durationSeconds: 180,
    questions: toeicPart5Questions.map(toLearnerQuestion)
  };
}

export function findToeicPart5Question(questionId: string): McqQuestionWithAnswer | undefined {
  return toeicPart5Questions.find((question) => question.id === questionId);
}
