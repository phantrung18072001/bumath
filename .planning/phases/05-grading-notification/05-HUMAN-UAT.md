---
status: complete
phase: 05-grading-notification
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md]
started: 2026-04-26T23:45:00+07:00
updated: 2026-04-27T16:00:00+07:00
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
result: pass

---

### 3. Bell Notification (Học sinh)
expected: |
  Đăng nhập học sinh (đã có bài vừa được chấm điểm).
  Header hiển thị icon chuông 🔔 với badge số đỏ (ví dụ "1") bên cạnh.
  Nếu chưa có bài nào được chấm: badge chuông ẩn đi.
result: pass
reported: "API 400 đã sửa sau khi chạy migration. Bell hiển thị badge đúng."
fix_applied: "Migration 20260407_07_student_viewed_at.sql đã chạy thủ công — 2026-04-27"

---

### 4. Xem kết quả điểm & Bell tự xóa
expected: |
  Vào bài học đã được chấm → SubmissionArea hiển thị "Điểm: X/10" và nhận xét của giáo viên.
  Sau khi xem xong → quay lại header: badge chuông giảm đi (hoặc ẩn nếu không còn bài nào).
result: pass

---

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none — all gaps resolved, full phase pass confirmed 2026-04-27]
