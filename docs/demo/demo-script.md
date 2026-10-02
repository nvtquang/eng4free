# Kịch bản demo English 4 Free (8–10 phút)

Kịch bản này đi theo ba hành trình đã chốt ở [D0](../roadmap/demo-acceptance.md):
người mới bắt đầu (A), người luyện TOEIC (B) và người luyện IELTS (C). Cả ba đều được
E2E kiểm tra tự động (`e2e/demo-scenario-a|b|c.spec.ts`). Trước buổi demo, làm theo
[checklist](pre-demo-checklist.md).

**Chuẩn bị trên màn hình**

- Cửa sổ 1, ẩn danh: **khách mới** cho kịch bản A. Mở sẵn `http://localhost:3000`.
- Cửa sổ 2, thường: **tài khoản demo** cho kịch bản B và C. Vào `/login` →
  **Vào tài khoản demo**, rồi để ở trang **Tiến độ** (`/dashboard`).
- Tài khoản demo là *Minh Anh (demo)*: trình độ B1 theo bài xếp lớp, mục tiêu IELTS,
  học đều 16 ngày liền, đã làm 10 bài học và 6 đề, có 72 từ trong sổ từ, 2 bài viết
  IELTS có nhận xét AI và 2 bài nói Part 2/Part 3 có nhận xét.

Các mốc thời gian ghi trong ngoặc là thời điểm cộng dồn.

---

## Mở đầu (0:00–0:30)

> “English 4 Free là một lộ trình học tiếng Anh miễn phí, dạy bằng tiếng Việt: xếp lớp,
> học theo lộ trình A1–C2, ôn đúng lúc sắp quên, luyện đề TOEIC/IELTS và nhận xét từ AI.
> Em sẽ đi qua ba người học điển hình.”

Chỉ vào trang chủ: các con số nội dung thật (bài học, từ vựng, câu hỏi luyện thi, chủ đề
Nói/Viết) và ba bước *Xếp lớp → Học theo lộ trình → Ôn tập và luyện thi*.

## Kịch bản A: người mới bắt đầu, chế độ khách (0:30–4:00)

| Bước | Làm gì | Nói/chỉ vào gì |
|---|---|---|
| A1 | **Bắt đầu học** → chọn *Giao tiếp hằng ngày* → *15 phút/ngày* → **Làm bài kiểm tra xếp lớp** | Không cần đăng ký. Bài xếp lớp gồm 20 câu Ngữ pháp, Từ vựng, Đọc và Nghe, tự điều chỉnh độ khó. Trả lời nhanh 5–6 câu để thấy câu khó lên/xuống, các câu còn lại chọn nhanh. |
| A2 | Tự đánh giá Nói/Viết → **Xem kết quả** | Trình độ đề xuất và trình độ theo từng kỹ năng. Nói/Viết là tự đánh giá, nói rõ là chưa chấm tự động. |
| A3–A4 | **Bắt đầu học** → trang **Hôm nay** | Bài kế tiếp trong lộ trình, mục tiêu phút trong ngày, từ đến hạn ôn, sổ lỗi sai, kỹ năng yếu nhất theo bài xếp lớp. |
| A5 | **Lộ trình** → A2 → *Listen: booking a table by phone* | Ghi âm thật (Piper TTS, giấy phép rõ ràng). Làm 3–4 câu, có câu sai → **Hoàn thành bài học**: điểm XP, đáp án đúng kèm giải thích, câu sai tự vào sổ lỗi sai. |
| A6 | Khung **Từ mới trong bài** → **Thêm vào sổ từ** 1–2 từ → **Ôn sổ từ →** | Từ được lấy từ kho từ vựng có nguồn (Wiktionary, CC BY-SA). Thẻ ôn theo FSRS: bấm *Tốt* để thấy lịch ôn được tính lại. |
| A7 | **Sổ lỗi sai** → chọn đáp án → **Kiểm tra** | Câu sai trong bài học và đề thi đều được gom về đây. Làm đúng thì câu đó được xoá khỏi sổ. |
| A8 | Menu **Tài khoản** → **Tiến độ** | XP, chuỗi 1 ngày, hoạt động vừa làm. |
| A9 | **Đăng nhập** → **Vào tài khoản demo** | Khi đăng nhập (Google hoặc tài khoản demo), toàn bộ tiến độ của khách được gộp vào tài khoản. Mở **Lộ trình** A2: bài vừa học đã có dấu *Đã học*. |

Nếu bị hỏi về Google: nút *Đăng nhập với Google* dùng chung đúng cơ chế gộp này.
Tài khoản demo chỉ hiện khi chạy `pnpm demo:start` trên máy local.

## Kịch bản B: người luyện TOEIC (4:00–6:30), cửa sổ 2

