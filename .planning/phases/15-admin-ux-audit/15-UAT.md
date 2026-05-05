---
status: testing
phase: 15-admin-ux-audit
source:
  - 15-P01-SUMMARY.md
  - 15-P02-SUMMARY.md
  - 15-P03-SUMMARY.md
started: 2026-05-05T09:30:00Z
updated: 2026-05-05T10:07:00Z
---

## Current Test

number: 2
name: Inline Chapter Form
expected: |
  Click "Thêm chuyên đề" mở form inline trong sidebar (không phải dialog).
  Form dùng card/spacing/typography nhất quán với student-side (#F0FDFA, bm-clay-card-student).
  Nhập tên chuyên đề và submit → chuyên đề xuất hiện trong sidebar ngay lập tức.
awaiting: user response

note: >-
  Test 1 fixed 3 bugs: attributes ReferenceError, layout/padding/scrollbar issues,
  dnd-kit tooltip leak. Also added lesson title to top of content and chapter/lesson tooltips.

## Tests

### 1. Admin Course Detail Page Access
expected: |
  Truy cập /quan-tri/khoa-hoc/:courseSlug với tài khoản admin.
  Trang hiển thị course detail giống như student view nhưng có thêm tính năng admin.
  Không có route /quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug nữa.
result: pass
note: "Fixed bugs: attributes ReferenceError, layout/padding/double scrollbar, dnd-kit tooltip. Added lesson title to top of content, chapter/lesson name tooltips."

### 2. Inline Chapter Form
expected: |
  Click "Thêm chuyên đề" mở form inline trong sidebar (không phải dialog).
  Form dùng card/spacing/typography nhất quán với student-side (#F0FDFA, bm-clay-card-student).
  Nhập tên chuyên đề và submit → chuyên đề xuất hiện trong sidebar ngay lập tức.
result: pending

### 3. Inline Lesson Form
expected: |
  Click "Thêm bài giảng" dưới đúng chuyên đề mở form inline (không dialog, không route con).
  Form dùng shadcn Form/Input/Textarea với styling nhất quán.
  Nhập tên bài giảng, mô tả, video URL và submit → bài giảng xuất hiện trong chuyên đề đó.
result: pending

### 4. Admin Sidebar DnD Reorder
expected: |
  Admin có thể drag & drop để reorder chapters và lessons trong sidebar.
  Drag handles hiển thị rõ ràng khi hover.
  Sau khi thả, thứ tự được lưu và hiển thị đúng.
result: pending

### 5. Chapter/Lesson Edit Inline
expected: |
  Click "Sửa" trên chuyên đề hoặc bài giảng mở form inline với dữ liệu hiện tại.
  Chỉ một form được mở tại một thời điểm (cái khác tự đóng).
  Sau khi submit, sidebar cập nhật ngay không cần refresh.
result: pending

### 6. Chapter/Lesson Delete
expected: |
  Click "Xóa" hiển thị AlertDialog xác nhận.
  Xác nhận xóa → item biến mất khỏi sidebar ngay lập tức.
result: pending

### 7. Header Navigation Audit
expected: |
  Click tất cả các link trong Header (landing page, /danh-muc, /khoa-hoc, v.v.).
  Không có link nào dẫn đến 404 hoặc trang trống.
  Mobile menu: toggle hoạt động đúng, các link đóng drawer khi click.
result: pending

### 8. Cold Start Smoke Test
expected: |
  Kill server nếu đang chạy. Start lại với yarn dev.
  App khởi động không lỗi, homepage load được.
  Truy cập /quan-tri/khoa-hoc/:courseSlug với admin account hoạt động.
result: pending

## Summary

total: 8
passed: 1
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

- truth: "Admin Course Detail Page Access - Không bị lỗi runtime"
  status: fixed
  reason: "User reported: Uncaught ReferenceError: attributes is not defined"
  severity: blocker
  test: 1
  root_cause: "useSortable hook destructuring missing 'attributes' variable"
  artifacts:
    - path: "src/components/student/LessonSidebar.tsx:71"
      issue: "Missing attributes in destructuring"
  missing:
    - "Add 'attributes' to useSortable destructuring"

- truth: "Admin Course Detail Page - UI layout đẹp, đúng padding, không double scrollbar"
  status: fixed
  reason: "User reported: UI xấu - negative margin, back button, double scrollbar"
  severity: major
  test: 1
  root_cause: "Admin layout CSS issues - negative margin offset causing padding loss, overflow settings causing double scrollbar"
  artifacts:
    - path: "src/pages/student/CourseDetailPage.tsx:640-646"
      issue: "Admin layout with negative margin and back button"
  missing:
    - "Simplify admin layout wrapper"
    - "Remove negative margin -mx-6 -my-8"
    - "Remove back button from admin view"
