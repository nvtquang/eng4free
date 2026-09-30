import type { Locale } from "./i18n";

export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof cefrLevels)[number];

/** Interface copy describing each CEFR level (not lesson content — lessons come from the database). */
const copy: Record<CefrLevel, { title: Record<Locale, string>; description: Record<Locale, string> }> = {
  A1: { title: { vi: "Khởi đầu tự tin", en: "Start with confidence" }, description: { vi: "Chào hỏi và giới thiệu bản thân trong các tình huống quen thuộc.", en: "Greetings and introductions for familiar situations." } },
  A2: { title: { vi: "Giao tiếp thường ngày", en: "Everyday communication" }, description: { vi: "Diễn đạt kế hoạch đơn giản với cấu trúc rõ ràng.", en: "Express simple plans with clear structures." } },
  B1: { title: { vi: "Giao tiếp độc lập", en: "Independent communication" }, description: { vi: "Đọc ý chính và chi tiết trong nội dung cộng đồng.", en: "Read main ideas and details in community content." } },
  B2: { title: { vi: "Giao tiếp vững vàng", en: "Confident communication" }, description: { vi: "Xây dựng lập luận với từ nối chính xác.", en: "Build arguments with precise linking words." } },
  C1: { title: { vi: "Sử dụng linh hoạt", en: "Flexible use" }, description: { vi: "Nhận biết sắc thái trong phản hồi ở nơi làm việc.", en: "Recognise nuance in workplace feedback." } },
  C2: { title: { vi: "Làm chủ ngôn ngữ", en: "Language mastery" }, description: { vi: "Diễn giải ngôn ngữ chính xác và có điều kiện.", en: "Interpret precise, qualified language." } }
};

export function getCefrLevelCopy(level: CefrLevel, locale: Locale) {
  return { title: copy[level].title[locale], description: copy[level].description[locale] };
}
