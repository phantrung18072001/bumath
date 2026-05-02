---
plan: 12-00b
phase: 12-admin-detail-pages
status: complete
completed: 2026-05-02
---

## Summary

Created test scaffolds for ChaptersPage and LessonsPage drag-and-drop validation. Updated existing admin page tests to mock server-side API functions.

## What Was Built

- **ChaptersPage.test.tsx** — New test file with skeleton loading and drag handle (aria-label="Kéo để sắp xếp") tests (RED state until Plan 12-01)
- **LessonsPage.test.tsx** — New test file with skeleton loading and drag handle tests (RED state until Plan 12-01)
- **SubmissionsPage.test.tsx** — Updated to mock `getAllSubmissions` alongside `getUngraded`; added status filter and loading skeleton test cases (RED state until Plan 12-02)
- **UsersPage.test.tsx** — Added `fetchProfilesPaginated` mock returning `{ data, total }` structure
- **CoursesPage.test.tsx** — Added `fetchCoursesPaginated` mock returning `{ data, total }` structure

## Key Files

- `src/pages/admin/ChaptersPage.test.tsx` — Created
- `src/pages/admin/LessonsPage.test.tsx` — Created
- `src/pages/admin/SubmissionsPage.test.tsx` — Updated (getAllSubmissions mock + new tests)
- `src/pages/admin/UsersPage.test.tsx` — Updated (fetchProfilesPaginated mock)
- `src/pages/admin/CoursesPage.test.tsx` — Updated (fetchCoursesPaginated mock)

## Self-Check: PASSED

All must_have truths verified:
- Test scaffolds exist for ChaptersPage and LessonsPage ✓
- SubmissionsPage test mocks getAllSubmissions ✓
- UsersPage test mocks fetchProfilesPaginated ✓
- CoursesPage test mocks fetchCoursesPaginated ✓
