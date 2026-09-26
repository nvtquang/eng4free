# D0 — Phạm vi demo và tiêu chí nghiệm thu

Ngày khảo sát: 2026-09-26 · Trạng thái: **đã chốt phạm vi; D0-fix đã xong (2026-09-26), chờ triển khai D1–D8**

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

| # | Bước | Tiêu chí đạt | Hiện tại | Giai đoạn |
|---|---|---|---|---|
| A1 | Mở trang chủ, bấm **Làm bài kiểm tra xếp lớp** | Mở placement test 15–20 câu, độ khó tăng dần, nhiều dạng câu | ❌ Nút đang trỏ về `/learn`, chưa có placement test | D4 |
| A2 | Nhận kết quả xếp lớp | Hiển thị level đề xuất + lý do ngắn, lưu vào hồ sơ khách | ❌ | D4 |
| A3 | Chọn mục tiêu và thời lượng mỗi ngày (onboarding) | Lưu được, quay lại vẫn còn | ❌ | D4 |
| A4 | Vào trang **Hôm nay học gì** | Gợi ý bài tiếp theo, số từ đến hạn ôn, mục tiêu ngày | ❌ | D4 |
| A5 | Học một bài A2: đọc lý thuyết → làm bài tập → hoàn thành | Bài có ≥2 dạng câu hỏi, có audio thật, có giải thích; hoàn thành cộng XP | ⚠️ Bài học vẫn chỉ có MCQ (engine đề thi đã đủ dạng câu), mỗi bài 2–3 khối, không có audio file | D2, D3, D5 |
| A6 | Lưu từ mới ngay trong bài, sau đó ôn flashcard | Từ vào sổ từ; ôn theo FSRS, lịch ôn lưu trên server | ⚠️ Lịch FSRS đã lưu trên server (khách và tài khoản), trang Từ vựng xếp từ đến hạn lên trước; chưa lưu được từ ngay trong bài học | D5 |
| A7 | Làm lại câu sai trong sổ lỗi sai | Có danh sách câu sai từ bài học/đề thi để luyện lại | ❌ | D5 |
| A8 | Mở dashboard | XP, streak, heatmap, tiến độ kỹ năng thay đổi đúng theo các bước trên | ✅ Dashboard có trên thanh điều hướng, số liệu thật | — |
| A9 | Đăng nhập Google | Toàn bộ tiến độ của khách được chuyển sang tài khoản | ❌ Chưa có logic gộp dữ liệu khách → tài khoản | D4 |

### Kịch bản B — Người luyện TOEIC · ~3 phút

| # | Bước | Tiêu chí đạt | Hiện tại | Giai đoạn |
|---|---|---|---|---|
| B1 | Mở `/toeic` | Danh mục gọn, chỉ có đề thật, nhãn tiếng Việt, nhóm theo Part/Mini/Full | ⚠️ Đã sạch dữ liệu rác, nhãn đã dịch, tên đề đã đổi; chưa nhóm theo Part/Mini/Full | D7 |
| B2 | Luyện Part 1 (có ảnh) và Part 3 (hội thoại 2–3 giọng) | Ảnh + audio file thật, phân vai rõ | ❌ Không có ảnh; audio là giọng đọc trình duyệt | D2 |
| B3 | Làm Mini test | Đủ số câu hợp lý (≥20), timer, autosave, reload vẫn tiếp tục được | ⚠️ Luồng kỹ thuật đã ổn (timer, autosave, resume) nhưng chỉ 4 câu | D3 |
| B4 | Nộp bài, xem kết quả | Điểm quy đổi ước tính theo thang TOEIC, phân tích theo Part | ⚠️ Có điểm quy đổi ước tính theo kỹ năng (Listening/Reading/Tổng); chưa phân tích theo Part | D3 |
| B5 | Mở một câu sai, hỏi AI Tutor | Giải thích theo ngữ cảnh, bám lời giải chính thức; có fallback | ✅ Đã có (cần Gemini key); ⚠️ chưa hỏi tiếp nhiều lượt | D6 |
| B6 | Xem lịch sử làm đề | Truy cập được từ trang TOEIC và dashboard | ✅ Có nút từ `/toeic` và `/ielts`, mỗi lượt có link xem lại | — |
| B7 | (Tùy chọn) Full mock | Ít nhất 1 đề đủ 7 Part theo đúng tỉ lệ rút gọn có ghi chú | ⚠️ “Full-format Demo” chỉ có 7 câu | D3 |

### Kịch bản C — Người luyện IELTS · ~3 phút

