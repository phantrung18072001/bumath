---
status: complete
phase: 06-ux-polish
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md, 06-05-SUMMARY.md]
started: 2026-04-27T15:35:53Z
updated: 2026-04-27T17:07:00Z
---

## Current Test

[testing complete]

## Tests

### 1. StudentLayout Navigation Rendering
expected: |
  Open the student app in a browser (yarn dev → http://localhost:8080).
  Log in as a student account.
  The header should show:
  - BuMath logo that is clickable and navigates to /
  - "Khóa học của tôi" nav link in the header
  - "Khám phá khóa học" nav link in the header
  - The currently active route link should appear visually highlighted/active
result: pass

### 2. Preview Mode Visual Quality
expected: |
  Navigate to a course URL (e.g., /courses/[any-course-slug]) while logged in as a student
  who is NOT enrolled in that course.
  You should see:
  - Course title and grade badge at the top
  - A prominent banner: "Bạn chưa đăng ký khóa học này."
  - Chapter list with lesson titles, each preceded by a Lock icon (🔒)
  - A CTA: "Vui lòng liên hệ giảng viên để được đăng ký khóa học này."
  - NO video player
  - NO exercise submission area
result: pass

### 3. Progress Bar Color
expected: |
  Navigate to /courses as an enrolled student (or any page with a progress bar).
  The progress bar track (background) should appear gray/neutral — not blue.
  Only the filled progress portion should show the primary (green/brand) color.
  This applies to both the CoursesPage course cards and the LessonSidebar progress bar.
result: pass

### 4. Admin Filter Reactivity
expected: |
  Log in as an admin. Go to /admin/submissions (grading queue).
  When there are submissions in the queue, a filter bar should appear with 4 controls:
  - Grade select (Lớp 7 / Lớp 8 / Lớp 9 / Ôn chuyên)
  - Course select
  - Lesson select
  - Student name text input
  Selecting a grade should immediately reduce the visible table rows.
  A count should show: "Hiển thị X / Y bài nộp"
  Combining two filters should narrow results further.
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
