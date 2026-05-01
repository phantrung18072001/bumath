---
status: complete
phase: 08-teacher-role-access
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md]
started: 2026-05-01T10:00:00.000Z
updated: 2026-05-01T10:30:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Teacher post-login redirect
expected: Đăng nhập bằng tài khoản role=teacher → tự động redirect đến /admin/submissions
result: pass

### 2. Teacher sidebar — chỉ thấy "Chấm bài"
expected: Khi đã đăng nhập là teacher, AdminLayout sidebar chỉ hiển thị duy nhất nav item "Chấm bài". Không có "Quản lý tài khoản" và "Quản lý khóa học".
result: pass

### 3. Teacher truy cập /admin/submissions thành công
expected: Teacher có thể vào /admin/submissions và thấy danh sách bài nộp (SubmissionsPage render bình thường, không bị redirect ra ngoài).
result: pass

### 4. Teacher truy cập /admin/submissions/:id thành công
expected: Teacher click vào một bài nộp bất kỳ → GradingPage render bình thường, có thể xem ảnh bài làm, nhập điểm và comment.
result: pass

### 5. Teacher bị redirect khi vào /admin/users
expected: Teacher gõ thẳng URL /admin/users → bị redirect về /admin/submissions (không phải 404, không phải trang chủ /).
result: pass

### 6. Admin post-login không thay đổi
expected: Đăng nhập bằng tài khoản admin → vẫn redirect về /admin/users như trước. Không bị ảnh hưởng bởi thay đổi của Phase 8.
result: pass

### 7. Admin sidebar vẫn đầy đủ 3 items
expected: Admin vào trang admin → sidebar vẫn hiển thị đủ 3 items: "Quản lý tài khoản", "Quản lý khóa học", "Chấm bài". Không bị mất item nào.
result: pass

### 8. Student không vào được /admin/*
expected: Đăng nhập student rồi gõ thẳng /admin/submissions → bị redirect về /courses (không phải / hay trang admin).
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
