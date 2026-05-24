---
status: partial
phase: 18-mock-exam-system
source:
  - 18-01-SUMMARY.md
  - 18-02-SUMMARY.md
  - 18-03-SUMMARY.md
  - 18-04-SUMMARY.md
started: 2026-05-13T11:12:00Z
updated: 2026-05-24T11:30:19Z
---

## Current Test

[testing paused — 5 items outstanding]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running app/services and start from scratch. Database schema/functions for mock exams exist, app boots without startup errors, and a primary app page/API call returns live data.
result: pass

### 2. Admin Exam Sessions List
expected: Opening /quan-tri/de-thi shows exam sessions list with key fields and usable entry points to create or manage sessions.
result: issue
reported: "1, \"null value in column \"created_by\" of relation \"exam_sessions\" violates not-null constraint\" khi tạo đề thi
2, Sửa text Đề thi thử thành Đề thi
3, Phần button tài khoản mất button dẫn đến phần quản trị (đối với admin, giáo viên) và hồ sơ đối với học sinh rồi."
severity: blocker

### 3. Create Exam Session
expected: Using the admin create flow opens the dialog, validates required fields, and creates a new draft session that appears in the list.
result: issue
reported: "1, UI xấu, sử dụng taste UI để thiết kế lại modern hơn
2, Không báo error khi không nhập các trường bắt buộc
3, Bấm Lưu thì got error: null value in column \"created_by\" of relation \"exam_sessions\" violates not-null constraint
4, Sử dụng time từ 0h-23h, không sử dụng AM, PM, thêm text ở mỗi dòng để biết cần nhập thông tin gì"
severity: blocker

### 4. Author Exam Questions
expected: On /quan-tri/de-thi/:sessionId, admin can add/edit/reorder multiple-choice questions and answers with persistence after save.
result: blocked
blocked_by: prior-phase
reason: "bị block rồi nên tôi không test được nữa, fix các issue trước đó đã"

### 5. Publish/Start Controls Enforcement
expected: Publishing and starting sessions follow defined workflow rules, and editing question content is blocked once attempts exist.
result: pending

### 6. Student Exam List
expected: Opening /de-thi shows available mock exams with correct availability/status information for the student.
result: pending

### 7. Start and Complete Attempt
expected: Student can start one attempt, answer questions, and submit successfully with attempt state persisted.
result: pending

### 8. Timer and Deadline Handling
expected: Countdown is visible during attempt, deadline behavior is enforced, and late save/submit actions are rejected with clear feedback.
result: pending

## Summary

total: 8
passed: 1
issues: 2
pending: 4
skipped: 0
blocked: 1

## Gaps

- truth: "Opening /quan-tri/de-thi shows exam sessions list with key fields and usable entry points to create or manage sessions."
  status: failed
  reason: "User reported: 1, \"null value in column \"created_by\" of relation \"exam_sessions\" violates not-null constraint\" khi tạo đề thi; 2, Sửa text Đề thi thử thành Đề thi; 3, Phần button tài khoản mất button dẫn đến phần quản trị (đối với admin, giáo viên) và hồ sơ đối với học sinh rồi."
  severity: blocker
  test: 2
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Using the admin create flow opens the dialog, validates required fields, and creates a new draft session that appears in the list."
  status: failed
  reason: "User reported: 1, UI xấu, sử dụng taste UI để thiết kế lại modern hơn; 2, Không báo error khi không nhập các trường bắt buộc; 3, Bấm Lưu thì got error: null value in column \"created_by\" of relation \"exam_sessions\" violates not-null constraint; 4, Sử dụng time từ 0h-23h, không sử dụng AM, PM, thêm text ở mỗi dòng để biết cần nhập thông tin gì"
  severity: blocker
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
