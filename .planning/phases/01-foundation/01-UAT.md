---
status: testing
phase: 01-foundation
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md]
started: 2026-04-20T00:00:00Z
updated: 2026-04-20T00:00:00Z
---

## Current Test

number: 3
name: Vercel production app load được
expected: |
  Truy cập production URL trên Vercel (URL mà bạn đã deploy). App hiển thị
  landing page bình thường, không bị 404 hay lỗi trắng trang.
awaiting: user response

## Tests

### 1. App khởi động local không lỗi
expected: |
  Chạy `yarn dev`. Dev server khởi động tại http://localhost:8080 (hoặc port
  tương tự). Không có lỗi về thiếu env vars trong terminal hoặc browser console.
  Trang landing page hiển thị bình thường.
result: pass

### 2. Deep-link routing hoạt động
expected: |
  Khi đang chạy `yarn dev`, truy cập thẳng vào URL http://localhost:8080/login
  bằng cách gõ trực tiếp vào address bar (không click từ app). Trang login
  hiển thị đúng — KHÔNG bị lỗi 404 hoặc trang trắng.
result: pass

### 3. Vercel production app load được
expected: |
  Truy cập production URL trên Vercel (URL mà bạn đã deploy). App hiển thị
  landing page bình thường, không bị 404 hay lỗi trắng trang.
result: [pending]

### 4. Deep-link trên production không 404
expected: |
  Trên production Vercel URL, thêm `/login` vào cuối URL và nhấn Enter (ví dụ:
  https://your-app.vercel.app/login). App vẫn load đúng trang login thay vì
  trả về lỗi 404 từ Vercel.
result: [pending]

## Summary

total: 4
passed: 2
issues: 0
pending: 2
skipped: 0

## Gaps

[none yet]
