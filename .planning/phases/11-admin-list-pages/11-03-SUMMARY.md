---
phase: 11-admin-list-pages
plan: "03"
subsystem: admin-ui
tags: [gap-closure, userspage, pagination, phone-search]
requires: []
provides: [phone-normalization, stt-column, dynamic-page-size-users]
affects: [src/pages/admin/UsersPage.tsx]
tech-stack:
  added: []
  patterns: [phone-normalization, dynamic-pagination]
key-files:
  created: []
  modified:
    - src/pages/admin/UsersPage.tsx
    - src/pages/admin/UsersPage.test.tsx
key-decisions:
  - "normalizePhone strips +84 and 84 prefix, applied to both stored phone and search query before substring match"
  - "Page size selector shown whenever filtered.length > 0 (not gated on totalPages > 1) to allow expanding from 1-page views"
requirements-completed: [ADMIN-UI-01]
duration: "2 min"
completed: "2026-05-01"
---

# Phase 11 Plan 03: UsersPage Gap Fixes Summary

Phone normalization + STT column + dynamic page size for UsersPage, closing gaps from 11-UAT.md tests 1 and 3.

**Duration:** 2 min | **Start:** 2026-05-01T16:02:13Z | **End:** 2026-05-01T16:04:10Z | **Tasks:** 3 | **Files:** 2

## What Was Built

- `normalizePhone()` helper that strips `+84` and `84` prefixes, normalizing to `0`-prefix format
- Applied to both the stored `u.phone` and `searchQuery` before substring match — so `+84912345678`, `84912345678`, and `0912345678` all match each other
- Replaced hardcoded `PAGE_SIZE = 25` with `const [pageSize, setPageSize] = useState(10)` 
- `handlePageSizeChange` resets `currentPage` to 1 on size change
- `UsersTable` sub-component updated with `currentPage` and `pageSize` props
- STT column added as first column — formula: `(currentPage - 1) * pageSize + index + 1`
- Page size `<Select>` with options 10/20/50 renders next to `<Pagination>` whenever `filtered.length > 0`
- Tests updated: 15 users, `pageSize=10`, assert User 9/10 visible, User 11 not visible on page 1

## Task Commits

- Task 1+2: ae2b9fb — fix(11-03): UsersPage phone normalization + STT column + dynamic page size

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Self-Check: PASSED

- `normalizePhone` defined and applied to both sides of phone comparison ✓
- STT column present with correct formula ✓
- `pageSize` is `useState(10)` ✓
- Page size Select with 10/20/50 options ✓
- All 15 UsersPage tests pass ✓
- TypeScript compiles cleanly ✓
