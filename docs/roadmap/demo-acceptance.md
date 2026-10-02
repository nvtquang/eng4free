# D0 — Phạm vi demo và tiêu chí nghiệm thu

Ngày khảo sát: 2026-09-26 · Trạng thái: **D0–D8 đã triển khai; nghiệm thu D8 ngày 2026-10-01 (xem mục 8)**

Tài liệu này là thước đo cho mọi giai đoạn tiếp theo. Một giai đoạn chỉ được coi
là xong khi các bước kịch bản liên quan chuyển sang ✅ và các lỗi được gán cho giai
đoạn đó đã đóng.

Ký hiệu trạng thái: ✅ chạy được đúng mong đợi · ⚠️ chạy nhưng thiếu/chưa đạt ·
❌ chưa có.

---

## 1. Phạm vi demo

### Trong phạm vi

- Chạy trên máy local với PostgreSQL local; toàn bộ hành trình dùng được ở chế độ
  khách (guest), đăng nhập Google là tùy chọn.
- Tiếng Việt là ngôn ngữ mặc định; tiếng Anh phải đầy đủ tương đương.
- Học theo CEFR A1–C2, từ vựng, ngữ pháp, phát âm, bốn kỹ năng, TOEIC, IELTS,
  dashboard, CMS cho admin.
- AI (Gemini) **được bật** trong buổi demo cho AI Tutor, Writing feedback,
  Speaking transcript + feedback. Mọi màn hình AI phải có phương án dự phòng
  (fallback) hiển thị trung thực khi mất mạng hoặc hết quota.
- Nội dung là nội dung gốc, CC0 hoặc có giấy phép rõ ràng; không dùng đề ETS/
  Cambridge.

### Ngoài phạm vi (không làm trước khi demo xong)

- Deploy, domain, R2/S3, cloud PostgreSQL, Redis, worker, giám sát production.
- Hội thoại realtime, chấm phát âm mức âm vị, `services/speech`.
- Thanh toán, mạng xã hội, blog.

### Môi trường chạy demo

- Bản demo chạy bằng production build (`pnpm build` + `pnpm start`), không chạy
  bằng dev server: lần tải đầu trang chủ ở dev server mất ~21 giây do biên dịch.
- Dữ liệu demo nằm trong một database riêng, không bị E2E ghi đè (xem DA-01).

---

## 2. Kịch bản demo

Ba kịch bản dưới đây là “hợp đồng” của bản demo. Tổng thời lượng trình diễn
mục tiêu: 8–10 phút.

### Kịch bản A — Người mới bắt đầu (khách, mục tiêu giao tiếp) · ~4 phút

| # | Bước | Tiêu chí đạt | Hiện tại (D8, 2026-10-01) | Giai đoạn |
|---|---|---|---|---|
| A1 | Mở trang chủ, bấm **Làm bài kiểm tra xếp lớp** | Mở placement test 15–20 câu, độ khó tăng dần, nhiều dạng câu | ✅ **Bắt đầu học** → onboarding → bài xếp lớp thích ứng 20 câu (Ngữ pháp, Từ vựng, Đọc, Nghe) | D4, D7.4 |
| A2 | Nhận kết quả xếp lớp | Hiển thị level đề xuất + lý do ngắn, lưu vào hồ sơ khách | ✅ Trình độ đề xuất, trình độ theo kỹ năng, số câu đúng; lưu vào hồ sơ | D4 |
| A3 | Chọn mục tiêu và thời lượng mỗi ngày (onboarding) | Lưu được, quay lại vẫn còn | ✅ | D4 |
| A4 | Vào trang **Hôm nay học gì** | Gợi ý bài tiếp theo, số từ đến hạn ôn, mục tiêu ngày | ✅ `/today` | D4, D7.5 |
| A5 | Học một bài A2: đọc lý thuyết → làm bài tập → hoàn thành | Bài có ≥2 dạng câu hỏi, có audio thật, có giải thích; hoàn thành cộng XP | ⚠️ Có audio thật, giải thích, XP, câu sai vào sổ lỗi sai; **bài học vẫn chỉ có câu trắc nghiệm** (các dạng khác mới có trong đề thi) | D2, D3, D5 |
| A6 | Lưu từ mới ngay trong bài, sau đó ôn flashcard | Từ vào sổ từ; ôn theo FSRS, lịch ôn lưu trên server | ✅ Khung **Từ mới trong bài** lưu từ vào sổ; **Ôn sổ từ** mở `/vocabulary?deck=due` gồm mọi từ đến hạn, không phụ thuộc level/trang (D8) | D5, D8 |
| A7 | Làm lại câu sai trong sổ lỗi sai | Có danh sách câu sai từ bài học/đề thi để luyện lại | ✅ `/mistakes` | D5 |
| A8 | Mở dashboard | XP, streak, heatmap, tiến độ kỹ năng thay đổi đúng theo các bước trên | ✅ Streak giữ nguyên trong ngày hiện tại cho tới khi bỏ trọn một ngày (D8) | — |
| A9 | Đăng nhập Google | Toàn bộ tiến độ của khách được chuyển sang tài khoản | ✅ Gộp khách → tài khoản (D7.1); E2E kiểm tra qua tài khoản demo, dùng chung cơ chế với Google | D7.1, D8 |