| # | Bước | Tiêu chí đạt | Hiện tại | Giai đoạn |
|---|---|---|---|---|
| C1 | Mở `/ielts` | Thấy đủ 4 kỹ năng: Listening, Reading, Writing, Speaking | ✅ | — |
| C2 | Làm Reading có True/False/Not Given, matching, điền từ | Chấm đúng mọi dạng câu | ✅ Đề `ielts-practice-test-1` có TFNG, nối tiêu đề, điền tóm tắt, chọn 2, MCQ; chấm theo điểm từng ô/mục | — |
| C3 | Làm Listening có audio thật | File audio, nghe tối đa theo quy định, điền form/note | ⚠️ Có điền form, chọn 2, nối; audio vẫn là giọng trình duyệt | D2 |
| C4 | Nộp bài | Band Listening/Reading quy đổi theo bảng | ✅ Trang kết quả hiện band ước tính theo từng kỹ năng (quy đổi tỉ lệ đúng sang 40 câu) | — |
| C5 | Viết Task 2, lưu nháp, nộp, nhận feedback | Feedback theo 4 tiêu chí, có lịch sử bản sửa, không bịa band | ✅ `/ielts/writing` dùng chung luồng nháp → nộp → feedback → lịch sử (cần Gemini key cho feedback) | — |
| C6 | Speaking Part 2: xem cue card, chuẩn bị 1 phút, nói 2 phút | Có đồng hồ chuẩn bị/nói, transcript + feedback, lưu lịch sử | ⚠️ `/ielts/speaking` đã dùng push-to-talk + transcript + feedback cho Part 1; chưa có Part 2/3 và đồng hồ | D6 |

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
| DA-04 | P0 | Không có file audio/ảnh | Listening và exam dùng `speechSynthesis` | Sinh audio TTS nhiều giọng + ảnh Part 1, lưu `public/demo-media` | D2 |
| DA-05 | P0 | ~~IELTS Writing/Speaking có 2 luồng song song, bản dành cho IELTS là bản cũ và không có link~~ ✅ Đã xử lý | `/ielts/writing` dùng `IeltsWritingForm`; `/ielts/speaking` dùng `AudioRecorder` | Dùng chung `WritingWorkspace`/`SpeakingPractice` với đề IELTS; thêm lối vào từ `/ielts` | D6, D7 |
| DA-06 | P1 | Nội dung mỏng | 24 bài (6 bài rác), Listening chỉ C1–C2, Reading chỉ B1, 1 đề Writing, 1 đề Speaking; Mini test 4 câu, Full mock 7 câu | Theo chỉ tiêu mục 5 | D3 |
| DA-07 | P1 | Không có onboarding, “Hôm nay học gì”, gộp dữ liệu khách → tài khoản | Không có code liên quan | Xây mới | D4 |
| DA-08 | P1 | ~~Trang Ngữ pháp viết cứng 2 chủ đề~~ ✅ Đã xử lý | `grammar/page.tsx` có mảng `topics` cố định | Đọc từ DB, nhóm theo level | D5 |
| DA-09 | P1 | ~~Câu chữ nội bộ lộ ra cho người học, có chỗ sai sự thật~~ ✅ Đã xử lý | “Dữ liệu được lưu local trong PostgreSQL; chưa sử dụng AI hoặc cloud”, “Luyện viết local”, “Fixture v0.1”, “Speech Service”, “Question Engine, Attempt Engine” | Viết lại toàn bộ microcopy hướng người học | D7 |
| DA-10 | P1 | ~~Enum và nhãn chưa dịch~~ ✅ Đã xử lý | `PRACTICE`, `MINI TEST`, `FULL_MOCK`, `SPEAKING`, eyebrow “Listening/Reading/Writing” trong bản `vi` | Gom vào `i18n` | D7 |
| DA-11 | P1 | ~~Dữ liệu từ vựng lỗi~~ ✅ Đã xử lý ở giao diện (ẩn `mixed`, gộp từ trùng); dữ liệu gốc chuẩn hóa ở D3 | Từ loại `mixed`; `name` xuất hiện 2 lần ở A1 | Chuẩn hóa lại khi mở rộng từ vựng | D3 |
| DA-12 | P2 | ~~`/about`, `/blog` là placeholder~~ ✅ Đã xử lý | Nội dung “Đang xây dựng” | Viết trang About ngắn, ẩn Blog; thêm link Privacy | D7 |
| DA-13 | P2 | ~~Component đã viết nhưng không dùng~~ ✅ Đã xử lý | `ToeicScoreEstimator`, `IeltsBandCalculator` | Gắn vào trang kết quả | D3/D7 |
| DA-14 | P2 | ~~Route mồ côi~~ ✅ Đã xử lý | `/toeic/history`, `/ielts/writing`, `/ielts/speaking`, `/privacy` | Thêm lối vào | D7 |
| DA-15 | P2 | Runner Part 5 cũ trùng với exam engine | `/toeic/practice/part-5` | Chuyển hướng sang `/exams/toeic-part-5-demo` | D7 |
| DA-16 | P2 | Dev server chậm ở lần tải đầu | `/` mất ~21 giây | Demo chạy bằng production build | D8 |

