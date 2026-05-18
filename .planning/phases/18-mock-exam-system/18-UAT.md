---
status: testing
phase: 18-mock-exam-system
source:
  - 18-01-SUMMARY.md
  - 18-02-SUMMARY.md
  - 18-03-SUMMARY.md
  - 18-04-SUMMARY.md
started: 2026-05-13T11:12:00Z
updated: 2026-05-13T11:12:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running app/services and start from scratch. Database schema/functions for mock exams exist,
  app boots without startup errors, and a primary app page/API call returns live data.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running app/services and start from scratch. Database schema/functions for mock exams exist, app boots without startup errors, and a primary app page/API call returns live data.
result: pending

### 2. Admin Exam Sessions List
expected: Opening /quan-tri/de-thi shows exam sessions list with key fields and usable entry points to create or manage sessions.
result: pending

### 3. Create Exam Session
expected: Using the admin create flow opens the dialog, validates required fields, and creates a new draft session that appears in the list.
result: pending

### 4. Author Exam Questions
expected: On /quan-tri/de-thi/:sessionId, admin can add/edit/reorder multiple-choice questions and answers with persistence after save.
result: pending

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
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps

