---
status: diagnosed
phase: 18-mock-exam-system
source:
  - 18-01-SUMMARY.md
  - 18-02-SUMMARY.md
  - 18-03-SUMMARY.md
  - 18-04-SUMMARY.md
started: 2026-05-13T11:12:00Z
updated: 2026-05-24T22:53:35Z
---

## Current Test

[testing complete]

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
result: pass

### 5. Publish/Start Controls Enforcement
expected: Publishing and starting sessions follow defined workflow rules, and editing question content is blocked once attempts exist.
result: pass

### 6. Student Exam List
expected: Opening /de-thi shows available mock exams with correct availability/status information for the student.
result: pass
note: "Button layout trên trang /quan-tri/de-thi cần chỉnh lại cho đẹp hơn (cosmetic)"

### 7. Start and Complete Attempt
expected: Student can start one attempt, answer questions, and submit successfully with attempt state persisted.
result: pass

### 8. Timer and Deadline Handling
expected: Countdown is visible during attempt, deadline behavior is enforced, and late save/submit actions are rejected with clear feedback.
result: pass

## Summary

total: 8
passed: 6
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Opening /quan-tri/de-thi shows exam sessions list with key fields and usable entry points to create or manage sessions."
  status: fixed
  reason: "User reported: null value in column \"created_by\" of relation \"exam_sessions\" violates not-null constraint khi tạo đề thi; Text rename Đề thi thử → Đề thi; Account button missing admin/profile links"
  severity: blocker
  test: 2
  root_cause: "createExamSession in src/lib/api/exams.ts never included created_by in the insert payload; fixed in commit 27d88ed by calling supabase.auth.getUser() and spreading created_by: user.id"
  artifacts:
    - path: "src/lib/api/exams.ts"
      issue: "createExamSession insert payload omitted created_by (fixed in HEAD)"
  missing:
    - "created_by field in insert payload — resolved"
  debug_session: ".planning/debug/exam-session-create-bugs.md"

- truth: "Using the admin create flow opens the dialog, validates required fields, and creates a new draft session that appears in the list."
  status: fixed
  reason: "User reported: UI xấu; Không báo error khi không nhập các trường bắt buộc; null value in column \"created_by\" constraint error; AM/PM time format instead of 24h"
  severity: blocker
  test: 3
  root_cause: "(1) created_by omitted from insert — fixed via auth.getUser(); (2) handleSubmit had silent guard with no errors state/display — fixed with errors state + inline messages; (3) datetime-local input renders AM/PM on Vietnamese locale — fixed with custom 24h Select dropdowns"
  artifacts:
    - path: "src/lib/api/exams.ts"
      issue: "createExamSession missing created_by (fixed in HEAD)"
    - path: "src/components/admin/ExamSessionFormDialog.tsx"
      issue: "No validation error display; AM/PM datetime-local input (both fixed in HEAD)"
  missing:
    - "All functional bugs resolved in commit 27d88ed"
  debug_session: ".planning/debug/exam-session-create-bugs.md"
