import type { Locale } from "./i18n";

const adminCopy = {
  vi: {
    locale: "vi",
    eyebrow: "CMS quản trị",
    accessRequired: "Cần quyền quản trị",
    accessHelp: "Đăng nhập bằng email có trong ADMIN_EMAILS. Các API quản trị vẫn được bảo vệ khi mở trực tiếp trang này.",
    workflow: "Quy trình nội dung",
    signedInAs: "Đang đăng nhập với",
    databaseRequired: "Cần DATABASE_URL để quản lý nội dung đã xuất bản.",
    noBatches: "Chưa có lô nội dung nào. Hãy tạo lô nguồn đầu tiên trong Lesson Builder."
  },
  en: {
    locale: "en",
    eyebrow: "Admin CMS",
    accessRequired: "Admin access required",
    accessHelp: "Sign in with an email listed in ADMIN_EMAILS. Admin APIs remain protected even when this page is opened directly.",
    workflow: "Content workflow",
    signedInAs: "Signed in as",
    databaseRequired: "DATABASE_URL is required to manage published content.",
    noBatches: "There are no content batches yet. Create your first source batch in Lesson Builder."
  }
} as const;

export type AdminCopy = (typeof adminCopy)[Locale];
export function getAdminCopy(locale: Locale): AdminCopy { return adminCopy[locale]; }
