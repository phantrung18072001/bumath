---
status: complete
phase: 02-auth-access-control
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md, 02-06-SUMMARY.md, 02-07-SUMMARY.md]
started: 2026-04-20T00:00:00Z
updated: 2026-04-20T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Đăng ký tài khoản mới bằng số điện thoại
expected: |
  Truy cập /register. Form hiển thị 6 trường: Họ tên, Số điện thoại, Mật khẩu,
  Xác nhận mật khẩu, Năm sinh, Địa chỉ. Điền đầy đủ thông tin hợp lệ và submit.
  Hệ thống chấp nhận số điện thoại dạng 09xxxxxxxx (không cần email).
  Sau khi submit thành công, chuyển hướng đến trang /pending.
result: pass
improvement: "Trường Năm sinh nên dùng date-picker thay vì input text/number"

### 2. Trang chờ duyệt hiển thị đúng
expected: |
  Sau khi đăng ký, trang /pending hiển thị thông báo tài khoản đang chờ duyệt.
  Có hiển thị số Zalo admin để liên hệ. Nếu đã đăng nhập và bị từ chối, trang
  cũng hiển thị trạng thái "Từ chối" với thông báo phù hợp.
result: pass
note: "Lỗi kết nối ban đầu do Supabase free-tier bị pause — đã restore và hoạt động bình thường"

### 3. Đăng nhập bằng số điện thoại
expected: |
  Truy cập /login. Nhập đúng số điện thoại và mật khẩu đã đăng ký. Nhấn
  Đăng nhập. Hệ thống đăng nhập thành công và chuyển hướng về trang phù hợp
  (pending nếu chưa duyệt, dashboard/home nếu đã duyệt).
result: pass

### 4. Header thay đổi khi đăng nhập
expected: |
  Khi chưa đăng nhập: Header hiển thị nút "Đăng nhập" và "Đăng ký".
  Khi đã đăng nhập: Header hiển thị tên người dùng và nút "Đăng xuất"
  (thay thế các nút cũ). Trên mobile cũng hiển thị tương tự trong menu.
result: issue
reported: "F5 thì header nhấp nháy — hiển thị Đăng nhập/Đăng ký trước khi API trả về, sau đó mới chuyển sang tên user + Đăng xuất"
severity: minor

### 5. Đăng xuất hoạt động
expected: |
  Khi đang đăng nhập, nhấn nút "Đăng xuất" trên Header. Hệ thống đăng xuất
  và chuyển hướng về trang chủ (hoặc /login). Header trở về trạng thái
  hiển thị "Đăng nhập" / "Đăng ký".
result: pass

### 6. Admin truy cập trang quản lý tài khoản
expected: |
  Đăng nhập bằng tài khoản admin. Truy cập /admin/users. Trang hiển thị bảng
  danh sách tất cả tài khoản với các cột: Tên học sinh, Số điện thoại, Năm sinh,
  Địa chỉ, Trạng thái, Hành động. Có 4 tab: Tất cả | Chờ duyệt | Đã duyệt | Từ chối.
result: issue
reported: "Trang load được nhưng: (1) Không có điều hướng vào admin sau khi login — cần button 'Sang trang quản lý'; (2) Admin area thiếu sidebar điều hướng giữa Quản lý user / Quản lý khóa học, UI cần đẹp hơn"
severity: major

### 7. Admin duyệt tài khoản
expected: |
  Trên /admin/users, tab "Chờ duyệt", tìm một user đang pending. Nhấn nút
  "Duyệt tài khoản". Hệ thống cập nhật trạng thái thành "Đã duyệt" và hiển thị
  toast thành công. Row của user chuyển sang tab "Đã duyệt".
result: issue
reported: "Duyệt thành công (toast hiện) nhưng F5 vẫn không thấy thay đổi — có thể mutation không thực sự ghi vào Supabase (RLS block hoặc silent error)"
severity: blocker