### Kịch bản B — Người luyện TOEIC · ~3 phút

| # | Bước | Tiêu chí đạt | Hiện tại (D8, 2026-10-01) | Giai đoạn |
|---|---|---|---|---|
| B1 | Mở `/toeic` | Danh mục gọn, chỉ có đề thật, nhãn tiếng Việt, nhóm theo Part/Mini/Full | ✅ Thi thử, Mini test, Luyện tập Part 1–7; DB dựng bằng `demo:prepare` không có đề rác | D7, D8 |
| B2 | Luyện Part 1 (có ảnh) và Part 3 (hội thoại 2–3 giọng) | Ảnh + audio file thật, phân vai rõ | ✅ | D2, D3 |
| B3 | Làm Mini test | Đủ số câu hợp lý (≥20), timer, autosave, reload vẫn tiếp tục được | ✅ 22 câu | D3 |
| B4 | Nộp bài, xem kết quả | Điểm quy đổi ước tính theo thang TOEIC, phân tích theo Part | ✅ Điểm ước tính Nghe/Đọc/Tổng; thẻ **Kết quả theo phần** đánh dấu Part nên luyện thêm (D8) | D3, D8 |
| B5 | Mở một câu sai, hỏi AI Tutor | Giải thích theo ngữ cảnh, bám lời giải chính thức; có fallback | ✅ Hỏi tiếp nhiều lượt; không có AI thì hiện lời giải chính thức | D6 |
| B6 | Xem lịch sử làm đề | Truy cập được từ trang TOEIC và dashboard | ✅ | — |
| B7 | (Tùy chọn) Full mock | Ít nhất 1 đề đủ 7 Part theo đúng tỉ lệ rút gọn có ghi chú | ✅ 200 câu, 7 Part, 120 phút | D3 |

### Kịch bản C — Người luyện IELTS · ~3 phút

| # | Bước | Tiêu chí đạt | Hiện tại (D8, 2026-10-01) | Giai đoạn |
|---|---|---|---|---|
| C1 | Mở `/ielts` | Thấy đủ 4 kỹ năng: Listening, Reading, Writing, Speaking | ✅ | — |
| C2 | Làm Reading có True/False/Not Given, matching, điền từ | Chấm đúng mọi dạng câu | ✅ IELTS Reading Test 1: 40 câu, 7 dạng | D1, D3 |
| C3 | Làm Listening có audio thật | File audio, nghe tối đa theo quy định, điền form/note | ✅ IELTS Listening Test 1: 4 section | D2, D3 |
| C4 | Nộp bài | Band Listening/Reading quy đổi theo bảng | ✅ Band ước tính theo kỹ năng và kết quả theo phần | D8 |
| C5 | Viết Task 2, lưu nháp, nộp, nhận feedback | Feedback theo 4 tiêu chí, có lịch sử bản sửa, không bịa band | ✅ Bài đã có nhận xét không còn bị gắn nhãn *Bản nháp*; ngày giờ theo ngôn ngữ giao diện (D8) | D6, D8 |
| C6 | Speaking Part 2: xem cue card, chuẩn bị 1 phút, nói 2 phút | Có đồng hồ chuẩn bị/nói, transcript + feedback, lưu lịch sử | ✅ Đồng hồ chuẩn bị 1:00 và đồng hồ nói tự dừng ở 2:00 (D8) | D6, D8 |

