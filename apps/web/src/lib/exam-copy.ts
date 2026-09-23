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
    submit: "Nộp bài",
    saving: "Đang tự động lưu…",
    review: "Xem lại bài làm",
    timeExpired: "Đã hết giờ — kết quả được chấm từ đáp án đã tự động lưu.",
    tryAgain: "Làm lại",
    history: "Lịch sử bài thi"
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
    submit: "Submit exam",
    saving: "Autosaving…",
    review: "Review your attempt",
    timeExpired: "Time expired — saved answers were scored.",
    tryAgain: "Try again",
    history: "Exam history"
  }
} as const;

export type ExamCopy = (typeof examCopy)[Locale];
export function getExamCopy(locale: Locale): ExamCopy { return examCopy[locale]; }
