import { cookies } from "next/headers";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const localeCookieName = "e4f-locale";

const messages = {
  vi: {
    brandTagline: "Học tiếng Anh miễn phí, có lộ trình.",
    nav: { learn: "Học", skills: "Kỹ năng", toeic: "TOEIC", ielts: "IELTS", vocabulary: "Từ vựng", grammar: "Ngữ pháp", pronunciation: "Phát âm" },
    common: { login: "Đăng nhập", signedIn: "Đã đăng nhập", dashboard: "Tiến độ", start: "Bắt đầu học", menu: "Mở menu", close: "Đóng menu", language: "Ngôn ngữ", explore: "Khám phá", comingSoon: "Đang xây dựng", skipContent: "Bỏ qua đến nội dung", primaryNavigation: "Điều hướng chính", mobileNavigation: "Điều hướng di động", about: "Giới thiệu", blog: "Bài viết" },
    operability: { loading: "Đang tải…", saving: "Đang lưu…", requestFailed: "Thao tác chưa hoàn tất. Hãy thử lại.", noData: "Chưa có dữ liệu để hiển thị.", unavailable: "Tính năng này chưa sẵn sàng trong bản demo local." },
    toeicPractice: { loading: "Đang chuẩn bị bài luyện TOEIC Part 5…", startFailed: "Không thể bắt đầu bài luyện.", saveFailed: "Không thể tự động lưu đáp án. Hãy thử lại.", submitFailed: "Không thể nộp bài. Hãy thử lại.", label: "TOEIC · Luyện tập", answered: "Đã trả lời", saving: "Đang lưu", saved: "Đã tự động lưu", question: "Câu", correct: "Đúng.", incorrect: "Chưa đúng.", result: "Kết quả", review: "Hãy xem giải thích bên dưới từng câu để ôn lại.", submit: "Nộp bài" },
    dashboard: { eyebrow: "Tiến độ", title: "Tiến độ học của bạn", xp: "XP", streak: "Chuỗi ngày", activities: "Hoạt động", days: "ngày", skillActivity: "Hoạt động theo kỹ năng", emptyTitle: "Chưa có hoạt động học", emptyText: "Hãy hoàn thành một bài luyện hoặc ôn một thẻ từ để bắt đầu theo dõi tiến độ." },
    home: {
      eyebrow: "English 4 Free", title: "Một lộ trình tiếng Anh rõ ràng, dành cho bạn.",
      description: "Học từ A1 đến C2, luyện TOEIC và IELTS, phát triển đủ bốn kỹ năng — hoàn toàn miễn phí.",
      secondary: "Làm bài kiểm tra xếp lớp", levelsTitle: "Học đúng trình độ hiện tại", levelsDescription: "Các bài học ngắn, thực hành đều đặn và tiến độ dễ theo dõi.",
      skillsTitle: "Bốn kỹ năng, một hành trình", skillsDescription: "Nghe, nói, đọc và viết kết nối trong từng bài học thay vì học rời rạc.",
      examTitle: "Luyện thi có chiến lược", examDescription: "Bắt đầu từ TOEIC Part 5 — làm bài, nhận kết quả và xem lời giải rõ ràng.",
      current: "Đang có", free: "Miễn phí", level: "Trình độ",
      progressEyebrow: "Tiến độ", progressTitle: "Tiến độ học của bạn", viewDetail: "Xem chi tiết",
      vocabularyLearned: "Từ vựng đã học", dayStreak: "Chuỗi ngày học", streakNote: "*Chuỗi ngày mới bắt đầu lúc 0h giờ Việt Nam",
      heatmapTitle: "Hoạt động 20 tuần gần đây", few: "Ít", many: "Nhiều", activeDays: "ngày học"
    },
    learning: { eyebrow: "Lộ trình CEFR", title: "Học tiếng Anh theo từng bước nhỏ", description: "Chọn trình độ, hoàn thành bài học ngắn, rồi ôn từ vựng đúng thời điểm.", continue: "Tiếp tục học", units: "chủ đề", lessons: "bài học", minutes: "phút", startLesson: "Bắt đầu bài học", lessonComplete: "Đã hoàn thành", lessonProgress: "Tiến độ bài học", vocabularyTitle: "Từ vựng CEFR", vocabularyDescription: "Từ vựng được chuẩn hóa theo CEFR; ôn tập dùng lịch FSRS cá nhân của bạn.", reviewNow: "Ôn ngay", noCards: "Bạn đã hoàn thành các thẻ mẫu hôm nay.", again: "Chưa nhớ", hard: "Khó", good: "Tốt", easy: "Dễ", nextCard: "Thẻ tiếp theo", reviewed: "Đã ôn", source: "Nguồn dữ liệu" }
    , pronunciation: { eyebrow: "Phát âm", title: "Nghe kỹ, nói rõ, luyện đều.", description: "Làm chủ từng âm IPA, phân biệt minimal pairs và luyện shadowing với bản ghi âm của chính bạn.", ipa: "Bảng IPA", minimalPairs: "Cặp âm dễ nhầm", shadowing: "Shadowing", record: "Bắt đầu ghi âm", stop: "Dừng ghi âm", recording: "Đang ghi âm", playback: "Nghe lại bản ghi", targetPlayback: "Nghe câu mẫu", unsupported: "Trình duyệt này không hỗ trợ ghi âm.", permissionDenied: "Không thể truy cập microphone. Hãy cấp quyền rồi thử lại.", ready: "Sẵn sàng để luyện", retry: "Ghi âm lại", transcript: "Bản ghi lời nói", analysisPending: "Phân tích phát âm chỉ hoạt động sau khi file được tải lên và Speech Service được cấu hình.", target: "Câu mẫu", tip: "Mẹo luyện tập", serviceChecking: "Đang kiểm tra Speech Service…", serviceReady: "Speech Service đã sẵn sàng", serviceOffline: "Speech Service chưa kết nối", serviceNotConfigured: "Speech Service chưa được cấu hình" }
    , ielts: { eyebrow: "IELTS Academic", title: "Luyện IELTS theo đúng kỹ năng và tiêu chí chấm.", description: "Listening, Reading, Writing, Speaking — dùng chung Question Engine, Attempt Engine và các feedback contract có cấu trúc.", listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking", practice: "Luyện tập", writingTitle: "IELTS Writing", writingPrompt: "Some people believe that technology makes people less social. To what extent do you agree or disagree?", submitWriting: "Kiểm tra bài viết", writingPlaceholder: "Viết câu trả lời của bạn bằng tiếng Anh…", wordCount: "Số từ", paragraphs: "Đoạn văn", providerNotConfigured: "AI Writing chưa được cấu hình. Đây chỉ là kiểm tra cấu trúc, không phải band IELTS.", feedbackReady: "Đã có feedback có cấu trúc", speakingTitle: "IELTS Speaking — luyện theo lượt", speakingDescription: "Ghi âm câu trả lời, nghe lại và chuẩn bị transcript/feedback sau khi Media và Speech Service được kết nối.", speakingPrompt: "Tell me about a skill you would like to learn.", bandCalculator: "IELTS band calculator", correctAnswers: "Số câu đúng", calculate: "Tính band", estimatedBand: "Band ước tính", invalidScore: "Nhập số nguyên từ 0 đến 40." }
  },
  en: {
    brandTagline: "Free English learning, with a clear path.",
    nav: { learn: "Learn", skills: "Skills", toeic: "TOEIC", ielts: "IELTS", vocabulary: "Vocabulary", grammar: "Grammar", pronunciation: "Pronunciation" },
    common: { login: "Log in", signedIn: "Signed in", dashboard: "Progress", start: "Start learning", menu: "Open menu", close: "Close menu", language: "Language", explore: "Explore", comingSoon: "In progress", skipContent: "Skip to content", primaryNavigation: "Primary navigation", mobileNavigation: "Mobile navigation", about: "About", blog: "Blog" },
    operability: { loading: "Loading…", saving: "Saving…", requestFailed: "The action could not be completed. Please try again.", noData: "There is no data to display yet.", unavailable: "This feature is not available in the local demo yet." },
    toeicPractice: { loading: "Preparing TOEIC Part 5 practice…", startFailed: "Could not start the practice.", saveFailed: "Could not save your answer automatically. Please try again.", submitFailed: "Could not submit your answers. Please try again.", label: "TOEIC · Practice", answered: "Answered", saving: "Saving", saved: "Saved automatically", question: "Question", correct: "Correct.", incorrect: "Not correct.", result: "Result", review: "Review the explanation under each question.", submit: "Submit" },
    dashboard: { eyebrow: "Dashboard", title: "Your learning progress", xp: "XP", streak: "Streak", activities: "Activities", days: "days", skillActivity: "Skill activity", emptyTitle: "No learning activity yet", emptyText: "Complete a practice activity or review a vocabulary card to start tracking your progress." },
    home: {
      eyebrow: "English 4 Free", title: "A clear English-learning path, made for you.",
      description: "Learn from A1 to C2, practise TOEIC and IELTS, and develop all four skills — completely free.",
      secondary: "Take a placement test", levelsTitle: "Learn at the right level", levelsDescription: "Short lessons, steady practice, and progress that is easy to follow.",
      skillsTitle: "Four skills, one journey", skillsDescription: "Listening, speaking, reading and writing belong together in every lesson.",
      examTitle: "Practise exams with purpose", examDescription: "Start with TOEIC Part 5 — answer questions, get a result, and review clear explanations.",
      current: "Available now", free: "Free", level: "Level",
      progressEyebrow: "Learning progress", progressTitle: "Your learning progress", viewDetail: "View details",
      vocabularyLearned: "Vocabulary learned", dayStreak: "Day streak", streakNote: "*A new streak starts at midnight, Vietnam time",
      heatmapTitle: "Activity in the last 20 weeks", few: "Less", many: "More", activeDays: "active days"
    },
    learning: { eyebrow: "CEFR pathway", title: "Build English one small step at a time", description: "Choose your level, finish short lessons, then review vocabulary at the right time.", continue: "Continue learning", units: "units", lessons: "lessons", minutes: "min", startLesson: "Start lesson", lessonComplete: "Completed", lessonProgress: "Lesson progress", vocabularyTitle: "CEFR vocabulary", vocabularyDescription: "Vocabulary is normalized by CEFR; reviews use your personal FSRS schedule.", reviewNow: "Review now", noCards: "You have completed the sample cards for today.", again: "Again", hard: "Hard", good: "Good", easy: "Easy", nextCard: "Next card", reviewed: "Reviewed", source: "Data source" }
    , pronunciation: { eyebrow: "Pronunciation", title: "Listen closely, speak clearly, practise often.", description: "Master IPA sounds, distinguish minimal pairs, and practise shadowing with your own recording.", ipa: "IPA chart", minimalPairs: "Minimal pairs", shadowing: "Shadowing", record: "Start recording", stop: "Stop recording", recording: "Recording", playback: "Play your recording", targetPlayback: "Play target sentence", unsupported: "Your browser does not support audio recording.", permissionDenied: "Microphone access was unavailable. Allow it and try again.", ready: "Ready to practise", retry: "Record again", transcript: "Speech transcript", analysisPending: "Pronunciation analysis works after a recording is uploaded and the Speech Service is configured.", target: "Target sentence", tip: "Practice tip", serviceChecking: "Checking Speech Service…", serviceReady: "Speech Service is ready", serviceOffline: "Speech Service is offline", serviceNotConfigured: "Speech Service is not configured" }
    , ielts: { eyebrow: "IELTS Academic", title: "Practise IELTS by skill and scoring criterion.", description: "Listening, Reading, Writing, Speaking — sharing the Question Engine, Attempt Engine and structured feedback contracts.", listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking", practice: "Practise", writingTitle: "IELTS Writing", writingPrompt: "Some people believe that technology makes people less social. To what extent do you agree or disagree?", submitWriting: "Check writing", writingPlaceholder: "Write your answer in English…", wordCount: "Words", paragraphs: "Paragraphs", providerNotConfigured: "AI Writing is not configured. This is structural checking only, not an IELTS band.", feedbackReady: "Structured feedback is ready", speakingTitle: "IELTS Speaking — turn-based practice", speakingDescription: "Record an answer, listen back, and prepare a transcript/feedback once Media and Speech Service are connected.", speakingPrompt: "Tell me about a skill you would like to learn.", bandCalculator: "IELTS band calculator", correctAnswers: "Correct answers", calculate: "Calculate band", estimatedBand: "Estimated band", invalidScore: "Enter an integer from 0 to 40." }
  }
} as const;

export type Messages = (typeof messages)[Locale];

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeCookieName)?.value;
  return isLocale(value) ? value : "vi";
}

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