### Kịch bản phụ D — Admin (chỉ trình diễn nếu được hỏi) · ~1 phút

| # | Bước | Tiêu chí đạt | Hiện tại | Giai đoạn |
|---|---|---|---|---|
| D1 | Import file CSV đề thi → map cột → DRAFT | Hoạt động | ✅ | — |
| D2 | Review → Approve → Publish → người học thấy ngay | Hoạt động | ✅ | — |
| D3 | Tạo câu hỏi dạng không phải MCQ trong CMS | Có form cho từng dạng | ✅ Form theo dạng câu, kiểm tra ngay; importer có cột tương ứng | — |

---

## 3. Kiểm kê route (khách, cả `vi` và `en`)

Tất cả route dưới đây trả HTTP 200 (route lạ trả 404 đúng).

| Route | Có link từ đâu | Nội dung thực tế | Vấn đề |
|---|---|---|---|
| `/` | — | Hero, 6 level, 3 thẻ tính năng | Nút xếp lớp giả (DA-02); thẻ “Luyện thi” chỉ dẫn tới Part 5; thẻ Từ vựng dùng lại mô tả của phần level |
| `/learn` | Header | 6 level, 24 bài | 6 bài “E2E Published Lesson” ở A1 (DA-01); tiêu đề bài chỉ có tiếng Anh |
| `/learn/[level]/[lesson]` | `/learn` | Lý thuyết + MCQ + hoàn thành | Hiển thị enum thô `SPEAKING`; chỉ MCQ |
| `/grammar` | Header | 2 chủ đề viết cứng trong code | DB có 12 bài GRAMMAR không được liệt kê (DA-08) |
| `/vocabulary` | Header | 23 từ/level, flashcard | Từ loại hiển thị `mixed`; trùng từ `name` (DA-11); lịch ôn chỉ ở localStorage |
| `/pronunciation` | Header | 44 âm IPA, minimal pairs, shadowing | Hiển thị trạng thái “Speech Service” (thuật ngữ nội bộ) |
| `/skills` | Header | 4 thẻ kỹ năng | — |
| `/skills/listening` | `/skills` | 2 bài (C1, C2) | Không có bài cho A1–B2; tiêu đề phụ “Listening” chưa dịch |
| `/skills/reading` | `/skills` | 1 bài (B1) | Rất mỏng |
| `/skills/writing` | `/skills` | 1 đề + AI feedback | Ghi “chưa sử dụng AI hoặc cloud” trong khi đã có AI (DA-09) |
| `/skills/speaking` | `/skills` | 1 đề + push-to-talk + AI | Chỉ 1 đề |
| `/toeic` | Header | 25 đề | 14 đề rác; nhãn chế độ chưa dịch |
| `/toeic/history` | **Không có** | Lịch sử | Route mồ côi |
| `/toeic/practice/part-5` | Trang chủ | Runner Part 5 cũ | Trùng chức năng với exam engine chung |
| `/ielts` | Header | 3 đề L/R | Không có lối vào Writing/Speaking |
| `/ielts/writing` | **Không có** | Form cũ | Route mồ côi, luồng cũ, câu chữ nội bộ (“Question Engine, Attempt Engine…”) |
| `/ielts/speaking` | **Không có** | Recorder cũ | Route mồ côi, luồng cũ |
| `/exams/[slug]` | Danh mục đề | Runner chung | Mô tả “Bản demo nội dung gốc chạy local · đáp án được chấm ở máy chủ”; enum `FULL_MOCK` hiển thị thô |
| `/dashboard` | Avatar (chỉ khi đăng nhập), sau khi xong bài | Số liệu thật | Khách không có link trên header |
| `/login` | Header | Google | — |
| `/about`, `/blog` | Footer | “Đang xây dựng” | Trang placeholder (DA-12) |
| `/privacy` | **Không có** | Chính sách | Route mồ côi; cần link ở footer |
| `/admin` | — | Chặn khách đúng | ✅ |

---

## 4. Danh sách lỗi và khoảng trống

