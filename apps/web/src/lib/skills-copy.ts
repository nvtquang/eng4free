import type { Locale } from "./i18n";

const copy = {
  vi: {
    saveDraft: "Lưu bản nháp",
    submit: "Nộp bài",
    saving: "Đang lưu…",
    saved: "Đã lưu",
    history: "Lịch sử",
    noHistory: "Chưa có lịch sử.",
    revisions: "Phiên bản",
    words: "từ",
    load: "Mở lại",
    startRecording: "Bắt đầu ghi âm",
    stopRecording: "Dừng ghi âm",
    stoppingRecording: "Đang hoàn tất bản ghi…",
    saveRecording: "Lưu bản ghi",
    microphoneDenied: "Không thể truy cập microphone. Hãy cấp quyền rồi thử lại.",
    unsupported: "Trình duyệt không hỗ trợ ghi âm.",
    recordingReady: "Bản ghi đã sẵn sàng để nghe lại và lưu.",
    savedRecording: "Đã lưu bản ghi vào lịch sử.",
    viewProgress: "Xem tiến độ",
    writingTitle: "Luyện viết",
    speakingTitle: "Luyện nói",
    listeningTitle: "Luyện nghe",
    readingTitle: "Luyện đọc",
    grammarTitle: "Ngữ pháp theo trình độ",
    listeningEyebrow: "Nghe",
    readingEyebrow: "Đọc",
    writingEyebrow: "Viết",
    speakingEyebrow: "Nói",
    grammarEyebrow: "Ngữ pháp",
    listeningIntro: "Nghe đoạn hội thoại hoặc bài nói theo trình độ, trả lời câu hỏi rồi xem lại lời giải.",
    readingIntro: "Đọc bài theo trình độ, trả lời câu hỏi và xem giải thích cho từng đáp án.",
    writingIntro: "Viết bài, lưu nháp bất cứ lúc nào và nộp để nhận nhận xét theo bốn tiêu chí. Mọi phiên bản đều được lưu lại.",
    grammarIntro: "Mỗi chủ điểm có phần giải thích ngắn, ví dụ và bài tập được chấm ngay.",
    noLessons: "Chưa có bài học cho mục này.",
    statusDraft: "Bản nháp",
    statusSubmitted: "Đã nộp",
    openExercise: "Mở bài luyện",
    completed: "Đã hoàn thành"
  },
  en: {
    saveDraft: "Save draft",
    submit: "Submit",
    saving: "Saving…",
    saved: "Saved",
    history: "History",
    noHistory: "No history yet.",
    revisions: "Revisions",
    words: "words",
    load: "Open",
    startRecording: "Start recording",
    stopRecording: "Stop recording",
    stoppingRecording: "Finishing recording…",
    saveRecording: "Save recording",
    microphoneDenied: "Microphone access was unavailable. Allow it and try again.",
    unsupported: "This browser does not support recording.",
    recordingReady: "The recording is ready to play back and save.",
    savedRecording: "Recording saved to history.",
    viewProgress: "View progress",
    writingTitle: "Writing practice",
    speakingTitle: "Speaking practice",
    listeningTitle: "Listening practice",
    readingTitle: "Reading practice",
    grammarTitle: "Grammar by level",
    listeningEyebrow: "Listening",
    readingEyebrow: "Reading",
    writingEyebrow: "Writing",
    speakingEyebrow: "Speaking",
    grammarEyebrow: "Grammar",
    listeningIntro: "Listen to conversations and talks at your level, answer questions, then review the explanations.",
    readingIntro: "Read texts at your level, answer questions and review the explanation for every answer.",
    writingIntro: "Write, save drafts at any time and submit to receive feedback on four criteria. Every revision is kept.",
    grammarIntro: "Each topic has a short explanation, examples and exercises that are checked instantly.",
    noLessons: "There are no lessons here yet.",
    statusDraft: "Draft",
    statusSubmitted: "Submitted",
    openExercise: "Open exercise",
    completed: "Completed"
  }
} as const;

export function getSkillsCopy(locale: Locale) {
  return copy[locale];
}

const skillLabels = {
  vi: { LISTENING: "Nghe", SPEAKING: "Nói", READING: "Đọc", WRITING: "Viết", GRAMMAR: "Ngữ pháp", VOCABULARY: "Từ vựng", PRONUNCIATION: "Phát âm" },
  en: { LISTENING: "Listening", SPEAKING: "Speaking", READING: "Reading", WRITING: "Writing", GRAMMAR: "Grammar", VOCABULARY: "Vocabulary", PRONUNCIATION: "Pronunciation" }
} as const;

/** Learner-facing label for a stored lesson skill; unknown values are shown as-is. */
export function getSkillLabel(locale: Locale, skill: string | null | undefined): string {
  if (!skill) return "";
  return (skillLabels[locale] as Record<string, string>)[skill] ?? skill;
}
