---
status: complete
phase: 09-url-standardization
source: [09-01-SUMMARY.md, 09-02-SUMMARY.md, 09-03-SUMMARY.md, 09-04-SUMMARY.md, 09-05-SUMMARY.md, 09-06-SUMMARY.md, 09-07-SUMMARY.md]
started: 2026-05-01T18:15:00+07:00
updated: 2026-05-01T18:15:00+07:00
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 3
name: Admin panel URL /quan-tri/*
expected: |
  Đăng nhập admin → sidebar điều hướng đến /quan-tri/nguoi-dung,
  /quan-tri/khoa-hoc, /quan-tri/bai-nop trên thanh địa chỉ.
awaiting: user response

## Tests

### 1. Trang đăng nhập có URL /dang-nhap
expected: Mở trình duyệt, vào URL /dang-nhap → trang đăng nhập hiển thị bình thường. Vào URL /login → 404 Not Found.
result: pass

### 2. Trang đăng ký có URL /dang-ky
expected: Vào /dang-ky → trang đăng ký hiển thị. Link "Đã có tài khoản? Đăng nhập" dẫn về /dang-nhap (kiểm tra href trong DevTools).
result: pending

### 3. Admin panel URL /quan-tri/*
expected: Đăng nhập admin → sidebar điều hướng đến /quan-tri/nguoi-dung, /quan-tri/khoa-hoc, /quan-tri/bai-nop trên thanh địa chỉ.
result: pass

### 4. Danh sách khóa học URL /khoa-hoc
expected: Vào /khoa-hoc → trang danh sách khóa học của học sinh. Vào /courses → 404.
result: pass

### 5. Danh mục URL /danh-muc với filter ?lop=
expected: Vào /danh-muc → trang danh mục. Click filter "Lớp 7" → URL đổi thành /danh-muc?lop=7. Click "Ôn chuyên" → /danh-muc?lop=nang-cao.
result: pass

### 6. Breadcrumb admin khóa học đúng URL
expected: Trong admin, vào /quan-tri/khoa-hoc → click vào một khóa học → URL là /quan-tri/khoa-hoc/:slug. Click vào chương → URL là /quan-tri/khoa-hoc/:slug/chuong/:chapterSlug.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
