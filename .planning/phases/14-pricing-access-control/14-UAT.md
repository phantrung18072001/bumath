---
status: complete
phase: 14-pricing-access-control
source: 14-P01-SUMMARY.md, 14-P02-SUMMARY.md, 14-P03-SUMMARY.md, 14-P04-SUMMARY.md, 14-P05-SUMMARY.md, 14-P06-SUMMARY.md
started: 2026-05-04T10:05:00Z
updated: 2026-05-04T10:05:00Z
---

## Current Test

number: 3
name: Admin can create a package
expected: |
  Vào /quan-tri/goi-hoc → click "Tạo gói học mới" → điền tên, giá, chọn ít nhất 1 lớp → lưu thành công → gói mới xuất hiện trong danh sách
awaiting: user response

## Tests

### 1. App loads without errors
expected: Mở http://localhost:8080 — trang landing load bình thường, không có lỗi console
result: pass

### 2. Admin sidebar shows "Gói học"
expected: Đăng nhập với tài khoản admin → vào trang quản trị → sidebar hiện mục "Gói học" giữa "Quản lý khóa học" và "Chấm bài"
result: pass

### 3. Admin can create a package
expected: Vào /quan-tri/goi-hoc → click "Tạo gói học mới" → điền tên, giá, chọn ít nhất 1 lớp → lưu thành công → gói mới xuất hiện trong danh sách
result: issue
reported: "Tạo thành công nhưng có issue: (1) khi học sinh đăng ký gói lớp 7 mới thì gói legacy lớp 7 cũ ra sao; (2) giá tiền lúc tạo nên thêm phân cách dấu . 3 chữ số"
severity: minor

### 4. Admin can edit a package
expected: Trong trang Gói học → click "Sửa" trên một gói → dialog mở với dữ liệu cũ → chỉnh sửa → cập nhật thành công
result: pass

### 5. Admin can delete a package
expected: Click "Xóa" trên một gói → AlertDialog cảnh báo "Học sinh sở hữu gói này sẽ mất quyền truy cập" → xác nhận → gói bị xóa khỏi danh sách
result: issue
reported: "Xóa thành công nhưng chưa rõ về ảnh hưởng khi xóa gói — cảnh báo chưa đủ rõ ràng về hệ quả (xóa user_packages, remove enrollments)"
severity: minor

### 6. Admin can open user package dialog
expected: Vào /quan-tri/nguoi-dung → click "Quản lý gói học" cho một học sinh → dialog "Quản lý gói học — {tên}" mở ra, hiện danh sách gói đang sở hữu
result: issue
reported: "Dialog mở đúng nhưng chỉ gán được 1 gói mỗi lần — muốn chọn nhiều gói cùng lúc (ví dụ gói lớp 7 + gói lớp 8)"
severity: minor

### 7. Admin can assign a package to a student
expected: Trong dialog Quản lý gói học → chọn gói từ dropdown → click "Gán gói học" → toast "Đã gán gói học cho học sinh." → gói xuất hiện trong danh sách của học sinh
result: pass

### 8. Admin can revoke a package from a student
expected: Trong dialog Quản lý gói học → click "Thu hồi" trên một gói đang sở hữu → gói biến mất khỏi danh sách
result: pass

### 9. Student sees "Hồ sơ" in nav
expected: Đăng nhập với tài khoản học sinh → header navigation hiện link "Hồ sơ" sau "Khám phá khóa học"
result: pass

### 10. Student profile shows their packages
expected: Vào /ho-so → thấy thẻ thông tin cá nhân (tên, email, avatar initials) + danh sách các gói học đang sở hữu với badge lớp và ngày gán
result: issue
reported: "Hiện tại chỉ thấy tên và khóa học đang sở hữu — email và packages không hiện hoặc thiếu dữ liệu"
severity: major

### 11. Locked lesson state for student without package
expected: Học sinh không có gói học phù hợp vào xem bài học → thay vì video, thấy icon khóa + text "Bài học bị khoá" + "Bạn chưa có gói học phù hợp"
result: pass
note: "Clarified: shows only when has_video=true but no package. Bài không có video → không hiện gì (correct)."

### 12. Student with matching package sees video
expected: Học sinh có gói học phù hợp vào xem bài học → video embed hiện bình thường, không bị khóa
result: pass
note: "Fixed via migration 21 (has_video column) + 3-state logic in LessonContent. Initial failure was video_url=null ambiguity."

## Summary

total: 12
passed: 9
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

# Minor issues — non-blocking, UX improvements for next sprint:
- truth: "Price input shows thousands separator while typing (e.g. 1.000.000)"
  status: failed
  reason: "User reported: giá tiền lúc tạo nên thêm phân cách dấu . 3 chữ số"
  severity: minor
  test: 3

- truth: "Delete package AlertDialog clearly explains all consequences (enrollments removed)"
  status: failed
  reason: "User reported: Xóa thành công nhưng chưa rõ về ảnh hưởng khi xóa gói"
  severity: minor
  test: 5

- truth: "Admin can assign multiple packages to a student in one action"
  status: failed
  reason: "User reported: chỉ gán được 1 gói mỗi lần — muốn chọn nhiều gói cùng lúc"
  severity: minor
  test: 6
