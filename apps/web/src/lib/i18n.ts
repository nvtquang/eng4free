import { cookies } from "next/headers";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const localeCookieName = "e4f-locale";

const messages = {
  vi: {
    brandTagline: "Học tiếng Anh miễn phí, có lộ trình.",
    nav: { learn: "Học", skills: "Kỹ năng", toeic: "TOEIC", ielts: "IELTS", vocabulary: "Từ vựng", grammar: "Ngữ pháp", pronunciation: "Phát âm" },
    common: { login: "Đăng nhập", signedIn: "Đã đăng nhập", dashboard: "Tiến độ", start: "Bắt đầu học", menu: "Mở menu", close: "Đóng menu", language: "Ngôn ngữ", explore: "Khám phá", skipContent: "Bỏ qua đến nội dung", primaryNavigation: "Điều hướng chính", mobileNavigation: "Điều hướng di động", about: "Giới thiệu", privacy: "Quyền riêng tư" },
    operability: { loading: "Đang tải…", saving: "Đang lưu…", requestFailed: "Thao tác chưa hoàn tất. Hãy thử lại.", noData: "Chưa có dữ liệu để hiển thị.", unavailable: "Tính năng này hiện chưa sẵn sàng." },
    toeicPractice: { loading: "Đang chuẩn bị bài luyện TOEIC Part 5…", startFailed: "Không thể bắt đầu bài luyện.", saveFailed: "Không thể tự động lưu đáp án. Hãy thử lại.", submitFailed: "Không thể nộp bài. Hãy thử lại.", label: "TOEIC · Luyện tập", answered: "Đã trả lời", saving: "Đang lưu", saved: "Đã tự động lưu", question: "Câu", correct: "Đúng.", incorrect: "Chưa đúng.", result: "Kết quả", review: "Hãy xem giải thích bên dưới từng câu để ôn lại.", submit: "Nộp bài" },
    dashboard: { eyebrow: "Tiến độ", title: "Tiến độ học của bạn", xp: "XP", streak: "Chuỗi ngày", activities: "Hoạt động", days: "ngày", skillActivity: "Hoạt động theo kỹ năng", emptyTitle: "Chưa có hoạt động học", emptyText: "Hãy hoàn thành một bài luyện hoặc ôn một thẻ từ để bắt đầu theo dõi tiến độ." },
    home: {
      eyebrow: "English 4 Free", title: "Một lộ trình tiếng Anh rõ ràng, dành cho bạn.",
      description: "Học từ A1 đến C2, luyện TOEIC và IELTS, phát triển đủ bốn kỹ năng — hoàn toàn miễn phí.",
      secondary: "Luyện thi TOEIC & IELTS", levelsTitle: "Học đúng trình độ hiện tại", levelsDescription: "Các bài học ngắn, thực hành đều đặn và tiến độ dễ theo dõi.",
      skillsTitle: "Bốn kỹ năng, một hành trình", skillsDescription: "Nghe, nói, đọc và viết kết nối trong từng bài học thay vì học rời rạc.",
      examTitle: "Luyện thi có chiến lược", examDescription: "Luyện từng Part TOEIC, làm mini test và thi thử — nhận kết quả ngay và xem lời giải cho từng câu.", examAction: "Luyện TOEIC", vocabularyDescription: "Học từ theo trình độ CEFR và ôn lại đúng lúc sắp quên với thẻ ghi nhớ.",
      current: "Đang có", free: "Miễn phí", level: "Trình độ",
      progressEyebrow: "Tiến độ", progressTitle: "Tiến độ học của bạn", viewDetail: "Xem chi tiết",
      vocabularyLearned: "Từ vựng đã học", dayStreak: "Chuỗi ngày học", streakNote: "*Chuỗi ngày mới bắt đầu lúc 0h giờ Việt Nam",
      heatmapTitle: "Hoạt động 20 tuần gần đây", few: "Ít", many: "Nhiều", activeDays: "ngày học"
    },
    learning: { eyebrow: "Lộ trình CEFR", title: "Học tiếng Anh theo từng bước nhỏ", description: "Chọn trình độ, hoàn thành bài học ngắn, rồi ôn từ vựng đúng thời điểm.", continue: "Tiếp tục học", units: "chủ đề", lessons: "bài học", minutes: "phút", startLesson: "Bắt đầu bài học", lessonComplete: "Đã hoàn thành", lessonProgress: "Tiến độ bài học", vocabularyTitle: "Từ vựng CEFR", vocabularyDescription: "Từ vựng theo trình độ CEFR; mỗi từ được hẹn ôn lại đúng lúc bạn sắp quên.", reviewNow: "Ôn ngay", noCards: "Bạn đã ôn hết các từ đến hạn ở trình độ này.", saveFailed: "Chưa lưu được kết quả ôn. Hãy thử lại.", dueSummary: "{due} từ đến hạn ôn · {new} từ mới · {later} từ sẽ quay lại sau", again: "Chưa nhớ", hard: "Khó", good: "Tốt", easy: "Dễ", nextCard: "Thẻ tiếp theo", reviewed: "Đã ôn", source: "Nguồn dữ liệu" }
    , pronunciation: { eyebrow: "Phát âm", title: "Nghe kỹ, nói rõ, luyện đều.", description: "Làm chủ từng âm IPA, phân biệt minimal pairs và luyện shadowing với bản ghi âm của chính bạn.", ipa: "Bảng IPA", minimalPairs: "Cặp âm dễ nhầm", shadowing: "Shadowing", record: "Bắt đầu ghi âm", stop: "Dừng ghi âm", recording: "Đang ghi âm", playback: "Nghe lại bản ghi", targetPlayback: "Nghe câu mẫu", unsupported: "Trình duyệt này không hỗ trợ ghi âm.", permissionDenied: "Không thể truy cập microphone. Hãy cấp quyền rồi thử lại.", ready: "Sẵn sàng để luyện", retry: "Ghi âm lại", transcript: "Bản ghi lời nói", analysisPending: "Nghe câu mẫu, ghi âm rồi nghe lại để tự so sánh nhịp, trọng âm và các âm cần chú ý.", target: "Câu mẫu", tip: "Mẹo luyện tập" }
    , ielts: { eyebrow: "IELTS Academic", title: "Luyện IELTS theo đúng kỹ năng và tiêu chí chấm.", description: "Luyện đủ bốn kỹ năng Listening, Reading, Writing và Speaking theo đúng dạng đề thi.", writing: "Writing", speaking: "Speaking", writingTitle: "IELTS Writing Task 2", writingDescription: "Viết khoảng 250 từ trong 40 phút. Lưu nháp bất cứ lúc nào; khi nộp, bạn nhận nhận xét theo bốn tiêu chí chấm (không phải band chính thức).", writingPrompt: "Some people believe that technology makes people less social. To what extent do you agree or disagree?", speakingTitle: "IELTS Speaking Part 1", speakingDescription: "Nhấn để nói, trả lời tự nhiên trong 30–60 giây. Bạn sẽ nhận bản chép lời và nhận xét để luyện tiếp (không phải band chính thức).", speakingPrompt: "Tell me about a skill you would like to learn." }
  },
  en: {
    brandTagline: "Free English learning, with a clear path.",
    nav: { learn: "Learn", skills: "Skills", toeic: "TOEIC", ielts: "IELTS", vocabulary: "Vocabulary", grammar: "Grammar", pronunciation: "Pronunciation" },
    common: { login: "Log in", signedIn: "Signed in", dashboard: "Progress", start: "Start learning", menu: "Open menu", close: "Close menu", language: "Language", explore: "Explore", skipContent: "Skip to content", primaryNavigation: "Primary navigation", mobileNavigation: "Mobile navigation", about: "About", privacy: "Privacy" },
    operability: { loading: "Loading…", saving: "Saving…", requestFailed: "The action could not be completed. Please try again.", noData: "There is no data to display yet.", unavailable: "This feature is not available yet." },
    toeicPractice: { loading: "Preparing TOEIC Part 5 practice…", startFailed: "Could not start the practice.", saveFailed: "Could not save your answer automatically. Please try again.", submitFailed: "Could not submit your answers. Please try again.", label: "TOEIC · Practice", answered: "Answered", saving: "Saving", saved: "Saved automatically", question: "Question", correct: "Correct.", incorrect: "Not correct.", result: "Result", review: "Review the explanation under each question.", submit: "Submit" },
    dashboard: { eyebrow: "Dashboard", title: "Your learning progress", xp: "XP", streak: "Streak", activities: "Activities", days: "days", skillActivity: "Skill activity", emptyTitle: "No learning activity yet", emptyText: "Complete a practice activity or review a vocabulary card to start tracking your progress." },
    home: {
      eyebrow: "English 4 Free", title: "A clear English-learning path, made for you.",
      description: "Learn from A1 to C2, practise TOEIC and IELTS, and develop all four skills — completely free.",
      secondary: "Practise TOEIC & IELTS", levelsTitle: "Learn at the right level", levelsDescription: "Short lessons, steady practice, and progress that is easy to follow.",
      skillsTitle: "Four skills, one journey", skillsDescription: "Listening, speaking, reading and writing belong together in every lesson.",
      examTitle: "Practise exams with purpose", examDescription: "Practise TOEIC parts, mini tests and mock tests — get your result instantly and review every explanation.", examAction: "TOEIC practice", vocabularyDescription: "Learn words by CEFR level and review them with flashcards just before you forget.",
      current: "Available now", free: "Free", level: "Level",
      progressEyebrow: "Learning progress", progressTitle: "Your learning progress", viewDetail: "View details",
      vocabularyLearned: "Vocabulary learned", dayStreak: "Day streak", streakNote: "*A new streak starts at midnight, Vietnam time",
      heatmapTitle: "Activity in the last 20 weeks", few: "Less", many: "More", activeDays: "active days"
    },
    learning: { eyebrow: "CEFR pathway", title: "Build English one small step at a time", description: "Choose your level, finish short lessons, then review vocabulary at the right time.", continue: "Continue learning", units: "units", lessons: "lessons", minutes: "min", startLesson: "Start lesson", lessonComplete: "Completed", lessonProgress: "Lesson progress", vocabularyTitle: "CEFR vocabulary", vocabularyDescription: "Vocabulary by CEFR level; each word comes back for review just before you are likely to forget it.", reviewNow: "Review now", noCards: "You have reviewed every due word at this level.", saveFailed: "Your review was not saved. Please try again.", dueSummary: "{due} due for review · {new} new · {later} scheduled for later", again: "Again", hard: "Hard", good: "Good", easy: "Easy", nextCard: "Next card", reviewed: "Reviewed", source: "Data source" }
    , pronunciation: { eyebrow: "Pronunciation", title: "Listen closely, speak clearly, practise often.", description: "Master IPA sounds, distinguish minimal pairs, and practise shadowing with your own recording.", ipa: "IPA chart", minimalPairs: "Minimal pairs", shadowing: "Shadowing", record: "Start recording", stop: "Stop recording", recording: "Recording", playback: "Play your recording", targetPlayback: "Play target sentence", unsupported: "Your browser does not support audio recording.", permissionDenied: "Microphone access was unavailable. Allow it and try again.", ready: "Ready to practise", retry: "Record again", transcript: "Speech transcript", analysisPending: "Play the target, record yourself, then listen back to compare rhythm, stress and the focus sounds.", target: "Target sentence", tip: "Practice tip" }
    , ielts: { eyebrow: "IELTS Academic", title: "Practise IELTS by skill and scoring criterion.", description: "Practise Listening, Reading, Writing and Speaking in the format of the real test.", writing: "Writing", speaking: "Speaking", writingTitle: "IELTS Writing Task 2", writingDescription: "Write about 250 words in 40 minutes. Save drafts at any time; when you submit, you receive feedback on the four assessment criteria (not an official band).", writingPrompt: "Some people believe that technology makes people less social. To what extent do you agree or disagree?", speakingTitle: "IELTS Speaking Part 1", speakingDescription: "Push to talk and answer naturally for 30–60 seconds. You receive a transcript and feedback to practise again (not an official band).", speakingPrompt: "Tell me about a skill you would like to learn." }
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
