import type { Locale } from "./i18n";

const copy = {
  vi: {
    description: "Ghi âm theo kiểu nhấn để nói. Khi đã cấu hình Gemini, máy chủ sẽ tạo bản chép lời và phản hồi luyện nói; hội thoại thời gian thực sẽ được phát triển sau.",
    pushToTalk: "Nhấn để nói",
    analyzing: "Đang chuyển giọng nói thành văn bản và tạo phản hồi…",
    feedbackReady: "Đã lưu bản chép lời và phản hồi.",
    providerUnavailable: "Bản ghi đã được lưu. Thêm GEMINI_API_KEY để bật STT và phản hồi AI.",
    transcript: "Bản chép lời",
    feedback: "Phản hồi luyện nói",
    rubric: "Tiêu chí đánh giá",
    taskResponse: "Đáp ứng chủ đề",
    fluency: "Độ trôi chảy",
    grammar: "Ngữ pháp",
    vocabulary: "Từ vựng",
    corrections: "Gợi ý sửa",
    strengths: "Điểm tốt",
    nextSteps: "Bước tiếp theo",
    noOfficialScore: "Không phải điểm Speaking chính thức",
    disclaimer: "Chỉ là phản hồi luyện tập dựa trên bản chép lời; không đánh giá phát âm ở cấp độ âm vị.",
    needsWork: "Cần cải thiện",
    developing: "Đang phát triển",
    secure: "Đạt yêu cầu"
  },
  en: {
    description: "Record in push-to-talk mode. With Gemini configured, the server creates a transcript and practice feedback; realtime conversation is deferred.",
    pushToTalk: "Push to talk",
    analyzing: "Transcribing and generating feedback…",
    feedbackReady: "Transcript and feedback saved.",
    providerUnavailable: "Recording saved. Add GEMINI_API_KEY to enable STT and AI feedback.",
    transcript: "Transcript",
    feedback: "Speaking feedback",
    rubric: "Rubric",
    taskResponse: "Task response",
    fluency: "Fluency",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    corrections: "Corrections",
    strengths: "Strengths",
    nextSteps: "Next steps",
    noOfficialScore: "Not an official Speaking score",
    disclaimer: "Practice feedback based on the transcript only; it does not assess phoneme-level pronunciation.",
    needsWork: "Needs work",
    developing: "Developing",
    secure: "Secure"
  }
} as const;

export function getAiSpeakingCopy(locale: Locale) {
  return copy[locale];
}

export type AiSpeakingCopy = (typeof copy)[keyof typeof copy];
