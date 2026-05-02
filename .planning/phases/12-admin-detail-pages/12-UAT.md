---
status: complete
phase: 12-admin-detail-pages
source: [12-01-SUMMARY.md, 12-02-SUMMARY.md, 12-03-SUMMARY.md, 12-04-SUMMARY.md]
started: 2026-05-02T17:42:00Z
updated: 2026-05-02T11:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Drag-and-drop reorder chapters
expected: Each chapter row has a GripVertical drag handle. Dragging reorders the list and the order persists after page refresh.
result: issue
reported: "lúc drag bị hiển thị scrollbar ngang và dọc"
severity: minor

### 2. Drag-and-drop reorder lessons
expected: On the Lessons page for any course/chapter, each lesson row has a GripVertical drag handle. Dragging reorders lessons and persists after refresh.
result: pass

### 3. SubmissionsPage status filter
expected: The Submissions page has a "Trạng thái" Select filter (Tất cả / Chưa chấm / Đã chấm). Selecting a filter updates the table to show only matching submissions. Pagination works per-filter.
result: pass

### 4. SubmissionsPage score badge column
expected: The Submissions table shows a "Điểm" column. Graded submissions show their score as a badge. Ungraded submissions show an empty cell or dash.
result: pass

### 5. SubmissionsPage skeleton loading
expected: When the Submissions page first loads, skeleton placeholder rows appear while data is fetching, then are replaced by real data.
result: pass

### 6. GradingPage mobile sticky bar
expected: On a mobile viewport (< 1024px / lg breakpoint), the GradingPage shows a fixed bottom bar containing a score Input and "Lưu điểm" button. The page content above is scrollable. The desktop sticky sidebar is hidden.
result: pass

### 7. GradingPage mobile double-confirm flow
expected: On mobile, tapping "Lưu điểm" replaces the button with "Bạn chắc chắn muốn lưu điểm X/10?" + Xác nhận/Hủy buttons inside the sticky bar. Tapping Xác nhận submits the grade.
result: pass

### 8. GradingPage desktop layout unchanged
expected: On desktop (≥ 1024px), the original sticky right sidebar with score + comment + teacher image upload is still present and functional. No bottom bar visible.
result: pass

### 9. UsersPage server-side pagination
expected: The Users page loads with 25 users per page. Searching by name/email filters users server-side. Filtering by role (admin/teacher/student) works. Page count shows total from server.
result: pass

### 10. CoursesPage server-side pagination
expected: The Courses page loads with 20 courses per page. Searching and filtering by grade work server-side. Pagination controls advance through pages correctly.
result: issue
reported: "đồng nhất 20 đi ở cả trang user nữa"
severity: minor

## Summary

total: 10
passed: 8
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Dragging a chapter row reorders the list smoothly with no layout side effects"
  status: failed
  reason: "User reported: lúc drag bị hiển thị scrollbar ngang và dọc"
  severity: minor
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "UsersPage and CoursesPage both use 20 items per page for consistency"
  status: failed
  reason: "User reported: đồng nhất 20 đi ở cả trang user nữa"
  severity: minor
  test: 10
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
