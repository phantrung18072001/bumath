---
phase: 06-ux-polish
plan: "04"
subsystem: student-catalogue
tags: [ui, catalogue, enrollment-status, student, courses]
dependency_graph:
  requires: [06-00, 06-01, 06-03]
  provides: [CataloguePage, CoursesPage-catalogue-link]
  affects: [student-course-discovery]
tech_stack:
  added: []
  patterns: [TanStack Query dual-query, enrollment badge overlay, stub-to-implementation replacement]
key_files:
  created: []
  modified:
    - src/pages/student/CataloguePage.tsx
    - src/pages/student/CataloguePage.test.tsx
    - src/pages/student/CoursesPage.tsx
decisions:
  - "Replaced placeholder stub (created in Plan 03 Wave 0) with full CataloguePage implementation — two-query pattern: fetchAllCourses + getUserEnrollments"
  - "Fixed test mock leak: empty state test now explicitly resets fetchAllCourses mock to [] since vi.clearAllMocks() does not reset implementations"
metrics:
  duration: "5min"
  completed_date: "2026-04-27"
  tasks: 2
  files: 3
---

# Phase 06 Plan 04: Student Course Catalogue UI Summary

## One-liner

CataloguePage with enrollment-status badges (Đã/Chưa đăng ký) via dual TanStack Query + CoursesPage empty state catalogue link

## What Was Built

### Task 1: CataloguePage component

Replaced the Wave 0 placeholder stub (`<div />`) with the full implementation:

- **Page heading:** `Khám phá khóa học` with subheading `Tất cả các khóa học đang có tại BuMath`
- **Dual query:** `fetchAllCourses` + `getUserEnrollments` run in parallel; enrollment badge computed from intersection
- **Enrolled badge:** green `Đã đăng ký` for courses in user's enrollment set
- **Non-enrolled badge:** outline `Chưa đăng ký` for courses not yet enrolled
- **Grade badge:** `GRADE_BADGE` constant (Lớp 7/8/9/Ôn chuyên)
- **Card links:** each course card is a `<Link to="/courses/:slug">` — CourseDetailPage handles preview vs full mode
- **Loading:** 4 skeleton cards while queries are in-flight
- **Error:** Alert variant="destructive" if `coursesError`
- **Empty:** card "Chưa có khóa học nào" when `allCourses.length === 0`

### Task 2: CoursesPage empty state catalogue link

Added `<Link to="/catalogue">Khám phá tất cả khóa học →</Link>` inside the empty state card with `text-primary underline mt-4 block` classes. Improves discoverability when students haven't been enrolled in any courses yet.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1    | 348b559 | feat(06-04): implement CataloguePage with course grid and enrollment badges |
| 2    | fe55cde | feat(06-04): add catalogue link to CoursesPage empty state |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test mock leak in CataloguePage.test.tsx**
- **Found during:** Task 1 verification
- **Issue:** The "shows empty state when no courses exist" test relied on `vi.clearAllMocks()` resetting `mockResolvedValue` — but `clearAllMocks()` only resets usage info (calls/results), NOT mock implementations. A prior test set `fetchAllCourses.mockResolvedValue(mockCourses)`, which persisted into the empty state test, causing it to render a course grid instead of the empty state.
- **Fix:** Added explicit `(fetchAllCourses as ReturnType<typeof vi.fn>).mockResolvedValue([])` at the start of the empty state test.
- **Files modified:** `src/pages/student/CataloguePage.test.tsx`
- **Commit:** 348b559

## Test Results

- **CataloguePage tests:** 6/6 passed
- **Full suite:** 74/80 passed (6 pre-existing failures in BellNotification.test.tsx and CourseDetailPage.test.tsx — unrelated to this plan, confirmed by reverting and re-running)
- **Build:** `yarn build:dev` ✓ built in 3.77s

## Known Stubs

None — all content is live-data wired.

## Self-Check: PASSED

- `src/pages/student/CataloguePage.tsx` — ✓ exists, contains `Khám phá khóa học`, `Đã đăng ký`, `Chưa đăng ký`
- `src/pages/student/CoursesPage.tsx` — ✓ contains `to="/catalogue"`, `Khám phá tất cả khóa học →`
- Commit 348b559 — ✓ exists
- Commit fe55cde — ✓ exists
