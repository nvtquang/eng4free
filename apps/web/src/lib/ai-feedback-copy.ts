import type { Locale } from "./i18n";

export const aiFeedbackCopy = {
  vi: {
    aiFeedback: "Phản hồi luyện tập từ AI", notOfficialBand: "Không phải band IELTS chính thức", rubric: "Rubric", grammar: "Ngữ pháp", vocabulary: "Từ vựng", coherence: "Mạch lạc", revisionSuggestions: "Gợi ý chỉnh sửa", evaluating: "Đang tạo phản hồi AI…", feedbackUnavailable: "Chưa thể tạo phản hồi AI. Bài đã được lưu trong lịch sử."
  },
  en: {
    aiFeedback: "AI practice feedback", notOfficialBand: "Not an official IELTS band", rubric: "Rubric", grammar: "Grammar", vocabulary: "Vocabulary", coherence: "Coherence", revisionSuggestions: "Revision suggestions", evaluating: "Generating AI feedback…", feedbackUnavailable: "AI feedback is unavailable. Your writing is still saved in history."
  }
} as const;

export function getAiFeedbackCopy(locale: Locale) {
  return aiFeedbackCopy[locale];
}
