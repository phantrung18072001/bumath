---
status: partial
phase: 03-course-management
source: [03-VERIFICATION.md]
started: 2026-04-26T00:00:00+07:00
updated: 2026-04-26T00:00:00+07:00
---

## Current Test

[awaiting human testing]

## Tests

### 1. RLS Student Access Enforcement
expected: An approved student enrolled in course X can read lessons for course X but NOT for course Y they are not enrolled in. The `student_read_enrolled_lessons` RLS policy uses an EXISTS subquery joining enrollments to chapters.
result: [pending]

### 2. YouTube Thumbnail Renders Correctly in Lesson List
expected: Navigate to a chapter with lessons — lesson with a YouTube URL shows an 80×48px thumbnail from img.youtube.com; lesson without URL shows an em dash.
result: [pending]

### 3. Lesson File Attachment End-to-End Flow
expected: Admin uploads a PDF in LessonFormDialog → filename chip appears in list row linking to the file → edit mode shows chip with "Xóa file" button → removing clears both storage and DB column.
result: [pending]

### 4. Image Preview in Lesson Dialog
expected: Selecting a JPG/PNG file in LessonFormDialog shows an inline thumbnail preview immediately via blob URL. Closing the dialog revokes the blob URL (no memory leak).
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
