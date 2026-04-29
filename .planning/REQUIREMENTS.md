# Requirements: BuMath LMS

**Defined:** 2026-03-24
**Core Value:** Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm

## v1 Requirements

### Deployment & Infrastructure

- [x] **INFRA-01**: Ứng dụng được deploy lên Vercel (thay thế GitHub Pages) để hỗ trợ SPA routing
- [x] **INFRA-02**: Supabase project được cấu hình với environment variables trong Vite (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [x] **INFRA-03**: Supabase client singleton được tạo tại `src/lib/supabase.ts`

### Authentication

- [x] **AUTH-01**: Học sinh có thể tạo tài khoản bằng email và mật khẩu
- [x] **AUTH-02**: Học sinh có thể đăng nhập và duy trì session qua các lần reload
- [ ] **AUTH-03**: Học sinh/giảng viên/admin có thể đăng xuất từ bất kỳ trang nào
- [ ] **AUTH-04**: Tài khoản học sinh mới ở trạng thái "pending" cho đến khi admin duyệt
- [x] **AUTH-05**: Admin có thể xem danh sách tài khoản đang chờ duyệt và duyệt/từ chối

### Roles & Access Control

- [ ] **ROLE-01**: Hệ thống có 3 roles: student, teacher, admin với quyền khác nhau
- [ ] **ROLE-02**: Route được bảo vệ theo role — học sinh không thể truy cập trang admin/teacher
- [ ] **ROLE-03**: RLS policies trong Supabase ngăn học sinh xem dữ liệu của nhau

### Course Management (Admin)

- [ ] **COURSE-01**: Admin có thể tạo, sửa, xóa khóa học (tên, mô tả, lớp mục tiêu: 7/8/9/chuyên)
- [ ] **COURSE-02**: Admin có thể thêm bài học vào khóa học (tiêu đề, URL video YouTube, mô tả, thứ tự)
- [ ] **COURSE-03**: Admin có thể sắp xếp lại thứ tự bài học trong khóa
- [ ] **COURSE-04**: Admin có thể đính kèm bài tập vào bài học (upload file PDF hoặc hình ảnh đề bài)
- [ ] **COURSE-05**: Admin có thể gán học sinh vào khóa học

### Learning Experience (Student)

- [x] **LEARN-01**: Học sinh thấy danh sách khóa học mình được gán vào ngay sau khi đăng nhập
- [x] **LEARN-02**: Học sinh có thể xem bài giảng qua YouTube embed trong trang bài học
- [x] **LEARN-03**: Học sinh có thể tải xuống/xem đề bài đính kèm bài học
- [x] **LEARN-04**: Học sinh có thể đánh dấu bài học là đã hoàn thành
- [x] **LEARN-05**: Học sinh thấy progress bar % hoàn thành cho mỗi khóa học

### Assignment Submission

- [x] **SUBMIT-01**: Học sinh có thể upload ảnh chụp bài làm tay cho từng bài tập
- [x] **SUBMIT-02**: Ảnh được compress client-side về dưới 500KB trước khi upload lên Supabase Storage
- [x] **SUBMIT-03**: Học sinh thấy trạng thái bài tập rõ ràng: "Chưa nộp" / "Đã nộp" / "Đã chấm"
- [x] **SUBMIT-04**: Học sinh chỉ thấy và nộp bài tập của chính mình (không thấy của người khác)

### Grading (Teacher/Admin)

- [ ] **GRADE-01**: Giảng viên thấy danh sách tất cả bài đã nộp chưa được chấm
- [ ] **GRADE-02**: Giảng viên có thể xem ảnh bài làm của học sinh đầy đủ
- [ ] **GRADE-03**: Giảng viên có thể nhập điểm số và comment nhận xét trên bài nộp
- [x] **GRADE-04**: Học sinh nhận email thông báo khi bài được chấm
- [x] **GRADE-05**: Học sinh có thể xem điểm và comment của giảng viên trên bài nộp của mình

### Mobile & UX

- [x] **UX-01**: Tất cả các luồng chính (đăng nhập, xem bài, nộp bài) hoạt động trên viewport 375px
- [x] **UX-02**: Tất cả nút/vùng tương tác có kích thước tối thiểu 48x48px
- [x] **UX-03**: Giao diện hoàn toàn bằng tiếng Việt

### UX Polish (Phase 6)

- [x] **UX-P6-01**: Giảng viên có thể lọc danh sách bài chờ chấm theo lớp, khóa học, bài học, và tên học sinh
- [x] **UX-P6-02**: Trang 404 hiển thị tiếng Việt và link về trang chủ phù hợp theo role
- [x] **UX-P6-03**: Logo BuMath trong StudentLayout là link có thể click về trang chủ, có nav links
- [x] **UX-P6-04**: Học sinh có thể xem danh sách tất cả khóa học (catalogue) với badge trạng thái đăng ký
- [x] **UX-P6-05**: Học sinh chưa đăng ký có thể xem preview khóa học (danh sách chương/bài với lock icon)
- [x] **UX-P6-06**: Thanh progress bar dùng màu xám trung tính thay vì màu xanh

## v2 Requirements

### Enhanced Learning

- **LEARN-V2-01**: Khóa bài học theo thứ tự — học sinh phải xem bài trước mới mở được bài sau
- **LEARN-V2-02**: Học sinh thấy CTA "Tiếp theo" rõ ràng trên dashboard (bài chưa xem / bài tập chưa nộp)
- **LEARN-V2-03**: Lịch sử nộp bài nhiều lần — học sinh có thể nộp lại sau khi nhận feedback

### Enhanced Grading

- **GRADE-V2-01**: Giảng viên có thể lưu các comment mẫu để dùng lại khi chấm bài
- **GRADE-V2-02**: Bài tập có deadline — bài nộp trễ được đánh dấu

### Admin & Analytics

- **ADMIN-V2-01**: Admin có thể gán nhóm học sinh (lớp) vào khóa học thay vì từng người
- **ADMIN-V2-02**: Admin thấy tỷ lệ hoàn thành cơ bản theo khóa học

### Auto-grading

- **AUTO-01**: Bài tập trắc nghiệm tự chấm điểm (defer — sau khi manual grading ổn định)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Thanh toán / mua khóa học | Quản lý enrollment thủ công trong v1; payment phức tạp về pháp lý và kỹ thuật |
| Portal dành cho phụ huynh | Thêm role và dashboard riêng; không cần thiết để validate core product |
| Live video / real-time session | Phá vỡ mô hình async; yêu cầu WebRTC infrastructure |
| Inline annotation trên ảnh bài làm | Độ phức tạp cao (Fabric.js/Konva); text comment của giảng viên đủ dùng cho v1 |
| Social features (comment, like) | Gánh nặng moderation; không phù hợp môi trường học tập tập trung |
| Upload video trực tiếp | Chi phí storage lớn; YouTube embed đủ cho MVP |
| Analytics nâng cao | Không đủ dữ liệu để có giá trị trong v1 |
| Mobile app iOS/Android | Web-first; Progressive Web App là đủ cho MVP |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 — Foundation | Complete |
| INFRA-02 | Phase 1 — Foundation | Complete |
| INFRA-03 | Phase 1 — Foundation | Complete |
| AUTH-01 | Phase 2 — Auth & Access Control | Complete |
| AUTH-02 | Phase 2 — Auth & Access Control | Complete |
| AUTH-03 | Phase 7 — Auth & Security Fixes | Pending |
| AUTH-04 | Phase 7 — Auth & Security Fixes | Pending |
| AUTH-05 | Phase 2 — Auth & Access Control | Complete |
| ROLE-01 | Phase 8 — Teacher Role Access | Pending |
| ROLE-02 | Phase 8 — Teacher Role Access | Pending |
| ROLE-03 | Phase 7 — Auth & Security Fixes | Pending |
| UX-03 | Phase 2 — Auth & Access Control | Complete |
| COURSE-01 | Phase 3 — Course Management | Pending |
| COURSE-02 | Phase 3 — Course Management | Pending |
| COURSE-03 | Phase 3 — Course Management | Pending |
| COURSE-04 | Phase 3 — Course Management | Pending |
| COURSE-05 | Phase 3 — Course Management | Pending |
| LEARN-01 | Phase 4 — Student Learning & Submission | Complete |
| LEARN-02 | Phase 4 — Student Learning & Submission | Complete |
| LEARN-03 | Phase 4 — Student Learning & Submission | Complete |
| LEARN-04 | Phase 4 — Student Learning & Submission | Complete |
| LEARN-05 | Phase 4 — Student Learning & Submission | Complete |
| SUBMIT-01 | Phase 4 — Student Learning & Submission | Complete |
| SUBMIT-02 | Phase 4 — Student Learning & Submission | Complete |
| SUBMIT-03 | Phase 4 — Student Learning & Submission | Complete |
| SUBMIT-04 | Phase 4 — Student Learning & Submission | Complete |
| UX-01 | Phase 4 — Student Learning & Submission | Complete |
| UX-02 | Phase 4 — Student Learning & Submission | Complete |
| GRADE-01 | Phase 8 — Teacher Role Access | Pending |
| GRADE-02 | Phase 8 — Teacher Role Access | Pending |
| GRADE-03 | Phase 8 — Teacher Role Access | Pending |
| GRADE-04 | Phase 5 — Grading & Notification | Complete |
| GRADE-05 | Phase 5 — Grading & Notification | Complete |
| UX-P6-01 | Phase 6 — UX Polish | Complete |
| UX-P6-02 | Phase 6 — UX Polish | Complete |
| UX-P6-03 | Phase 6 — UX Polish | Complete |
| UX-P6-04 | Phase 6 — UX Polish | Complete |
| UX-P6-05 | Phase 6 — UX Polish | Complete |
| UX-P6-06 | Phase 6 — UX Polish | Complete |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 — traceability populated after roadmap creation*