Mức độ: **P0** chặn demo · **P1** làm demo kém thuyết phục · **P2** đánh bóng.

| ID | Mức | Vấn đề | Bằng chứng | Hướng xử lý | Giai đoạn |
|---|---|---|---|---|---|
| DA-01 | P0 | ~~E2E ghi dữ liệu rác vào DB dev, và `test:e2e` chạy `qa:prepare` nên sẽ **xóa sạch** dữ liệu demo~~ ✅ Đã xử lý | 6 bài `e2e-lesson-*`, 14 đề `e2e-exam-*`/`csv-import-*` đang PUBLISHED; Playwright dùng chung `DATABASE_URL` | Tách DB `english4free_e2e` cho E2E; thêm `pnpm demo:prepare` cho DB demo | D0-fix |
| DA-02 | P0 | ~~Nút “Làm bài kiểm tra xếp lớp” là link giả~~ ✅ Tạm xử lý: nút đổi thành “Luyện thi TOEIC & IELTS”; placement test làm ở D4 | `app/page.tsx` trỏ `/learn` | Làm placement test; trước đó ẩn nút | D4 |
| DA-03 | P0 | ~~Question Engine chỉ chấm MCQ~~ ✅ Đã xử lý ở D1 | 96/96 câu là MCQ; content pack bỏ qua các câu `fill_in`/`matching` | Thêm FILL_BLANK, TRUE_FALSE(+NG), MULTI_SELECT, MATCHING, ORDERING, DICTATION | D1 |
| DA-04 | P0 | ~~Không có file audio/ảnh~~ ✅ Đã xử lý ở D2 | Listening và exam dùng `speechSynthesis` | Sinh audio TTS nhiều giọng + ảnh Part 1, lưu `public/demo-media` | D2 |
| DA-05 | P0 | ~~IELTS Writing/Speaking có 2 luồng song song, bản dành cho IELTS là bản cũ và không có link~~ ✅ Đã xử lý | `/ielts/writing` dùng `IeltsWritingForm`; `/ielts/speaking` dùng `AudioRecorder` | Dùng chung `WritingWorkspace`/`SpeakingPractice` với đề IELTS; thêm lối vào từ `/ielts` | D6, D7 |
| DA-06 | P1 | ~~Nội dung mỏng~~ ✅ D3 đã soạn, đang chờ duyệt ngẫu nhiên rồi publish | 24 bài (6 bài rác), Listening chỉ C1–C2, Reading chỉ B1, 1 đề Writing, 1 đề Speaking; Mini test 4 câu, Full mock 7 câu | Theo chỉ tiêu mục 5 | D3 |
| DA-07 | P1 | ~~Không có onboarding, “Hôm nay học gì”, gộp dữ liệu khách → tài khoản~~ ✅ Đã xử lý ở D4, D7.1 | Không có code liên quan | Xây mới | D4 |
| DA-08 | P1 | ~~Trang Ngữ pháp viết cứng 2 chủ đề~~ ✅ Đã xử lý | `grammar/page.tsx` có mảng `topics` cố định | Đọc từ DB, nhóm theo level | D5 |
| DA-09 | P1 | ~~Câu chữ nội bộ lộ ra cho người học, có chỗ sai sự thật~~ ✅ Đã xử lý | “Dữ liệu được lưu local trong PostgreSQL; chưa sử dụng AI hoặc cloud”, “Luyện viết local”, “Fixture v0.1”, “Speech Service”, “Question Engine, Attempt Engine” | Viết lại toàn bộ microcopy hướng người học | D7 |
| DA-10 | P1 | ~~Enum và nhãn chưa dịch~~ ✅ Đã xử lý | `PRACTICE`, `MINI TEST`, `FULL_MOCK`, `SPEAKING`, eyebrow “Listening/Reading/Writing” trong bản `vi` | Gom vào `i18n` | D7 |
| DA-11 | P1 | ~~Dữ liệu từ vựng lỗi~~ ✅ Đã xử lý ở giao diện (ẩn `mixed`, gộp từ trùng); dữ liệu gốc chuẩn hóa ở D3 | Từ loại `mixed`; `name` xuất hiện 2 lần ở A1 | Chuẩn hóa lại khi mở rộng từ vựng | D3 |
| DA-12 | P2 | ~~`/about`, `/blog` là placeholder~~ ✅ Đã xử lý | Nội dung “Đang xây dựng” | Viết trang About ngắn, ẩn Blog; thêm link Privacy | D7 |
| DA-13 | P2 | ~~Component đã viết nhưng không dùng~~ ✅ Đã xử lý | `ToeicScoreEstimator`, `IeltsBandCalculator` | Gắn vào trang kết quả | D3/D7 |
| DA-14 | P2 | ~~Route mồ côi~~ ✅ Đã xử lý | `/toeic/history`, `/ielts/writing`, `/ielts/speaking`, `/privacy` | Thêm lối vào | D7 |
| DA-15 | P2 | ~~Runner Part 5 cũ trùng với exam engine~~ ✅ Route cũ chuyển hướng sang runner chung (D7.3) | `/toeic/practice/part-5` | Chuyển hướng sang `/exams/toeic-part-5-demo` | D7 |
| DA-16 | P2 | ~~Dev server chậm ở lần tải đầu~~ ✅ `pnpm demo:prepare` build production, `pnpm demo:start` phục vụ bản build | `/` mất ~21 giây | Demo chạy bằng production build | D8 |

