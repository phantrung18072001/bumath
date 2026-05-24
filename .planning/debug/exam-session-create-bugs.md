---
status: investigating
trigger: "UAT Test 3 - exam session create: null created_by, no validation feedback, AM/PM time picker"
created: 2025-01-01T00:00:00Z
updated: 2025-01-01T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: "All three bugs originate in commit 23c8ee1 original implementation before UAT fixes in 27d88ed"
test: "Git diff between 23c8ee1 and 27d88ed confirms each root cause"
expecting: "Evidence confirmed for all three bugs"
next_action: "CONFIRMED — root causes identified for all three issues"

## Symptoms

expected: "Admin create flow opens dialog, validates required fields, creates new draft session that appears in list"
actual: |
  1. UI looks bad — needs modern redesign (not a bug to diagnose for root cause)
  2. No validation error shown when required fields are empty
  3. Clicking Lưu (Save) throws: null value in column "created_by" of relation "exam_sessions" violates not-null constraint
  4. Time picker uses AM/PM format — should use 24-hour (0h–23h) format
errors: "null value in column \"created_by\" of relation \"exam_sessions\" violates not-null constraint"
reproduction: "Go to /quan-tri/de-thi, open create exam session dialog, try to save"
started: "Discovered during UAT"

## Eliminated

## Evidence

- timestamp: 2025-01-01T00:01:00Z
  checked: "git show 23c8ee1:src/lib/api/exams.ts — createExamSession original"
  found: "Original createExamSession used `supabase.from('exam_sessions').insert(payload)` where payload={title,session_type,starts_at,ends_at} — NO created_by field"
  implication: "DB column created_by uuid NOT NULL has no value → null constraint violation"

- timestamp: 2025-01-01T00:02:00Z
  checked: "git show 23c8ee1:src/components/admin/ExamSessionFormDialog.tsx — original handleSubmit"
  found: "handleSubmit was: `if (!title.trim() || !startsAt || !endsAt) return` — silently returns, no errors state, no UI feedback"
  implication: "User sees nothing when required fields are empty — no error messages shown"

- timestamp: 2025-01-01T00:03:00Z
  checked: "git show 23c8ee1:src/components/admin/ExamSessionFormDialog.tsx — time input"
  found: "Time inputs were `<Input type='datetime-local'>` — HTML datetime-local uses browser/OS locale for time format display"
  implication: "Many browsers/OSes show datetime-local in 12h AM/PM format based on system locale"

- timestamp: 2025-01-01T00:04:00Z
  checked: "HEAD (27d88ed) src/lib/api/exams.ts createExamSession"
  found: "HEAD fix: calls supabase.auth.getUser() first, then inserts with created_by: user.id — fix present in HEAD"
  implication: "Bug 1 fixed in HEAD — but was the cause during UAT run on 23c8ee1"

- timestamp: 2025-01-01T00:05:00Z
  checked: "HEAD ExamSessionFormDialog.tsx"
  found: "HEAD has errors state with per-field inline messages, and custom Select dropdowns for hours (00-23) and minutes (00-59)"
  implication: "Bugs 2 and 3 fixed in HEAD — original implementation lacked both"

## Resolution

root_cause: |
  BUG 1 — created_by null constraint: In original implementation (commit 23c8ee1),
  createExamSession called insert(payload) where payload = {title, session_type, starts_at, ends_at}.
  No created_by field was included. DB column created_by uuid NOT NULL → null constraint error.
  Fix in 27d88ed: added supabase.auth.getUser() call and created_by: user.id in insert payload.

  BUG 2 — No validation feedback: Original ExamSessionFormDialog.handleSubmit silently returned
  (if (!title.trim() || !startsAt || !endsAt) return) with no errors state and no UI messages.
  Fix in 27d88ed: added errors Record<string,string> state with per-field inline error messages.

  BUG 3 — AM/PM time picker: Original form used <Input type='datetime-local'> which renders using
  the browser/OS locale time format — shows AM/PM on systems using 12-hour locale.
  Fix in 27d88ed: replaced with two custom Select dropdowns showing 00-23 (hours) and 00-59 (minutes).
fix: "All three bugs were fixed in commit 27d88ed (test(18): complete UAT - 6 passed, 2 issues)"
verification:
files_changed:
  - src/lib/api/exams.ts
  - src/components/admin/ExamSessionFormDialog.tsx
