import type { Locale } from "./i18n";

const copy = {
  vi: {
    description: "Nhấn để nói, trả lời theo đề, rồi lưu bản ghi. AI sẽ chép lại lời bạn nói và nhận xét theo bốn tiêu chí; bạn có thể nghe lại mọi bản ghi trong lịch sử.",
    pushToTalk: "Nhấn để nói",
    analyzing: "Đang chuyển giọng nói thành văn bản và tạo phản hồi…",
    feedbackReady: "Đã lưu bản chép lời và phản hồi.",
    providerUnavailable: "Bản ghi đã được lưu. Nhận xét AI tạm thời chưa có; bạn vẫn có thể nghe lại bản ghi trong lịch sử.",
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
    secure: "Đạt yêu cầu",
    topicsTitle: "Chọn chủ đề để luyện nói",
    suggestionsTitle: "Mẫu câu gợi ý",
    basicLabel: "Cơ bản",
    advancedLabel: "Nâng cao",
    viewFeedback: "Xem bản chép lời & nhận xét"
  },
  en: {
    description: "Press to talk, answer the prompt, then save your recording. AI transcribes what you said and gives feedback on four criteria; every recording stays in your history.",
    pushToTalk: "Push to talk",
    analyzing: "Transcribing and generating feedback…",
    feedbackReady: "Transcript and feedback saved.",
    providerUnavailable: "Recording saved. AI feedback is not available right now; you can still play the recording back from your history.",
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
    secure: "Secure",
    topicsTitle: "Choose a topic to practise",
    suggestionsTitle: "Suggested sentences",
    basicLabel: "Basic",
    advancedLabel: "Advanced",
    viewFeedback: "View transcript & feedback"
  }
} as const;

export function getAiSpeakingCopy(locale: Locale) {
  return copy[locale];
}

export type AiSpeakingCopy = (typeof copy)[keyof typeof copy];
