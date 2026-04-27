---
phase: 06-ux-polish
plan: 02
subsystem: admin-grading
tags: [filter, ux, submissions, grading-queue]
dependency_graph:
  requires: [06-00]
  provides: [admin-filter-ui]
  affects: [src/pages/admin/SubmissionsPage.tsx, src/lib/api/submissions.ts]
tech_stack:
  added: []
  patterns: [client-side-filter, shadcn-select, useState-derived-data]
key_files:
  created: []
  modified:
    - src/lib/api/submissions.ts
    - src/pages/admin/SubmissionsPage.tsx
    - src/pages/admin/SubmissionsPage.test.tsx
decisions:
  - "Used 'all' sentinel value for Select default option — Radix UI SelectItem forbids empty string values"
  - "Client-side filtering with derived filteredData — no additional API calls needed"
  - "Filter state initialized to 'all' (not '') for Select compatibility"
metrics:
  duration: "8min"
  completed: "2026-04-27T15:07:20Z"
  tasks: 3
  files: 3
---

# Phase 06 Plan 02: Admin Grading Queue Filter UI Summary

**One-liner:** Client-side filter bar for admin grading queue with 4 controls (grade, course, lesson, student name) using shadcn Select/Input components and derived filteredData state.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend UngradedSubmission type and getUngraded query | 1591cec | src/lib/api/submissions.ts |
| 2 | Add filter UI to SubmissionsPage | bf46283 | src/pages/admin/SubmissionsPage.tsx |
| 3 | Verify SubmissionsPage filter tests pass | c1e11a6 | SubmissionsPage.tsx, SubmissionsPage.test.tsx |

## What Was Built

### UngradedSubmission Type Extension
- Extended `UngradedSubmission` interface with `target_grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'` on the nested `courses` object
- Updated `getUngraded()` Supabase query to include `target_grade` in the courses select

### Filter Bar UI
- Added 4 filter controls to `SubmissionsPage`:
  1. **Grade Select** — options from `uniqueGrades` using `GRADE_BADGE` labels (Lớp 7/8/9/Ôn chuyên)
  2. **Course Select** — options from `uniqueCourses` (unique course titles in queue)
  3. **Lesson Select** — options from `uniqueLessons` (unique lesson titles in queue)
  4. **Student Input** — case-insensitive partial match on student full name
- Filter bar only renders when `!isLoading && data.length > 0`
- Result count: "Hiển thị X / Y bài nộp"
- Empty filter state: "Không tìm thấy bài nộp nào phù hợp với bộ lọc."
- Table uses `filteredData.map()` instead of `data.map()`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Radix UI SelectItem forbids empty string values**
- **Found during:** Task 3 (test run)
- **Issue:** Plan specified `<SelectItem value="">Tất cả lớp</SelectItem>` but Radix UI throws "A `<Select.Item />` must have a value prop that is not an empty string"
- **Fix:** Changed initial filter state from `''` to `'all'` sentinel; SelectItem uses `value="all"`; filter logic checks `filterGrade === 'all'` instead of `!filterGrade`
- **Files modified:** src/pages/admin/SubmissionsPage.tsx
- **Commit:** c1e11a6

**2. [Rule 1 - Bug] Test render helper missing BrowserRouter**
- **Found during:** Task 3 (test run)
- **Issue:** `renderSubmissionsPage()` only wrapped in `QueryClientProvider`; `useNavigate()` in SubmissionsPage requires Router context
- **Fix:** Added `<BrowserRouter>` wrapper around `<QueryClientProvider>` in test helper
- **Files modified:** src/pages/admin/SubmissionsPage.test.tsx
- **Commit:** c1e11a6

**3. [Rule 1 - Bug] Test not awaiting filter bar before interaction**
- **Found during:** Task 3 (test run)
- **Issue:** `shows filter empty message` test used `screen.getByPlaceholderText()` synchronously before async query resolved
- **Fix:** Changed to `await screen.findByPlaceholderText('Tìm học sinh...')` (async find)
- **Files modified:** src/pages/admin/SubmissionsPage.test.tsx
- **Commit:** c1e11a6

## Test Results

All 7 tests pass:
- ✓ renders the page heading
- ✓ shows empty state when no ungraded submissions
- ✓ renders submission rows with student name and course title
- ✓ shows filter bar when submissions exist
- ✓ shows result count
- ✓ filters by student name
- ✓ shows filter empty message when no results match

## Known Stubs

None — all filter functionality is fully wired to data.

## Self-Check: PASSED

- [x] src/lib/api/submissions.ts modified (target_grade in interface and query)
- [x] src/pages/admin/SubmissionsPage.tsx modified (filter UI implemented)
- [x] src/pages/admin/SubmissionsPage.test.tsx updated (all 7 tests pass)
- [x] Commits: 1591cec, bf46283, c1e11a6
- [x] Build passes (yarn build:dev exits 0)