---

### Kết quả D0-fix (2026-09-26)

- E2E chạy trên database riêng (`pnpm test:e2e` → `english4free_e2e`, tự tạo nếu chưa có); `pnpm db:clean-test-content` dọn nội dung E2E khỏi database hiện tại mà không đụng dữ liệu học khác.
- Lịch ôn từ vựng FSRS được lưu trong `vocabulary_reviews` cho cả khách và tài khoản (migration `0013`); trang Từ vựng đưa từ đến hạn lên trước và ẩn từ chưa tới hạn.
- Trang kết quả đề thi hiển thị điểm TOEIC / band IELTS ước tính theo kỹ năng, ghi rõ là ước tính luyện tập.
- Sửa lỗi AI luôn báo “không khả dụng”: Gemini mất ~12 giây trong khi timeout là 12 giây. Provider giờ dùng `thinking_level: low` (~8 giây), timeout 30 giây và thử lại một lần khi Gemini quá tải. Lưu ý khi demo: mỗi lượt nhận xét AI mất khoảng 8–10 giây.
- Nghe, Đọc, Ngữ pháp lấy danh sách bài từ database; IELTS Writing/Speaking dùng chung luồng đầy đủ; thêm trang Giới thiệu, Quyền riêng tư; bỏ trang Blog.

## 5. Chỉ tiêu nội dung tối thiểu cho demo

| Loại | Hiện có (bỏ dữ liệu rác) | Mục tiêu |
|---|---|---|
| Bài học CEFR | 18 | ≥30, mỗi level ≥5, đủ 4 kỹ năng + ngữ pháp |
| Chủ đề ngữ pháp | 12 bài | ≥20, mỗi bài ≥8 câu, ≥2 dạng câu |
| Từ vựng | 138 | ≥600, có từ loại đúng, IPA, ví dụ, nghĩa tiếng Việt |
| Bài Listening | 2 | ≥6 (A1→C2), có file audio |
| Bài Reading | 1 | ≥6 (A1→C2) |
| Đề Writing | 1 + 1 IELTS | ≥6 (2 IELTS Task 1, 2 IELTS Task 2, 2 chung) |
| Đề Speaking | 1 + 1 IELTS | ≥6 (IELTS Part 1/2/3 + chung) |
| TOEIC luyện Part | 1 câu/Part | ≥6 câu/Part (Part 3, 4, 6, 7 theo cụm) |
| TOEIC Mini test | 4 câu | ≥20 câu |
| TOEIC Full mock rút gọn | 7 câu | ≥50 câu, đủ 7 Part, ghi chú “rút gọn” |
| IELTS Listening | 1 đề nhỏ | 1 đề ≥20 câu, ≥3 dạng câu |
| IELTS Reading | 1 đề nhỏ | 1 đề ≥20 câu, có TFNG/matching/điền từ |
| Placement test | 0 | 15–20 câu A1→C2 |

---

## 6. Checklist nghiệm thu chung

Bản demo đạt khi **tất cả** các mục sau đúng:

- [ ] Ba kịch bản A, B, C chạy hết từ đầu đến cuối, mọi bước ✅.
- [ ] Không còn dữ liệu rác hay tên kỹ thuật (`E2E`, `Fixture`, `CSV imported`) trong giao diện người học.
- [ ] Không còn nút/link giả, không còn route mồ côi, không còn trang “Đang xây dựng” trên đường điều hướng.
- [ ] Bản `vi` không có nhãn/enum tiếng Anh ngoài nội dung học; bản `en` không có tiếng Việt.
- [ ] Không có câu chữ nội bộ (PostgreSQL, Engine, Service, local, contract) hiển thị cho người học.
- [ ] Mọi màn hình AI có fallback trung thực khi mất mạng hoặc không có key; không bịa band/điểm.
- [ ] Reload trang ở bất kỳ bước nào không mất dữ liệu.
- [ ] Giao diện dùng được ở 375px, 390px và desktop.
- [ ] `pnpm demo:prepare` dựng lại DB demo sạch trong một lệnh; E2E không đụng tới DB demo.
- [ ] Có tài khoản demo với 2–3 tuần lịch sử học để dashboard trông như đang được dùng thật.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` và E2E cho 3 kịch bản đều pass.

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