---

### Kết quả D0-fix (2026-09-26)

- E2E chạy trên database riêng (`pnpm test:e2e` → `english4free_e2e`, tự tạo nếu chưa có); `pnpm db:clean-test-content` dọn nội dung E2E khỏi database hiện tại mà không đụng dữ liệu học khác.
- Lịch ôn từ vựng FSRS được lưu trong `vocabulary_reviews` cho cả khách và tài khoản (migration `0013`); trang Từ vựng đưa từ đến hạn lên trước và ẩn từ chưa tới hạn.
- Trang kết quả đề thi hiển thị điểm TOEIC / band IELTS ước tính theo kỹ năng, ghi rõ là ước tính luyện tập.
- Sửa lỗi AI luôn báo “không khả dụng”: Gemini mất ~12 giây trong khi timeout là 12 giây. Provider giờ dùng `thinking_level: low` (~8 giây), timeout 30 giây và thử lại một lần khi Gemini quá tải. Lưu ý khi demo: mỗi lượt nhận xét AI mất khoảng 8–10 giây.
- Nghe, Đọc, Ngữ pháp lấy danh sách bài từ database; IELTS Writing/Speaking dùng chung luồng đầy đủ; thêm trang Giới thiệu, Quyền riêng tư; bỏ trang Blog.

## 5. Chỉ tiêu nội dung tối thiểu cho demo

| Loại | Trước D3 (bỏ dữ liệu rác) | Mục tiêu | Sau D3 (content pack `content/packs/d3`) |
|---|---|---|---|
| Bài học CEFR (kỹ năng) | 6 | ≥30, mỗi level ≥5, đủ 4 kỹ năng + ngữ pháp | 30: 6 bài cũ + 24 bài D3 (Đọc, Nghe, Nói, Viết × 6 level) |
| Chủ đề ngữ pháp | 0 (12 bài placeholder) | ≥20, mỗi bài ≥8 câu | 24 chủ đề, 4/level, mỗi chủ đề 8 câu; thay 12 bài placeholder |
| Từ vựng | 138 (nghĩa không có nguồn) | ≥600, có từ loại đúng, IPA, ví dụ, nghĩa tiếng Việt | 763 từ; nghĩa và IPA từ Wiktionary (CC BY-SA), level từ Words-CEFR / Octanove, ví dụ tự viết |
| Bài Listening | 2 | ≥6 (A1→C2), có file audio | 8, đều có audio Piper |
| Bài Reading | 1 | ≥6 (A1→C2) | 7 |
| Đề Writing | 1 + 1 IELTS | ≥6 | 6 đề IELTS (3 Task 1 có biểu đồ, 3 Task 2) + 1 chung + 8 bài Viết |
| Đề Speaking | 1 + 1 IELTS | ≥6 | 5 bộ IELTS Part 1/2/3 + 1 chung + 7 bài Nói |
| TOEIC luyện Part | 1 câu/Part | ≥6 câu/Part | 7 bộ luyện: P1 6 · P2 10 · P3 9 · P4 9 · P5 15 · P6 8 · P7 14 |
| TOEIC Mini test | 4 câu | ≥20 câu | 22 câu |
| TOEIC Full mock | 7 câu | ≥50 câu, đủ 7 Part | 200 câu đủ 7 Part (theo yêu cầu đã chốt) |
| IELTS Listening | 1 đề nhỏ | 1 đề ≥20 câu, ≥3 dạng câu | 1 đề đủ 40 câu, 4 section, 5 dạng câu |
| IELTS Reading | 1 đề nhỏ | 1 đề ≥20 câu, có TFNG/matching/điền từ | 1 đề đủ 40 câu, 3 bài, 7 dạng câu |
| Placement test | 0 | 15–20 câu A1→C2 |

