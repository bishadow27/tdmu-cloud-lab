# TDMU Cloud Lab - Bài 3: NoSQL và Object Storage

Đây là mã mẫu hoàn chỉnh cho Bài 3. Trên nhánh `main` lúc khởi tạo Bài 3 chỉ có cấu hình Dev Container và README, vì vậy nhánh bài này bổ sung bộ khung API Express mà không giả định đã tồn tại mã Bài 1/2.

## A. Cấu hình dịch vụ

1. MongoDB Atlas: tạo project `cloud-lab`, cluster **Free**, nhà cung cấp AWS, vùng Singapore nếu khả dụng. Tạo user `notes_app` có quyền **readWrite** với riêng database `notes`. Thêm IP của môi trường chạy; chỉ dùng `0.0.0.0/0` tạm thời để thực hành.
2. Supabase: tạo project tại Singapore nếu có tùy chọn, tạo bucket `attachments` và bật **Public**. Lấy Project URL và **secret** API key từ Dashboard (dự án cũ gọi là `service_role`). **Không đưa secret key lên GitHub / trình duyệt.**
3. Trong GitHub Codespaces, mở terminal, sao chép `.env.example` thành `.env`, thay các dấu `<...>` bằng thông tin thật. Nếu mật khẩu MongoDB có ký tự đặc biệt, phải URL-encode khi đưa vào URI.

## B. Chạy dự án

```bash
npm install
cp .env.example .env
# Chỉnh .env bằng VS Code, không bao giờ commit tệp này
npm run check
npm start
```

Cổng 3000 sẽ được Codespaces chuyển tiếp. Mở terminal khác để chạy kiểm thử.

```bash
npm run smoke
```

`npm run smoke` kiểm tra POST 201, GET 200, PUT 200, DELETE 204, lỗi 400/404 và tải tệp lên Storage. Kết quả chỉ PASS khi các dịch vụ thật hoạt động. Script sẽ xóa ghi chú kiểm thử sau khi chạy; tệp đã tải lên trong bucket vẫn tồn tại để đối chiếu minh chứng.

## C. Đo chỉ mục

```bash
npm run seed
npm run explain
git status --short
```

Seed chỉ xóa những ghi chú có `owner=seed`, sau đó thêm 2.000 ghi chú. Explain ép 2 kế hoạch: `COLLSCAN` bằng `$natural` và `IXSCAN` bằng `{tags:1}`. Chụp bảng `console.table` cùng dòng tỉ số thật.

## Endpoint

| Phương thức | Đường dẫn | Công dụng |
|---|---|---|
| GET | `/` | Health check |
| GET | `/notes` | 50 ghi chú mới nhất, hỗ trợ `?tag=nosql` |
| GET | `/notes/:id` | Xem ghi chú |
| POST | `/notes` | Tạo ghi chú, HTTP 201 |
| PUT | `/notes/:id` | Cập nhật ghi chú |
| DELETE | `/notes/:id` | Xóa ghi chú, HTTP 204 |
| POST | `/notes/:id/attachment` | Multipart, field `file`, tối đa 2 MB |

Ví dụ tạo ghi chú:

```bash
curl -i -X POST http://localhost:3000/notes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ôn chương 3","content":"HDFS vs GFS","tags":["cloud","nosql"]}'
```

Tải tệp: tạo `note.txt`, sau đó dùng `_id` từ POST:

```bash
echo 'Tep thu' > note.txt
curl -i -X POST http://localhost:3000/notes/THAY_ID/attachment -F 'file=@note.txt'
```

## Tài liệu nộp

- [Sơ đồ và phần so sánh Atlas–HDFS](docs/so-sanh-atlas-hdfs.md)
- [Mẫu báo cáo Bài 3](docs/BAO_CAO_BAI_3.md)

**Cần tự hoàn tất:** tạo Atlas/Supabase, nhập `.env` và chụp màn hình kết quả thực tế. Không thể xác minh hoạt động của cơ sở dữ liệu chưa được cấp thông tin kết nối.

### Bảo mật và giới hạn

Chỉ dùng bucket công khai cho dữ liệu thử, không cho hồ sơ cá nhân. API demo không có đăng nhập; không triển khai Internet công khai lâu dài. Mở Atlas `0.0.0.0/0` là giải pháp tạm thời có rủi ro, thu hẹp khi có IP phù hợp. Khóa Supabase `sb_secret_...` hoặc `service_role` luôn ở server. `.gitignore` đã bỏ qua `.env`.

### Nguồn

- https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
- https://supabase.com/docs/guides/getting-started/api-keys
- https://mongoosejs.com/docs/production/indexes.html
