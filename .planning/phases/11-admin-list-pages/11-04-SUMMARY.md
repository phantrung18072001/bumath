---
phase: 11-admin-list-pages
plan: "04"
subsystem: admin-ui
tags: [gap-closure, coursespage, pagination, stt]
requires: []
provides: [stt-column-courses, dynamic-page-size-courses]
affects: [src/pages/admin/CoursesPage.tsx]
tech-stack:
  added: []
  patterns: [dynamic-pagination, stt-column]
key-files:
  created: []
  modified:
    - src/pages/admin/CoursesPage.tsx
    - src/pages/admin/CoursesPage.test.tsx
key-decisions:
  - "PAGE_SIZE=20 const replaced with pageSize useState(10) to match UsersPage"
  - "Page size selector shown whenever filtered.length > 0 for consistent UX with UsersPage"
requirements-completed: [ADMIN-UI-02]
duration: "2 min"
completed: "2026-05-01"
---

# Phase 11 Plan 04: CoursesPage Gap Fixes Summary

STT column + dynamic page size for CoursesPage, closing gap from 11-UAT.md test 3.

**Duration:** 2 min | **Start:** 2026-05-01T16:04:38Z | **End:** 2026-05-01T16:06:12Z | **Tasks:** 2 | **Files:** 2

## What Was Built

- Replaced hardcoded `PAGE_SIZE = 20` with `const [pageSize, setPageSize] = useState(10)`
- `handlePageSizeChange` resets `currentPage` to 1 on size change
- Updated `totalPages` and `paginated` slice to use `pageSize` state
- STT column added as first column in the inline table — formula: `(currentPage - 1) * pageSize + index + 1`
- Page size `<Select>` with options 10/20/50 renders next to `<Pagination>` whenever `filtered.length > 0`
- Tests updated: 15 courses, `pageSize=10`, assert Khóa học 9/10 visible, Khóa học 11 not visible on page 1

## Task Commits

- Task 1+2: 1469a31 — fix(11-04): CoursesPage STT column + dynamic page size

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Self-Check: PASSED

- `pageSize` is `useState(10)` replacing `const PAGE_SIZE = 20` ✓
- No `PAGE_SIZE` const remains ✓
- STT column present as first column with correct formula ✓
- Page size Select with 10/20/50 options ✓
- All 14 CoursesPage tests pass ✓
- TypeScript compiles cleanly ✓