---

## 6. Checklist nghiệm thu chung

Bản demo đạt khi **tất cả** các mục sau đúng. Trạng thái kiểm lại ngày 2026-10-01 (D8):

- [ ] Ba kịch bản A, B, C chạy hết từ đầu đến cuối, mọi bước ✅. *Cả ba chạy hết không lỗi (E2E `demo-scenario-a|b|c`); riêng A5 còn ⚠️ vì bài học chỉ có câu trắc nghiệm.*
- [x] Không còn dữ liệu rác hay tên kỹ thuật (`E2E`, `Fixture`, `CSV imported`) trong giao diện người học. *Đã kiểm trên DB dựng bằng `pnpm demo:prepare`.*
- [x] Không còn nút/link giả, không còn route mồ côi, không còn trang “Đang xây dựng” trên đường điều hướng.
- [x] Bản `vi` không có nhãn/enum tiếng Anh ngoài nội dung học; bản `en` không có tiếng Việt. *D8 sửa thêm ngày giờ trong lịch sử Viết/Nói đang hiện theo kiểu tiếng Anh.*
- [x] Không có câu chữ nội bộ (PostgreSQL, Engine, Service, local, contract) hiển thị cho người học. *D8 bỏ “Thêm GEMINI_API_KEY để bật STT” và “cấu hình Gemini, máy chủ” khỏi trang Nói.*
- [x] Mọi màn hình AI có fallback trung thực khi mất mạng hoặc không có key; không bịa band/điểm. *E2E chạy không có key: Viết, Nói và trợ giảng đều báo đúng là chưa có nhận xét AI.*
- [x] Reload trang ở bất kỳ bước nào không mất dữ liệu. *E2E kiểm hồ sơ sau onboarding, đề thi đang làm và bản nháp bài viết.*
- [x] Giao diện dùng được ở 375px, 390px và desktop.
- [x] `pnpm demo:prepare` dựng lại DB demo sạch trong một lệnh; E2E không đụng tới DB demo.
- [x] Có tài khoản demo với 2–3 tuần lịch sử học để dashboard trông như đang được dùng thật.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` và E2E cho 3 kịch bản đều pass. *`pnpm test:all`: 105 unit test, 38/38 E2E.*

---

## 7. Thứ tự triển khai sau D0

1. **D0-fix** (nửa ngày): tách DB E2E, dọn dữ liệu rác, ẩn nút xếp lớp giả. Làm ngay để mọi buổi kiểm tra sau có dữ liệu sạch.
2. **D1** Question Engine đa dạng câu hỏi.
3. **D2** Audio và ảnh thật.
4. **D3** Nội dung (chạy song song với D4–D6).
5. **D4** Placement test, onboarding, “Hôm nay học gì”, gộp dữ liệu khách.
6. **D5** Sổ từ, lịch FSRS trên server, ngữ pháp từ DB, sổ lỗi sai.
7. **D6** AI: gộp luồng IELTS Writing/Speaking, Speaking Part 2/3, Tutor nhiều lượt, bộ bài mẫu đánh giá.
8. **D7** UI/UX, microcopy, i18n, điều hướng.
9. **D8** `demo:prepare`, tài khoản demo có lịch sử, E2E ba kịch bản, kịch bản thuyết trình.

---

## 8. Kết quả D8 (2026-10-01)

**Chuẩn bị demo trong một lệnh.** `pnpm demo:prepare` (`scripts/demo-prepare.ts`) chạy lần lượt:

1. sao lưu DB bằng `pg_dump` vào `.cache/demo-backups/`;
2. reset, migrate, seed;
3. import content pack D3, rồi publish lại **chỉ** những batch trùng khớp bản đã duyệt. Hash của từng mục lúc duyệt nằm trong `content/packs/d3/qa/approved.json`, do `content:d3:publish` ghi lại. Batch nào bị sửa sau lần duyệt thì giữ ở REVIEW;
4. kiểm tra audio, tự sinh file còn thiếu;
5. seed tài khoản demo;
6. build production.

Cả quy trình mất khoảng 2 phút. `pnpm demo:start` phục vụ bản build và bật nút **Vào tài khoản demo** ở `/login`. Nút này chỉ hoạt động khi có `E4F_DEMO_SIGN_IN=true` và DB là `english4free*` trên localhost.

**Tài khoản demo.** `pnpm seed:demo-account` (`scripts/seed/demo-account/`) tạo học viên *Minh Anh (demo)*. Ba tuần học được chạy lại qua chính các module của app dưới một đồng hồ lùi thời gian, nên mọi con số đều do app tự tính:

- bài xếp lớp thích ứng ra B1, mục tiêu IELTS;
- 10 bài học, 6 lượt làm đề, 72 từ trong sổ từ;
- chuỗi 16 ngày, kết thúc hôm qua;
- 2 bài viết IELTS (Task 2 có 2 phiên bản), 2 bài nói Part 2/3.

Nhận xét AI cho bài viết và bài nói là đầu ra thật của pipeline AI trong app, lấy một lần bằng `--capture-feedback` và lưu trong `captured-feedback.json`. Nhờ vậy seed không cần mạng hay quota.

**E2E ba kịch bản.** `e2e/demo-scenario-a.spec.ts`, `-b`, `-c` chạy bằng tiếng Việt và không có AI key. Cả ba pass trên DB E2E và trên một DB dựng bằng `pnpm demo:prepare`.

**Lỗi và khoảng trống tìm ra khi đi kịch bản, đã sửa:**

| Vấn đề | Sửa |
|---|---|
| Nút “Ôn ngay” ở Hôm nay mở `/vocabulary` (A1, trang 1); hàng đợi chỉ gồm thẻ của trang đang xem nên từ đến hạn ở level khác không bao giờ được ôn | Chế độ **Đến hạn ôn** `/vocabulary?deck=due` gồm mọi từ đến hạn trong sổ từ |
| Không lưu được từ ngay trong bài (A6) | Khung **Từ mới trong bài**: từ vựng đã duyệt xuất hiện trong bài, ở level của bài (thêm level dưới khi tìm được ít), bỏ qua hư từ |
| Trang kết quả không phân tích theo Part (B4) | Thẻ **Kết quả theo phần**, đánh dấu phần nên luyện thêm |
| Speaking Part 2 không có đồng hồ nói (C6) | Đồng hồ khi ghi âm; Part 2 tự dừng ở 2:00 |
| Bài viết đã có nhận xét AI bị gắn nhãn “Bản nháp” (Viết và dashboard) | Chỉ trạng thái DRAFT mới là bản nháp |
| Ngày giờ trong lịch sử Viết/Nói theo ngôn ngữ trình duyệt, không theo giao diện | `formatDateTime` theo `<html lang>` |
| Trang Nói hiện “Thêm GEMINI_API_KEY để bật STT”, “cấu hình Gemini, máy chủ” | Viết lại cho người học |
| Chuỗi ngày về 0 ngay khi sang ngày mới dù chưa bỏ ngày nào | Ngày hôm nay chưa học vẫn giữ chuỗi; chỉ mất khi bỏ trọn một ngày |

**Còn lại:**

- A5: bài học chỉ có câu trắc nghiệm.
- Kiểm tra micro trên máy thật là bước thủ công ([manual-microphone.md](../qa/manual-microphone.md)) và nằm trong [checklist trước buổi demo](../demo/pre-demo-checklist.md).

**Tài liệu:** [kịch bản demo 8–10 phút](../demo/demo-script.md), [checklist trước buổi demo](../demo/pre-demo-checklist.md).