| Bước | Làm gì | Nói/chỉ vào gì |
|---|---|---|
| B1 | **Luyện thi** → **TOEIC** | Ba nhóm: *Thi thử* 200 câu, *Mini test* 22 câu và luyện từng Part 1–7. |
| B2 | *Part 1 practice* | Ảnh CC0 có ghi nguồn, bấm **Nghe (0/2)**: số lượt nghe bị giới hạn, không tua được. Lướt qua *Part 3*: hội thoại nhiều giọng. |
| B3 | *Mini test* → chọn 2–3 đáp án → **tải lại trang (F5)** | Đồng hồ chạy, đáp án tự lưu, tải lại vẫn còn (nhãn *TIẾP TỤC*). Chọn nhanh vài câu rồi **Nộp bài**. |
| B4 | Trang kết quả | *Điểm quy đổi ước tính* Nghe/Đọc/Tổng, có ghi rõ không phải điểm chính thức. **Kết quả theo phần**: tỉ lệ đúng từng Part, Part yếu nhất được gắn *Nên luyện thêm*. |
| B5 | Ở một câu sai → **Hỏi trợ giảng AI** → hỏi thêm một câu | AI giải thích theo đúng đáp án chính thức và đáp án người học đã chọn, hỏi tiếp được nhiều lượt. Mất khoảng 8–10 giây. |
| B6 | **Lịch sử bài thi** | Mọi lượt làm đều xem lại được. Tài khoản demo có sẵn 6 lượt trong 3 tuần (IELTS Listening từ 19/40 lên 22/40). |

## Kịch bản C: người luyện IELTS (6:30–9:00), cửa sổ 2

| Bước | Làm gì | Nói/chỉ vào gì |
|---|---|---|
| C1 | **Luyện thi** → **IELTS** | Đủ bốn kỹ năng Listening, Reading, Writing, Speaking. |
| C2–C4 | Mở *IELTS Reading Test 1*, cuộn qua | 40 câu, 7 dạng: True/False/Not Given, nối tiêu đề, điền tóm tắt… Không cần làm bài: mở **Lịch sử bài thi** → *IELTS Reading Test 1* để xem band ước tính và kết quả theo phần của một lượt có sẵn. |
| C5 | **Writing** → *Task 2 · Public transport or new roads?* → trong **Lịch sử**, bấm **Mở lại** bài có *Phản hồi luyện tập từ AI* | Bốn tiêu chí chấm IELTS Writing, mỗi tiêu chí ở một mức NEEDS_WORK/DEVELOPING/SECURE, có lỗi được đánh dấu trong bài và gợi ý sửa. Không bịa band. Bài có 2 phiên bản: sau khi sửa, hai tiêu chí lên *SECURE*. Nếu còn thời gian, viết 2–3 câu → **Nộp bài** để AI chấm trực tiếp (khoảng 10–20 giây). |
| C6 | **Speaking** → *Speaking set 1* → **Chuẩn bị (1:00)** → **Tôi đã sẵn sàng** → **Nhấn để nói** → nói khoảng 20 giây → **Dừng ghi âm** → **Lưu bản ghi** | Thẻ đề Part 2, đồng hồ chuẩn bị 1 phút, đồng hồ nói tối đa 2 phút (tự dừng). AI chép lời rồi nhận xét theo bốn tiêu chí bằng tiếng Việt, không chấm phát âm và không đưa ra band. Lịch sử có sẵn bài nói Part 2 về bãi biển Mỹ Khê của tài khoản demo. |

## Kết (9:00–10:00)

Quay lại **Tiến độ** của tài khoản demo: 16 ngày liền, hoạt động theo kỹ năng, lịch sử
bài thi/viết/nói.

> “Toàn bộ nội dung là nội dung gốc hoặc có giấy phép rõ ràng, có nguồn ghi ở trang Giới
> thiệu. AI chỉ là nhận xét luyện tập, không thay điểm chính thức.”

Nếu được hỏi về quản trị: đăng nhập bằng tài khoản Google có trong `ADMIN_EMAILS`, mở `/admin` → import CSV → duyệt → publish. Xem phần D của
[D0](../roadmap/demo-acceptance.md).

---

## Khi có sự cố

| Sự cố | Cách xử lý ngay |
|---|---|
| AI chậm hoặc báo không khả dụng (mất mạng, hết quota) | Nói thẳng là AI đang không phản hồi, màn hình báo đúng như vậy. Chuyển sang xem nhận xét có sẵn trong **Lịch sử** của tài khoản demo (C5, C6). Trợ giảng vẫn hiện *Lời giải chính thức*. |
| Không có tiếng | Kiểm tra âm lượng hệ thống và thiết bị đầu ra. Bài học vẫn đọc được bằng giọng trình duyệt nếu file ghi âm lỗi. |
| Micro không ghi | Kiểm tra quyền micro của trang (biểu tượng bên trái thanh địa chỉ). Bỏ qua bước ghi âm, mở bài nói có sẵn trong lịch sử. |
| Trang lỗi 500 hoặc treo | Ở terminal: `Ctrl+C`, rồi `pnpm demo:start` (khoảng 5 giây). Dữ liệu vẫn còn. |
| Chuỗi ngày của tài khoản demo về 0 | Lịch sử chỉ đến hết hôm qua. Chạy `pnpm seed:demo-account` (khoảng 10 giây, không cần build lại). |
