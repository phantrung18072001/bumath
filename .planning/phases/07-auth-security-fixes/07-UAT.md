---
status: complete
phase: 07-auth-security-fixes
source: [07-00-SUMMARY.md, 07-01-SUMMARY.md, 07-02-SUMMARY.md]
started: 2026-04-29T10:35:20Z
updated: 2026-04-29T10:44:30Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Start fresh with `yarn dev`. App boots without errors at http://localhost:8080 and the login page loads.
result: pass

### 2. Pending student → redirect to /pending
expected: Log in with an account whose approval_status is "pending". After login, the app redirects to /pending (not to / or /courses).
result: issue
reported: "Không cần redirect đến pending, tôi nghĩ bỏ trạng thái pending đi, mình sẽ quản lý bằng cách cấp quyền vào khóa học cho user"
severity: major

### 3. Rejected student → redirect to /pending
expected: Log in with an account whose approval_status is "rejected". After login, the app redirects to /pending.
result: issue
reported: "Không cần field approval_status luôn — bỏ hoàn toàn trạng thái approval"
severity: major

### 4. Approved student → redirect to /courses
expected: Log in with an approved student account. After login, the app redirects to /courses.
result: pass

### 5. Approved admin → redirect to /admin/users
expected: Log in with an approved admin account. After login, the app redirects to /admin/users (not to /).
result: issue
reported: "pass redirect, nhưng admin cần có header để back về landing và xem courses như bình thường — tài khoản admin chỉ khác ở chỗ có thể vào trang quản lý, không phải bị nhốt vào admin panel"
severity: major

### 6. AdminLayout logout button visible
expected: While logged in as admin, open any /admin/* page. The sidebar shows a "Đăng xuất" button (with a LogOut icon) at the bottom, below the "← Về trang chủ" link.
result: pass

### 7. Logout works end-to-end
expected: Click "Đăng xuất" in the admin sidebar. The app signs out and redirects to /login. Going back to /admin/* requires logging in again.
result: pass

### 8. Profiles RLS — students cannot see each other
expected: In Supabase Dashboard → Table Editor → profiles → RLS shows "Enabled". Three policies exist: "Students can view own profile" (SELECT), "Users can update own profile" (UPDATE), "Admin can update any profile" (UPDATE). (Or confirm the migration ran successfully in the earlier checkpoint.)
result: pass

## Summary

total: 8
passed: 5
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Pending students are redirected to /pending after login"
  status: failed
  reason: "User reported: Bỏ trạng thái pending — quản lý access bằng enrollment vào khóa học thay vì approval_status"
  severity: major
  test: 2
  artifacts: []
- truth: "Rejected students are redirected to /pending after login"
  status: failed
  reason: "User reported: Bỏ hoàn toàn field approval_status — không cần trạng thái pending/rejected/approved"
  severity: major
  test: 3
  artifacts: []
- truth: "Admin users see a full header with navigation (landing, courses) in addition to the admin panel link"
  status: failed
  reason: "User reported: Admin nên có header bình thường (về landing, xem courses) — chỉ khác student ở chỗ có thêm link vào trang quản lý"
  severity: major
  test: 5
  artifacts: []
  missing: []
