# Requirements: BuMath LMS v2.0 — UI Refactor

**Defined:** 2026-05-01
**Core Value:** Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm

## v2 Requirements

### URL Standardization

- [ ] **URL-01**: Tất cả URL đồng nhất tiếng Việt — không còn URL tiếng Anh (trừ landing `/`)
  - `/dang-nhap`, `/dang-ky`, `/cho-duyet`
  - `/quan-tri/nguoi-dung`, `/quan-tri/khoa-hoc`, `/quan-tri/bai-nop`
  - `/khoa-hoc`, `/khoa-hoc/:courseSlug`, `/danh-muc`
- [ ] **URL-02**: Tất cả redirect nội bộ (sau login, logout, ProtectedRoute) cập nhật theo URL mới
- [ ] **URL-03**: URL cũ (tiếng Anh) redirect 301 về URL mới để không bị broken links

### Admin UI Refactor

- [ ] **ADMIN-UI-01**: Trang quản lý người dùng (`/quan-tri/nguoi-dung`) — table với phân trang (25/trang), filter theo role + tìm kiếm tên/email
- [ ] **ADMIN-UI-02**: Trang quản lý khóa học (`/quan-tri/khoa-hoc`) — card grid hoặc table với phân trang, filter theo lớp (7/8/9/chuyên), tìm kiếm tên
- [ ] **ADMIN-UI-03**: Trang chi tiết khóa học / chương bài — layout rõ ràng, UX quản lý thứ tự bài học dễ dùng
- [ ] **ADMIN-UI-04**: Hàng đợi chấm bài (`/quan-tri/bai-nop`) — phân trang (20/trang), các filter hiện tại giữ nguyên, thêm filter trạng thái (chưa chấm/đã chấm)
- [ ] **ADMIN-UI-05**: Trang chấm bài chi tiết — layout 2 cột (ảnh bài nộp + form chấm điểm), UX tốt hơn trên mobile

### Auth Pages UI Refactor

- [ ] **AUTH-UI-01**: Trang đăng nhập (`/dang-nhap`) — thiết kế đẹp, centered card, logo BuMath, form validation inline
- [ ] **AUTH-UI-02**: Trang đăng ký (`/dang-ky`) — multi-field form gọn gàng, validation rõ ràng, progress feedback
- [ ] **AUTH-UI-03**: Trang chờ duyệt (`/cho-duyet`) — thông tin trạng thái rõ ràng, hướng dẫn tiếp theo, không bị nhàm

### Student UI Refactor

- [x] **STUDENT-UI-01**: Trang danh sách khóa học của tôi (`/khoa-hoc`) — card layout, progress bar nổi bật, empty state rõ ràng
- [ ] **STUDENT-UI-02**: Trang xem bài học (`/khoa-hoc/:courseSlug`) — sidebar responsive, video embed chiếm phần chính, UX mark complete nổi bật
- [ ] **STUDENT-UI-03**: Trang danh mục khóa học (`/danh-muc`) — card grid, filter theo lớp, tìm kiếm tên khóa học, phân trang hoặc infinite scroll
- [x] **STUDENT-UI-04**: Empty states đẹp trên tất cả trang học sinh (khi chưa có khóa học, chưa có bài nộp…)

### Design System

- [x] **DS-01**: Hệ thống màu, spacing, typography đồng nhất trên tất cả trang (không phải landing)
- [x] **DS-02**: Loading skeleton thay thế spinner trên các trang fetch data

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| URL-01 | Phase 9 — URL Standardization | Pending |
| URL-02 | Phase 9 — URL Standardization | Pending |
| URL-03 | Phase 9 — URL Standardization | Pending |
| AUTH-UI-01 | Phase 10 — Auth Pages UI | Pending |
| AUTH-UI-02 | Phase 10 — Auth Pages UI | Pending |
| AUTH-UI-03 | Phase 10 — Auth Pages UI | Pending |
| ADMIN-UI-01 | Phase 11 — Admin List Pages | Pending |
| ADMIN-UI-02 | Phase 11 — Admin List Pages | Pending |
| ADMIN-UI-03 | Phase 12 — Admin Detail Pages | Pending |
| ADMIN-UI-04 | Phase 12 — Admin Detail Pages | Pending |
| ADMIN-UI-05 | Phase 12 — Admin Detail Pages | Pending |
| STUDENT-UI-01 | Phase 13 — Student Pages | Complete |
| STUDENT-UI-02 | Phase 13 — Student Pages | Pending |
| STUDENT-UI-03 | Phase 13 — Student Pages | Pending |
| STUDENT-UI-04 | Phase 13 — Student Pages | Complete |
| DS-01 | Phase 10–13 (cross-cutting) | Complete |
| DS-02 | Phase 10–13 (cross-cutting) | Complete |

**Coverage:**
- v2 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-01*
