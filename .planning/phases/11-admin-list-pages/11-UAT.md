---
status: complete
phase: 11-admin-list-pages
source: [11-01-SUMMARY.md, 11-02-SUMMARY.md]
started: 2026-05-01T15:00:00Z
updated: 2026-05-01T22:24:58Z
---

## Current Test

[testing complete]

## Tests

### 1. UsersPage — Search by name/email
expected: Go to /quan-tri/nguoi-dung. There should be a search input in the toolbar. Type a partial name or email. The table filters in real-time (client-side) to show only matching users. Clearing the search restores the full list.
result: issue
reported: "conver +84(vn) giống 0 nhé — searching +84 and 0 prefix phone numbers should match interchangeably"
severity: major

### 2. UsersPage — Role filter
expected: On /quan-tri/nguoi-dung, there should be a role filter dropdown (Select) in the toolbar. Selecting a role (e.g., "Học sinh" or "Giáo viên") narrows the table to users of that role. Selecting "Tất cả" (or default) shows all users again.
result: pass

### 3. UsersPage — Pagination (25 per page)
expected: On /quan-tri/nguoi-dung, if there are more than 25 users, a pagination control appears below the table. Clicking Next/Previous page changes the visible rows. With ≤25 users total, pagination is hidden.
result: issue
reported: "Cần thêm: cột STT (tính theo trang — trang 2 bắt đầu từ số tiếp theo), page size selector (10/20/50) cạnh pagination. Áp dụng cho cả UsersPage và CoursesPage."
severity: minor

### 4. UsersPage — Skeleton loading state
expected: On /quan-tri/nguoi-dung (hard-reload or first load), while user data is being fetched, the table shows skeleton rows (grey placeholder bars) instead of real data. After data loads, skeleton disappears and real rows appear.
result: pass

### 5. CoursesPage — Search by course name
expected: Go to /quan-tri/khoa-hoc. There should be a search input in the toolbar. Type a partial course name. The table filters to show only matching courses. Clearing the search restores the full list.
result: pass
note: "page size selector (10/20/50) áp dụng cho filtered results — đã ghi nhận trong gap test 3"

### 6. CoursesPage — Grade filter
expected: On /quan-tri/khoa-hoc, there should be a grade filter dropdown in the toolbar. Selecting a grade (e.g., "Lớp 7", "Lớp 8", "Lớp 9") narrows the table to courses of that grade. Selecting "Tất cả" shows all courses.
result: pass

### 7. CoursesPage — Pagination (20 per page)
expected: On /quan-tri/khoa-hoc, if there are more than 20 courses, a pagination control appears below the table. Clicking through pages changes visible rows. With ≤20 courses, pagination is hidden.
result: pass
note: "page size selector (10/20/50) — đã ghi nhận trong gap test 3"

### 8. CoursesPage — Skeleton loading state
expected: On /quan-tri/khoa-hoc (hard-reload or first load), while course data is being fetched, the table shows skeleton rows instead of real data. After data loads, skeleton disappears and real rows appear.
result: pass

## Summary

total: 8
passed: 6
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Search should match phone numbers regardless of +84 vs 0 prefix format"
  status: failed
  reason: "User reported: search does not normalize +84 (international) and 0 (local) Vietnamese phone prefixes as equivalent"
  severity: major
  test: 1
  artifacts: []
  missing: []

- truth: "Pagination có STT column và page size selector (10/20/50)"
  status: failed
  reason: "User reported: cần thêm cột STT (tính theo trang), page size selector (10/20/50) cạnh pagination, cho cả UsersPage và CoursesPage"
  severity: minor
  test: 3
  artifacts: []
  missing: []
