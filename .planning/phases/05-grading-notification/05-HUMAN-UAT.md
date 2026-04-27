---
status: testing
phase: 05-grading-notification
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md]
started: 2026-04-26T23:45:00+07:00
updated: 2026-04-27T00:00:00+07:00
status: complete
---

## Current Test

[testing complete]

## Tests

### 1. Hàng đợi chấm bài (Admin)
expected: Admin vào /admin/submissions, thấy danh sách bài chưa chấm (hoặc empty state).
result: pass

---

### 2. Chấm điểm qua GradingDialog
expected: |
  Click "Chấm" trên một bài nộp → dialog mở, hiển thị ảnh học sinh đã nộp.
  Nhập điểm (0-10) và nhận xét → click "Lưu điểm" → dialog đóng → bài đó biến khỏi hàng đợi.
result: issue
reported: "1. Font tiếng Việt bị dính chữ do line-height quá thấp. 2. Cần double confirm trước khi lưu điểm. 3. Học sinh nộp nhiều ảnh cần slider. 4. Cần chuyển màn hình chấm điểm thành trang riêng thay vì modal."
severity: major

---

### 3. Bell Notification (Học sinh)
expected: |
  Đăng nhập học sinh (đã có bài vừa được chấm điểm).
  Header hiển thị icon chuông 🔔 với badge số đỏ (ví dụ "1") bên cạnh.
  Nếu chưa có bài nào được chấm: badge chuông ẩn đi.
result: issue
reported: "API 400 khi query student_viewed_at=is.null — cột không tồn tại trên DB"
severity: blocker
root_cause: "Migration 20260407_07_student_viewed_at.sql chưa được chạy. Cột student_viewed_at chưa tồn tại trên Supabase instance."

---

### 4. Xem kết quả điểm & Bell tự xóa
expected: |
  Vào bài học đã được chấm → SubmissionArea hiển thị "Điểm: X/10" và nhận xét của giáo viên.
  Sau khi xem xong → quay lại header: badge chuông giảm đi (hoặc ẩn nếu không còn bài nào).
result: pass

---

## Summary

total: 6
passed: 2
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "GradingDialog hiển thị ảnh rõ ràng, nhập điểm/nhận xét, lưu thành công"
  status: failed
  reason: "User reported: 4 issues — line-height Vietnamese font; thiếu double-confirm; ảnh nhiều cần slider; cần chuyển thành trang riêng thay vì modal"
  severity: major
  test: 2
  artifacts: [src/components/admin/GradingDialog.tsx]
  missing:
    - "line-height fix cho Vietnamese font trong GradingDialog"
    - "Double-confirm step trước khi gọi gradeSubmission()"
    - "Image slider (carousel) khi submission có nhiều ảnh"
    - "Trang /admin/submissions/:id riêng thay thế GradingDialog modal"

- truth: "Bell notification hiển thị badge đúng số bài được chấm chưa xem"
  status: failed
  reason: "API 400 — cột student_viewed_at chưa tồn tại trên Supabase"
  severity: blocker
  test: 3
  root_cause: "Migration 20260407_07_student_viewed_at.sql chưa run. Cần chạy trong SQL Editor."
  artifacts: [supabase/migrations/20260407_07_student_viewed_at.sql]
  missing: ["Chạy migration 20260407_07_student_viewed_at.sql trên Supabase"]

- truth: "Giáo viên có thể đính kèm ảnh phản hồi khi chấm bài"
  status: failed
  reason: "User reported: thiếu tính năng đính kèm ảnh cho giáo viên khi chấm điểm"
  severity: major
  test: extra-1
  artifacts: [src/components/admin/GradingDialog.tsx, src/lib/api/submissions.ts]
  missing:
    - "Upload ảnh phản hồi của giáo viên khi chấm bài (lưu vào storage/DB)"
    - "Hiển thị ảnh phản hồi trong SubmissionArea phía học sinh"

- truth: "Học sinh click bell → thấy danh sách bài đã chấm → click vào → redirect đến bài học đó"
  status: failed
  reason: "User reported: bell chỉ hiện badge số, không có dropdown/list bài đã chấm, không có link redirect"
  severity: major
  test: extra-2
  artifacts: [src/components/student/BellNotification.tsx]
  missing:
    - "Dropdown/panel khi click bell: danh sách bài đã được chấm chưa xem (tên bài, khóa học, điểm)"
    - "Click vào item → redirect đến trang bài học tương ứng"
