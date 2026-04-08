---
phase: 05-grading-notification
plan: "00"
subsystem: testing
tags: [vitest, react-testing-library, test-stubs, wave-0]

requires:
  - phase: 04-student-learning-submission
    provides: SubmissionArea component and submissions API pattern used as stub reference

provides:
  - Wave 0 test stub files for all Phase 5 components (SubmissionsPage, GradingDialog, BellNotification, SubmissionArea)
  - vi.mock hoisting pattern for @/lib/api/submissions module
  - QueryClientProvider wrapper helpers for each component under test

affects: [05-grading-notification plans 01, 02, 03]

tech-stack:
  added: []
  patterns:
    - "Wave 0 test stubs: require() lazy import so component does not need to exist at module load time"
    - "vi.mock factories are synchronous and hoisted — no dynamic imports inside mock factory"

key-files:
  created:
    - src/pages/admin/SubmissionsPage.test.tsx
    - src/components/admin/GradingDialog.test.tsx
    - src/components/student/BellNotification.test.tsx
    - src/components/student/SubmissionArea.test.tsx
  modified: []

key-decisions:
  - "require() lazy import in renderXxx helpers — component module does not need to exist when test file loads; stubs fail at runtime once components are missing, not at import time"
  - "vi.mock factories only use vi.fn() — no references to outer-scope variables inside factory (hoisting constraint)"

patterns-established:
  - "Wave 0 stub pattern: vi.mock + require() lazy render helper + waitFor assertions aligned to requirement IDs"

requirements-completed:
  - GRADE-01
  - GRADE-02
  - GRADE-03
  - GRADE-04
  - GRADE-05

duration: 4min
completed: "2026-04-08"
---

# Phase 5 Plan 00: Wave 0 Test Stubs Summary

**4 test stub files created covering GRADE-01 through GRADE-05 using vi.mock hoisting and require() lazy import pattern**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-08T02:24:00Z
- **Completed:** 2026-04-08T02:28:29Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `SubmissionsPage.test.tsx` with 3 GRADE-01 stubs (heading, empty state, row render with student name/course)
- Created `GradingDialog.test.tsx` with 3 GRADE-02/GRADE-03 stubs (student name in title, score input attributes, save button disabled)
- Created `BellNotification.test.tsx` with 3 GRADE-04 stubs (bell icon, badge hidden at 0, badge shows count)
- Created `SubmissionArea.test.tsx` with 4 GRADE-05 stubs (score display, comment display, markGradeViewed called/not-called)

## Task Commits

1. **Task 1: Create test stubs for SubmissionsPage and GradingDialog** - `8c79af7` (test)
2. **Task 2: Create test stubs for BellNotification and SubmissionArea** - `02a0d19` (test)

## Files Created/Modified

- `src/pages/admin/SubmissionsPage.test.tsx` - Wave 0 stubs for GRADE-01 (admin submissions list page)
- `src/components/admin/GradingDialog.test.tsx` - Wave 0 stubs for GRADE-02/GRADE-03 (grading dialog with score input)
- `src/components/student/BellNotification.test.tsx` - Wave 0 stubs for GRADE-04 (bell icon with unviewed count badge)
- `src/components/student/SubmissionArea.test.tsx` - Wave 0 stubs for GRADE-05 (grade display + markGradeViewed integration)

## Decisions Made

- Used `require()` lazy import in render helpers instead of direct ES imports — this allows test files to exist and be valid before the actual components are created. Plans 01-03 can reference these stubs as their `yarn test` targets immediately.
- All vi.mock factories use only inline `vi.fn()` calls (no outer-scope variable references) to comply with Vitest hoisting constraints.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 4 test stub files are ready as verification targets for Plans 01-03
- Plans 01 (API layer), 02 (admin UI), 03 (student notification) can run `yarn test src/[file].test.tsx` against these stubs
- Tests will fail until implementations are created — that is expected Wave 0 behavior

---
*Phase: 05-grading-notification*
*Completed: 2026-04-08*
