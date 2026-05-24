---
status: complete
phase: 21-tai-lieu-page
source:
  - .planning/phases/21-tai-lieu-page/21-P01-SUMMARY.md
  - .planning/phases/21-tai-lieu-page/21-P02-SUMMARY.md
  - .planning/phases/21-tai-lieu-page/21-P03-SUMMARY.md
  - .planning/phases/21-tai-lieu-page/21-P04-SUMMARY.md
started: 2026-05-24T17:18:17Z
updated: 2026-05-24T18:02:42Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Stop any running local services, then start the app from a fresh state. The app boots without startup errors, migrations/seeds do not fail, and you can open the app and load a primary view successfully.
result: pass

### 2. Public Tai Lieu Page Access
expected: Visiting `/tai-lieu` without login shows the page shell correctly (header, hero title/subtitle, footer). If there is no material data yet, an empty state message is acceptable and still counts as pass for this test.
result: pass

### 3. Public Grade Filter Behavior
expected: Grade filter pills (Tất cả, Khối 7, Khối 8, Khối 9, Ôn thi chuyên) change the visible card list immediately client-side without full page reload.
result: pass

### 4. Public Material Download
expected: Clicking Xem trước opens the file in a new tab, and clicking Tải xuống downloads the file directly. Only the interacted card shows loading state.
result: pass

### 5. Public Empty/Error States
expected: If no materials match the selected grade, an empty message is shown. If data fetch fails, an error state is shown instead of broken UI.
result: pass

### 6. Admin Route Protection and Access
expected: `/quan-tri/tai-lieu` is blocked for unauthorized users, but accessible for `admin` and `teacher` roles.
result: pass

### 7. Admin Upload Flow
expected: On `/quan-tri/tai-lieu`, entering title + grade + PDF and submitting uploads successfully, shows success feedback, clears form fields, and the new item appears in the list.
result: pass

### 8. Admin Delete Flow
expected: Deleting a material requires confirmation; confirming removes the item and shows success feedback.
result: pass

### 9. Admin Sidebar Navigation
expected: Admin sidebar includes a "Tài liệu" nav item and clicking it routes to `/quan-tri/tai-lieu`; teachers can also see this nav item.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
