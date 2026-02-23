

# BuMath-X – Hệ thống học Toán Online

## Tổng quan
Xây dựng hệ thống học toán online cho học sinh lớp 7-12 với 3 vai trò: Học sinh, Trợ giảng, Admin. Giao diện tham khảo mathx.vn với màu sắc tươi sáng (cam, xanh), layout grid hiển thị các lớp/khóa học. Backend sử dụng Supabase (Auth, PostgreSQL, Storage, Edge Functions).

---

## Phần 1: Trang công khai

### Landing Page (/)
- Header: Logo BuMath-X, SĐT, đăng nhập/đăng ký, menu lớp 7-12
- Hero banner giới thiệu khóa học
- Grid hiển thị các lớp (7→12) với mô tả ngắn, tương tự layout mathx.vn
- Section "Ôn thi chuyên cấp tốc"
- Feedback/đánh giá từ học sinh
- Form đăng ký tư vấn
- Footer

### Trang lớp (/class/[slug])
- Hiển thị 2 mục: Học cơ bản & Học nâng cao
- Danh sách đề ôn tập, tuyển tập bài hay
- Danh sách khóa học & chuyên đề

### Auth
- Đăng nhập (/login) – email + password
- Đăng ký (/register)
- Quên mật khẩu

---

## Phần 2: Dashboard Học sinh

### Tổng quan
- Sidebar navigation với các mục: Khóa học, Chuyên đề, Kiểm tra tuần, Hồ sơ
- Danh sách khóa học đang tham gia với % tiến độ
- Bài test gần nhất & kết quả

### Chi tiết chuyên đề
- Video bài giảng (HLS player)
- File bài tập tự luyện (download PDF) + đáp án
- Khung chat hỏi đáp với trợ giảng (gửi được file)
- Nộp bài làm (upload file) để trợ giảng chấm

### Kiểm tra tuần
- Chỉ mở tối thứ 7 (20:00 – 22:30)
- Countdown timer, tự đóng nộp bài sau 22:30
- Sau khi chấm: hiển thị điểm + % đỗ chuyên (lời phê trợ giảng)

### Ôn thi chuyên cấp tốc
- Chọn trường THPT chuyên mong muốn
- Hệ thống gợi ý khóa học phù hợp
- Danh sách chuyên đề kèm video + bài tập + chat

---

## Phần 3: Dashboard Trợ giảng

- Danh sách bài nộp cần chấm (filter theo trạng thái)
- Xem file bài làm học sinh
- Upload feedback PDF
- Chấm điểm + viết nhận xét % đỗ chuyên
- Chuyển trạng thái: PENDING → REVIEWED

---

## Phần 4: Dashboard Admin

- CRUD đầy đủ với DataTable cho: Lớp, Khóa học, Chuyên đề, Video, Bài tập, Người dùng
- Quản lý bài nộp & chấm tay
- Gán role cho user (Student/TA/Admin)

---

## Phần 5: Backend (Supabase)

### Database
- Bảng: profiles, user_roles, class_levels, courses, topics, videos, exercises, submissions, chat_messages, enrollments, weekly_test_sessions, consultation_requests
- Role enum: student, ta, admin (bảng user_roles riêng)
- RLS policies theo role

### Auth
- Supabase Auth (email/password)
- Role-based access control qua user_roles table + has_role() function
- Protected routes middleware

### Storage
- Bucket cho video (HLS .m3u8 + .ts segments)
- Bucket cho file bài tập PDF
- Bucket cho file bài nộp học sinh
- Bucket cho feedback PDF trợ giảng
- Bucket cho chat attachments

### Edge Functions
- Signed URL cho video HLS
- Logic kiểm tra tuần (check thời gian mở/đóng)
- Upload & xử lý file

---

## Phần 6: UI/UX

- Phong cách tham khảo mathx.vn: màu cam chủ đạo, grid cards cho lớp học
- shadcn/ui components, dark mode support
- Sidebar layout cho dashboard
- Loading skeletons, empty states, error pages
- Toast notifications (sonner)
- Responsive trên mobile

---

## Thứ tự triển khai

1. **Landing Page + Auth** – Giao diện public, đăng nhập/đăng ký
2. **Database schema + RLS** – Setup Supabase tables & policies
3. **Student Dashboard** – Khóa học, chuyên đề, video player, nộp bài
4. **Chat & Weekly Test** – Hỏi đáp, kiểm tra tuần với timer
5. **TA Dashboard** – Chấm bài, feedback
6. **Admin Dashboard** – CRUD management
7. **Ôn thi chuyên** – Recommendation engine đơn giản

