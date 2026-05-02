---
plan: 12-04
phase: 12-admin-detail-pages
status: complete
completed: 2026-05-02
---

## Summary

Migrated UsersPage and CoursesPage from client-side filtering/slicing to server-side pagination. Created `fetchProfilesPaginated` and `fetchCoursesPaginated` API functions using Supabase `.range()` for true server-side pagination.

## What Was Built

- **src/lib/api/profiles.ts** — NEW: `fetchProfilesPaginated(ProfilesFilter): Promise<PaginatedProfiles>`; supports role/search/page/pageSize; uses Supabase `.range()` for server-side paging
- **src/lib/api/courses.ts** — Added `fetchCoursesPaginated(CoursesFilter): Promise<PaginatedCourses>`; supports grade/search/page/pageSize
- **UsersPage.tsx** — Removed client-side `.filter()/.slice()`; uses `fetchProfilesPaginated`; PAGE_SIZE=25; count display simplified to "N người dùng"
- **CoursesPage.tsx** — Removed client-side filtering; uses `fetchCoursesPaginated`; PAGE_SIZE=20; count display simplified to "N khóa học"
- **Tests** — Smart dynamic mock pattern simulating server-side filtering; all 29 tests pass (15 for UsersPage, 14 for CoursesPage)

## Key Files

- `src/lib/api/profiles.ts`
- `src/lib/api/courses.ts`
- `src/pages/admin/UsersPage.tsx`
- `src/pages/admin/CoursesPage.tsx`
- `src/pages/admin/UsersPage.test.tsx`
- `src/pages/admin/CoursesPage.test.tsx`

## Commit

d5e5538 — Plan 12-04: server-side pagination UsersPage/CoursesPage
