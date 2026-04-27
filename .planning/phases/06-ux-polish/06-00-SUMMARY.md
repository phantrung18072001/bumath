---
phase: 06-ux-polish
plan: "00"
subsystem: testing
tags: [wave-0, tdd, test-stubs, ux-polish]
dependency_graph:
  requires: []
  provides:
    - Test stubs for Phase 6 UX polish features (Wave 0 RED phase)
  affects:
    - src/pages/NotFound.tsx
    - src/components/student/StudentLayout.tsx
    - src/pages/student/CataloguePage.tsx
    - src/pages/student/CourseDetailPage.tsx
    - src/pages/admin/SubmissionsPage.tsx
tech_stack:
  added: []
  patterns:
    - Vitest dynamic import() for test stubs — avoids ESM resolution errors
    - Placeholder component stub (CataloguePage.tsx) to enable test loading
key_files:
  created:
    - src/components/student/StudentLayout.test.tsx
    - src/pages/student/CataloguePage.test.tsx
    - src/pages/student/CataloguePage.tsx
    - src/pages/student/CourseDetailPage.test.tsx
  modified:
    - src/pages/admin/SubmissionsPage.test.tsx (already done by Plan 02 parallel agent)
decisions:
  - "CataloguePage.tsx placeholder created — Vite resolves dynamic imports at transform time; stub needed for test file to load"
  - "NotFound.test.tsx and SubmissionsPage.test.tsx already committed by parallel agents — no duplicate commits made"
metrics:
  duration: "7 minutes"
  completed_date: "2026-04-27"
  tasks_completed: 5
  files_created: 4
  files_modified: 1
---

# Phase 6 Plan 00: UX Polish Test Stubs Summary

Wave 0 test stubs for Phase 6 UX Polish — defines expected behavior for 5 UI components before implementation, enabling TDD RED phase.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | NotFound.test.tsx stub | Already committed by Plan 01 agent | `src/pages/NotFound.test.tsx` |
| 2 | StudentLayout.test.tsx stub | `7a02569` | `src/components/student/StudentLayout.test.tsx` |
| 3 | CataloguePage.test.tsx stub | `8d17f5c` | `src/pages/student/CataloguePage.test.tsx`, `src/pages/student/CataloguePage.tsx` |
| 4 | CourseDetailPage.test.tsx stub | `13b42a3` | `src/pages/student/CourseDetailPage.test.tsx` |
| 5 | SubmissionsPage.test.tsx filter stubs | Already committed by Plan 02 agent | `src/pages/admin/SubmissionsPage.test.tsx` |

## Test Status (Wave 0 — RED Phase)

| Test File | Tests | Pass | Fail | Notes |
|-----------|-------|------|------|-------|
| NotFound.test.tsx | 5 | 5 | 0 | Implementation completed by Plan 01 |
| StudentLayout.test.tsx | 4 | 4 | 0 | Implementation completed by Plan 01 |
| CataloguePage.test.tsx | 6 | 0 | 6 | Expected RED — Plan 03 will implement |
| CourseDetailPage.test.tsx | 4 | 1 | 3 | Expected RED — Plan 04 will implement |
| SubmissionsPage.test.tsx (filter stubs) | 4 | 4 | 0 | Implementation completed by Plan 02 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created CataloguePage.tsx placeholder stub**
- **Found during:** Task 3
- **Issue:** Vite resolves dynamic imports at transform time; `CataloguePage.tsx` didn't exist, causing "Failed to resolve import" error that prevented the test file from running at all
- **Fix:** Created minimal placeholder stub `src/pages/student/CataloguePage.tsx` so test file can load; all 6 tests fail with assertion errors (correct Wave 0 behavior)
- **Files modified:** `src/pages/student/CataloguePage.tsx` (created)
- **Commit:** `8d17f5c`

**2. [Parallel Agent] NotFound.test.tsx already existed**
- **Found during:** Task 1
- **Issue:** File already existed (committed by Plan 01 parallel agent) with matching content
- **Fix:** No action needed; accepted existing file as satisfying acceptance criteria

**3. [Parallel Agent] SubmissionsPage.test.tsx already updated**
- **Found during:** Task 5
- **Issue:** Plan 02 parallel agent already committed the filter test stubs and mockUngraded with target_grade
- **Fix:** No action needed; existing file satisfies all acceptance criteria for Task 5

## Known Stubs

- `src/pages/student/CataloguePage.tsx` — Intentional stub returning `<div />` only; full implementation in Phase 06 Plan 03

## Self-Check: PASSED

Files created:
- ✓ `src/components/student/StudentLayout.test.tsx`
- ✓ `src/pages/student/CataloguePage.test.tsx`
- ✓ `src/pages/student/CataloguePage.tsx`
- ✓ `src/pages/student/CourseDetailPage.test.tsx`
- ✓ `src/pages/NotFound.test.tsx` (pre-existing)
- ✓ `src/pages/admin/SubmissionsPage.test.tsx` (pre-existing, updated by parallel agent)

Commits exist:
- ✓ `7a02569` — test(06-00): add StudentLayout test stubs
- ✓ `8d17f5c` — test(06-00): add CataloguePage test stubs and placeholder component
- ✓ `13b42a3` — test(06-00): add CourseDetailPage preview mode test stubs
