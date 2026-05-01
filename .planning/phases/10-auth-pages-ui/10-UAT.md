---
status: complete
phase: 10-auth-pages-ui
source: [10-01-SUMMARY.md, 10-02-SUMMARY.md]
started: 2026-05-01T12:30:57Z
updated: 2026-05-01T12:40:14Z
---

## Current Test

[testing complete]

## Tests

### 1. Login Page — BuMath Design
expected: |
  Mở http://localhost:8080/dang-nhap (yarn dev).
  Trang có nền màu xanh nhạt (#F0FDFA).
  Logo BuMath (ảnh + chữ "BuMath" màu teal) hiện phía trên card.
  Card trắng với viền teal đậm 3px và bóng đổ "clay" (dày, có shadow dưới).
  Nút "Đăng nhập" màu cam (#F97316).
  Nhãn form dùng font Comic Neue (chữ tròn, thân thiện).
result: issue
reported: "Để mỗi nền xanh tôi thấy không hợp mắt lắm"
severity: cosmetic

### 2. Login Page — Floating Math Symbols
expected: |
  Trên màn hình desktop (≥640px): 6 ký hiệu toán học (π √ ± × ÷ ∑)
  lơ lửng nhẹ nhàng trong nền với opacity rất mờ.
  Trên mobile (375px): ký hiệu bị ẩn, không bị tràn màn hình ngang.
result: pass
note: "Symbols visible and animated, nhưng hơi mờ — sẽ được fix khi đổi sang chalkboard background (symbols sẽ dùng màu phấn trắng, nổi bật hơn)"

### 3. Login — Form hoạt động
expected: |
  Nhập số điện thoại không hợp lệ → hiện lỗi "Số điện thoại không hợp lệ".
  Nút đăng nhập disabled khi đang submit (có spinner).
  Password show/hide toggle hoạt động (icon mắt).
result: pass

### 4. Register Page — Claymorphism + 2 cột
expected: |
  Mở http://localhost:8080/dang-ky.
  Card rộng hơn Login (520px), cùng thiết kế clay card.
  Trên desktop: 6 trường form xếp thành 3 hàng × 2 cột
  (Số ĐT | Tên học sinh), (Năm sinh | Địa chỉ), (Mật khẩu | Xác nhận MK).
  Trên mobile (375px): 1 cột, các trường xếp dọc.
result: pass

### 5. Register — Form logic
expected: |
  Dropdown "Năm sinh" hiện danh sách từ 2020 xuống 1990.
  Mật khẩu < 8 ký tự → lỗi validation.
  Mật khẩu không khớp → lỗi "Mật khẩu xác nhận không khớp".
  Nút "Đăng ký" màu cam, disabled khi đang submit.
result: pass

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Trang auth có nền màu xanh nhạt (#F0FDFA) theo BuMath design system"
  status: failed
  reason: "User reported: Để mỗi nền xanh tôi thấy không hợp mắt lắm — muốn nền kiểu học sinh hơn, chọn: Chalkboard / bảng đen — nền tối với họa tiết phấn trắng"
  severity: cosmetic
  test: 1
  artifacts: [src/pages/Login.tsx, src/pages/Register.tsx]
  missing: [chalkboard dark background với chalk-texture pattern]
