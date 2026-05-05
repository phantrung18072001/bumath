---
status: testing
phase: 15-admin-ux-audit
source:
  - 15-P01-SUMMARY.md
  - 15-P02-SUMMARY.md
  - 15-P03-SUMMARY.md
started: 2026-05-05T09:30:00Z
updated: 2026-05-05T09:35:00Z
---

## Current Test

number: 1
name: Admin Course Detail Page Access
expected: |
  Truy cập /quan-tri/khoa-hoc/:courseSlug với tài khoản admin.
  Trang hiển thị course detail giống như student view nhưng có thêm tính năng admin.
  Không có route /quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug nữa.
awaiting: user response

## Tests

### 1. Admin Course Detail Page Access
expected: |
  Truy cập /quan-tri/khoa-hoc/:courseSlug với tài khoản admin.
  Trang hiển thị course detail giống như student view nhưng có thêm tính năng admin.
  Không có route /quan-tri/khoa-hoc/:courseSlug/chuong/:chapterSlug nữa.
result: issue
reported: "Uncaught ReferenceError: attributes is not defined at AdminSortableChapterItem (LessonSidebar.tsx:93:15)"
severity: blocker

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
passed: 0
issues: 1
pending: 7
skipped: 0
blocked: 0

## Gaps

- truth: "Admin Course Detail Page Access - Không bị lỗi runtime"
  status: failed
  reason: "User reported: Uncaught ReferenceError: attributes is not defined at AdminSortableChapterItem (LessonSidebar.tsx:93:15)"
  severity: blocker
  test: 1
  root_cause: "useSortable hook destructuring missing 'attributes' variable, but line 93 uses {...attributes}"
  artifacts:
    - path: "src/components/student/LessonSidebar.tsx:71"
      issue: "Missing attributes in destructuring"
  missing:
    - "Add 'attributes' to useSortable destructuring at line 71"
