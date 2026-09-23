export type ToeicPart = { number: 1 | 2 | 3 | 4 | 5 | 6 | 7; skill: "LISTENING" | "READING"; questionCount: number; title: { vi: string; en: string }; requiresLicensedMedia: boolean };
export const toeicParts: readonly ToeicPart[] = [
  { number: 1, skill: "LISTENING", questionCount: 6, title: { vi: "Mô tả tranh", en: "Photographs" }, requiresLicensedMedia: true },
  { number: 2, skill: "LISTENING", questionCount: 25, title: { vi: "Hỏi - đáp", en: "Question–response" }, requiresLicensedMedia: true },
  { number: 3, skill: "LISTENING", questionCount: 39, title: { vi: "Đoạn hội thoại", en: "Conversations" }, requiresLicensedMedia: true },
  { number: 4, skill: "LISTENING", questionCount: 30, title: { vi: "Bài nói ngắn", en: "Short talks" }, requiresLicensedMedia: true },
  { number: 5, skill: "READING", questionCount: 30, title: { vi: "Hoàn thành câu", en: "Incomplete sentences" }, requiresLicensedMedia: false },
  { number: 6, skill: "READING", questionCount: 16, title: { vi: "Hoàn thành đoạn văn", en: "Text completion" }, requiresLicensedMedia: false },
  { number: 7, skill: "READING", questionCount: 54, title: { vi: "Đọc hiểu", en: "Reading comprehension" }, requiresLicensedMedia: false }
];
export const TOEIC_FULL_MOCK_DURATION_SECONDS = 2 * 60 * 60;
export function getToeicPart(partNumber: number) { return toeicParts.find((part) => part.number === partNumber) ?? null; }
export function buildToeicMockPolicy() { return { durationSeconds: TOEIC_FULL_MOCK_DURATION_SECONDS, parts: toeicParts, listeningAudioPolicy: "ONE_PLAYBACK_ONLY" as const, autosave: true, navigation: true }; }
