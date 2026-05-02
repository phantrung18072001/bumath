---
plan: 12-02
phase: 12-admin-detail-pages
status: complete
completed: 2026-05-02
---

## Summary

Replaced SubmissionsPage client-side filtering with server-side pagination via `getAllSubmissions`. Added status filter Select, Score column with badge, Skeleton loading, and pagination controls.

## What Was Built

- **SubmissionsPage.tsx** — Uses `getAllSubmissions` (PaginatedSubmissions); PAGE_SIZE=20; status filter Select (all/ungraded/graded); Score column with badge; Skeleton loading rows; Pagination component; count display "X bài nộp"
- **Tests** — Replaced `getUngraded` mocks with `getAllSubmissions`; smart dynamic mock with status filter simulation; all 10 tests pass

## Key Files

- `src/pages/admin/SubmissionsPage.tsx`
- `src/pages/admin/SubmissionsPage.test.tsx`

## Commit

17bffbf — Plan 12-02: SubmissionsPage server-side pagination + status filter
