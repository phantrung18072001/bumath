---
status: testing
phase: 05-grading-notification
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md]
started: 2026-04-26T23:45:00+07:00
updated: 2026-04-26T23:45:00+07:00
---

## Current Test

number: 1
name: Hàng đợi chấm bài (Admin)
expected: |
  Đăng nhập Admin → vào /admin/submissions (hoặc click link từ trang Courses).
  Nếu có bài nộp chưa chấm: thấy bảng danh sách với tên học sinh, khóa học/bài học, thời gian nộp.
  Nếu chưa có bài nào: thấy trạng thái "Không có bài nào chờ chấm".
awaiting: user response

## Tests

### 1. Hàng đợi chấm bài (Admin)
expected: Admin vào /admin/submissions, thấy danh sách bài chưa chấm (hoặc empty state).
result: PENDING

---

### 2. Chấm điểm qua GradingDialog
expected: |
  Click "Chấm" trên một bài nộp → dialog mở, hiển thị ảnh học sinh đã nộp.
  Nhập điểm (0-10) và nhận xét → click "Lưu điểm" → dialog đóng → bài đó biến khỏi hàng đợi.
result: PENDING

---

### 3. Bell Notification (Học sinh)
expected: |
  Đăng nhập học sinh (đã có bài vừa được chấm điểm).
  Header hiển thị icon chuông 🔔 với badge số đỏ (ví dụ "1") bên cạnh.
  Nếu chưa có bài nào được chấm: badge chuông ẩn đi.
result: PENDING

---

### 4. Xem kết quả điểm & Bell tự xóa
expected: |
  Vào bài học đã được chấm → SubmissionArea hiển thị "Điểm: X/10" và nhận xét của giáo viên.
  Sau khi xem xong → quay lại header: badge chuông giảm đi (hoặc ẩn nếu không còn bài nào).
result: PENDING

---

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

[none yet]
