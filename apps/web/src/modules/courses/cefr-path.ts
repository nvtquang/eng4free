export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type LessonPreview = { slug: string; title: { vi: string; en: string }; skill: "Vocabulary" | "Grammar" | "Listening" | "Reading" | "Speaking" | "Writing"; minutes: number };
export type CourseLevelPreview = { level: CefrLevel; title: { vi: string; en: string }; description: { vi: string; en: string }; lessons: LessonPreview[] };

export const cefrPath: CourseLevelPreview[] = [
  { level: "A1", title: { vi: "Khởi đầu tự tin", en: "Start with confidence" }, description: { vi: "Chào hỏi và giới thiệu bản thân trong các tình huống quen thuộc.", en: "Greetings and introductions for familiar situations." }, lessons: [{ slug: "introduce-yourself", title: { vi: "Giới thiệu bản thân", en: "Introduce yourself" }, skill: "Speaking", minutes: 10 }] },
  { level: "A2", title: { vi: "Giao tiếp thường ngày", en: "Everyday communication" }, description: { vi: "Diễn đạt kế hoạch đơn giản với cấu trúc rõ ràng.", en: "Express simple plans with clear structures." }, lessons: [{ slug: "plans", title: { vi: "Lập kế hoạch đơn giản", en: "Make a simple plan" }, skill: "Grammar", minutes: 12 }] },
  { level: "B1", title: { vi: "Giao tiếp độc lập", en: "Independent communication" }, description: { vi: "Đọc ý chính và chi tiết trong nội dung cộng đồng.", en: "Read main ideas and details in community content." }, lessons: [{ slug: "opinions", title: { vi: "Một thư viện cho mọi người", en: "A library for everyone" }, skill: "Reading", minutes: 15 }] },
  { level: "B2", title: { vi: "Giao tiếp vững vàng", en: "Confident communication" }, description: { vi: "Xây dựng lập luận với từ nối chính xác.", en: "Build arguments with precise linking words." }, lessons: [{ slug: "arguments", title: { vi: "Xây dựng lập luận rõ ràng", en: "Build a clear argument" }, skill: "Grammar", minutes: 16 }] },
  { level: "C1", title: { vi: "Sử dụng linh hoạt", en: "Flexible use" }, description: { vi: "Nhận biết sắc thái trong phản hồi ở nơi làm việc.", en: "Recognise nuance in workplace feedback." }, lessons: [{ slug: "nuance", title: { vi: "Nghe sắc thái", en: "Hear the nuance" }, skill: "Listening", minutes: 15 }] },
  { level: "C2", title: { vi: "Làm chủ ngôn ngữ", en: "Language mastery" }, description: { vi: "Diễn giải ngôn ngữ chính xác và có điều kiện.", en: "Interpret precise, qualified language." }, lessons: [{ slug: "precision", title: { vi: "Diễn giải ngôn ngữ chính xác", en: "Interpret precise language" }, skill: "Listening", minutes: 18 }] }
];

export function getLesson(level: string, lessonSlug: string) { return cefrPath.find((item) => item.level.toLowerCase() === level.toLowerCase())?.lessons.find((lesson) => lesson.slug === lessonSlug); }
