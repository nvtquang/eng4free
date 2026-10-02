# Checklist trước buổi demo

Đi kèm [kịch bản demo](demo-script.md). Mọi lệnh chạy ở thư mục gốc của repo.

## Hôm trước (khoảng 15 phút)

- [ ] `git pull` và `pnpm install`.
- [ ] `apps/web/.env.local` có `DATABASE_URL` trỏ tới DB demo (`english4free`),
      `AUTH_SECRET`, `GEMINI_API_KEY`. Có `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` nếu muốn
      demo đăng nhập Google, và `ADMIN_EMAILS` nếu muốn mở `/admin`.
- [ ] Dừng mọi dev server cũ (`next dev` mồ côi gây lỗi 500): đóng terminal đang chạy
      `pnpm dev`, kiểm tra cổng 3000 trống.
- [ ] `pnpm demo:prepare` (khoảng 2 phút). Lệnh này:
  - sao lưu DB hiện tại vào `.cache/demo-backups/` (cần `pg_dump`; đặt `PG_BIN` nếu
    không tìm thấy);
  - dựng lại DB, import nội dung và **chỉ publish các batch trùng khớp bản đã duyệt**
    (`content/packs/d3/qa/approved.json`);
  - kiểm tra đủ file ghi âm, seed tài khoản demo và build production.
- [ ] Đọc output của bước *Publishing approved content*: cả 8 batch phải là
      `published (matches the approval record)`. Batch nào còn ở REVIEW nghĩa là nội dung
      đã sửa sau lần duyệt trước: xem `pnpm content:d3:review-sample`, duyệt trong `/admin`,
      rồi `pnpm content:d3:publish -- --batch=<tên>`.
- [ ] Kiểm tra micro trên máy thật theo [manual-microphone.md](../qa/manual-microphone.md).
- [ ] Tập kịch bản một lượt, **không** bấm các nút AI (để dành quota).

## Sáng hôm demo (khoảng 10 phút)

- [ ] `pnpm seed:demo-account`. Lịch sử của tài khoản demo chỉ kéo đến **hết hôm qua**,
      nên phải chạy lại trong ngày demo thì chuỗi 16 ngày mới còn. Lệnh không cần build lại.
- [ ] `pnpm demo:start` → mở `http://localhost:3000` (đúng `localhost`, không dùng IP LAN,
      vì micro bị chặn).
- [ ] Mở lần lượt `/`, `/today`, `/learn`, `/toeic`, `/ielts`, `/dashboard`,
      `/exams/toeic-mini-test-1` để làm nóng server.
- [ ] Gọi thử AI đúng **một lần** (ví dụ hỏi trợ giảng một câu trong lịch sử thi của tài
      khoản demo) để biết key và quota còn hoạt động. Quota miễn phí khoảng 20 lượt/ngày
      cho phản hồi và 25 lượt/ngày cho chép lời. Kịch bản demo dùng khoảng 4 lượt
      (trợ giảng, tuỳ chọn chấm Writing, chép lời và nhận xét Speaking).
- [ ] Chrome: cửa sổ ẩn danh cho khách (kịch bản A), cửa sổ thường đã vào tài khoản demo
      (kịch bản B, C). Zoom 100–125%, ngôn ngữ VI, tắt thông báo hệ thống.
- [ ] Âm thanh ra loa/HDMI đúng thiết bị; thử một đoạn nghe ở `/exams/toeic-part-1-practice`.

## Ngay trước khi bắt đầu

- [ ] Cửa sổ khách đang ở trang chủ, chưa có dữ liệu (ẩn danh mới).
- [ ] Cửa sổ demo đang ở `/dashboard`, tiêu đề tài khoản là *Minh Anh (demo)*.
- [ ] Terminal chạy `pnpm demo:start` để mở sẵn ở một góc, phòng khi phải khởi động lại.

## Sau buổi demo

- Không cần dọn dẹp: lần `pnpm demo:prepare` sau sẽ dựng lại DB, và bản sao lưu DB cũ
  nằm trong `.cache/demo-backups/`. Khôi phục bằng lệnh mà `demo:prepare` in ra.
