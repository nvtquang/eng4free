import type { Locale } from "./i18n";

const examCopy = {
  vi: {
    localDemo: "Bản demo nội dung gốc chạy local · đáp án được chấm ở máy chủ.",
    couldNotStart: "Không thể bắt đầu bài thi",
    loading: "Đang tải bài thi…",
    autosaveFailed: "Không thể tự động lưu đáp án",
    submitFailed: "Không thể nộp bài",
    playing: "Đang phát…",
    playAudio: "Phát audio",
    resumed: "TIẾP TỤC",
    answered: "đã trả lời",
    part: "Phần",
    correct: "Đúng",
    correctAnswer: "Đáp án đúng",
    result: "Kết quả",
    submitting: "Đang nộp…",
    submit: "Nộp bài"
  },
  en: {
    localDemo: "Original local demo · answers are scored on the server.",
    couldNotStart: "Could not start exam",
    loading: "Loading exam…",
    autosaveFailed: "Autosave failed",
    submitFailed: "Submit failed",
    playing: "Playing…",
    playAudio: "Play audio",
    resumed: "RESUMED",
    answered: "answered",
    part: "Part",
    correct: "Correct",
    correctAnswer: "Correct answer",
    result: "Result",
    submitting: "Submitting…",
    submit: "Submit exam"
  }
} as const;

export type ExamCopy = (typeof examCopy)[Locale];
export function getExamCopy(locale: Locale): ExamCopy { return examCopy[locale]; }
