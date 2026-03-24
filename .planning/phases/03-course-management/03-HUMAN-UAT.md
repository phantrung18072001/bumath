---
status: partial
phase: 03-course-management
source: [03-VERIFICATION.md]
started: 2026-03-25T05:57:00Z
updated: 2026-03-25T05:57:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. RLS enforcement — student cannot access lessons from un-enrolled course
expected: A student enrolled in Course X cannot query lessons from Course Y via the student_read_enrolled_lessons RLS policy. Supabase returns empty result (not an error) when querying lessons for a course the student is not enrolled in.
result: [pending]

### 2. File attachment end-to-end flow
expected: Admin can create a lesson with an assignment file — file uploads to storage, FileText icon appears in lessons list, and on edit the existing file is retained (or can be removed). Flow works against a live Supabase Storage bucket.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