### 8. Admin từ chối tài khoản (2 bước)
expected: |
  Trên /admin/users, tìm một user. Nhấn nút "Từ chối" lần 1 — nút đổi thành
  "Xác nhận từ chối?". Nhấn lần 2 — hệ thống thực hiện từ chối và cập nhật
  trạng thái. Nếu không nhấn lần 2, nút tự reset sau 3 giây.
result: issue
reported: "Tương tự test 7 — từ chối xong nhưng F5 không thấy thay đổi, mutation không ghi vào DB"
severity: blocker

### 9. Non-admin không truy cập được /admin/users
expected: |
  Đăng nhập bằng tài khoản học sinh (role = student). Thử truy cập thẳng vào
  /admin/users. Hệ thống redirect đi chỗ khác (về / hoặc /login) — KHÔNG cho
  vào trang admin.
result: pass

## Summary

total: 9
passed: 5
issues: 5
pending: 0
skipped: 0

## Gaps

- truth: "Trường Năm sinh trên form đăng ký nên dùng date-picker để trải nghiệm tốt hơn"
  status: improvement
  reason: "User requested: Năm sinh tôi muốn làm date-picker"
  severity: minor
  test: 1
  artifacts: [src/pages/Register.tsx]
  missing: []

- truth: "Kiểm tra trùng số điện thoại khi đăng ký; quên mật khẩu gửi OTP về SĐT"
  status: backlog
  reason: "User requested: check trùng SĐT + forgot password qua OTP — note để làm sau"
  severity: minor
  test: 2
  artifacts: [src/pages/Register.tsx]
  missing: [duplicate-phone-check, forgot-password-otp]

- truth: "Header không nhấp nháy khi F5 — ẩn auth buttons trong khi loading, chỉ render sau khi auth state xác định"
  status: failed
  reason: "User reported: F5 thì header nhấp nháy — hiển thị Đăng nhập/Đăng ký trước khi API trả về"
  severity: minor
  test: 4
  artifacts: [src/components/landing/Header.tsx, src/contexts/AuthContext.tsx]
  missing: [loading-state-guard-in-header]

- truth: "Sau khi đăng nhập admin, có điểm vào rõ ràng để vào khu vực quản lý (button hoặc link trong header)"
  status: failed
  reason: "User reported: không có điều hướng vào admin sau login — cần button 'Sang trang quản lý'"
  severity: major
  test: 6
  artifacts: [src/components/landing/Header.tsx]
  missing: [admin-nav-button-in-header]

- truth: "Duyệt user thực sự ghi vào Supabase — sau F5 trạng thái vẫn là Đã duyệt"
  status: failed
  reason: "User reported: F5 vẫn không thấy thay đổi — mutation có thể bị RLS block hoặc silent error, toast hiện nhưng DB không được update"
  severity: blocker
  test: 7
  artifacts: [src/pages/admin/UsersPage.tsx, supabase/migrations/20260324_rls_profiles.sql]
  missing: [rls-admin-update-policy, mutation-error-handling]

- truth: "Từ chối user thực sự ghi vào Supabase — sau F5 trạng thái vẫn là Từ chối"
  status: failed
  reason: "User reported: tương tự test 7 — mutation không ghi vào DB, cùng root cause RLS"
  severity: blocker
  test: 8
  artifacts: [src/pages/admin/UsersPage.tsx, supabase/migrations/20260324_rls_profiles.sql]
  missing: [rls-admin-update-policy]

- truth: "Admin area có sidebar điều hướng giữa các tác vụ (Quản lý user, Quản lý khóa học...) với UI đẹp"
  status: failed
  reason: "User reported: thiếu sidebar admin layout, UI cần cải thiện"
  severity: major
  test: 6
  artifacts: [src/pages/admin/UsersPage.tsx]
  missing: [admin-sidebar-layout]

- truth: "Trang /pending có nút về Trang chủ để xem bài giảng/tài liệu free"
  status: failed
  reason: "User requested: từ /pending cần button về Trang chủ để user xem nội dung free"
  severity: minor
  test: 2
  artifacts: [src/pages/Pending.tsx]
  missing: [home-button-on-pending]
