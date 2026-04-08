---
phase: 05-grading-notification
plan: 03
subsystem: student-ui, notifications
tags: [react, tanstack-query, bell-notification, grade-display, fire-and-forget]

# Dependency graph
requires:
  - phase: 05-01
    provides: getUnviewedGradeCount, markGradeViewed API functions and Submission interface with student_viewed_at
provides:
  - BellNotification component with red badge showing unviewed grade count, polled every 60s
  - StudentLayout header now includes BellNotification between profile name and logout button
  - SubmissionArea shows "Diem: X/10" with teacher comment for graded submissions
  - SubmissionArea auto-marks graded submissions as viewed via fire-and-forget RPC call
  - Bell badge decrements immediately after student views a graded submission (query invalidation)
affects:
  - Student experience — closes the feedback loop: teacher grades → student sees bell → student views result → bell clears

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useQuery with refetchInterval for polling-based badge count (60s interval, free-tier safe)
    - fire-and-forget useEffect with .catch(() => {}) for non-critical side-effect tracking
    - queryClient.invalidateQueries after side-effect for optimistic UI update on bell badge

key-files:
  created:
    - src/components/student/BellNotification.tsx
  modified:
    - src/components/student/StudentLayout.tsx
    - src/components/student/SubmissionArea.tsx
    - src/components/student/BellNotification.test.tsx
    - src/components/student/SubmissionArea.test.tsx

key-decisions:
  - "queryKey ['student', 'unviewed-grades'] namespaced to avoid collision with admin queries"
  - "refetchInterval 60_000 chosen over Realtime subscription — free-tier safe and sufficient for async grading workflow"
  - "fire-and-forget .catch(() => {}) ensures bell marking never blocks or errors the grade view UI"

patterns-established:
  - "Bell notification pattern: useQuery + refetchInterval for lightweight polling badges without Realtime overhead"

requirements-completed: [GRADE-04, GRADE-05]

# Metrics
duration: 4min
completed: 2026-04-08
---

# Phase 05 Plan 03: Student Bell Notification and Grade Result View Summary

**One-liner:** Bell badge with 60s polling for unviewed grade count plus inline "X/10" score and auto-viewed tracking on SubmissionArea.

## What Was Built

- `BellNotification.tsx`: New component rendering a bell icon with a red badge showing unviewed grade count. Uses `useQuery` with `queryKey: ['student', 'unviewed-grades']` polling every 60 seconds. Badge hidden when count is 0. Meets UX-02 with `min-h/w-[48px]` tap target and `aria-live="polite"` on the badge span.

- `StudentLayout.tsx`: Imported and placed `<BellNotification />` in the header between the profile name span and the logout button.

- `SubmissionArea.tsx`: Added `markGradeViewed` import, a fire-and-forget `useEffect` that triggers when `submission.status === 'graded' && !submission.student_viewed_at`, calling `markGradeViewed(submission.id)` and then invalidating `['student', 'unviewed-grades']` on success. Score display updated from `{submission.score}` to `{submission.score}/10` with `space-y-1` on the parent div.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test files using require() in Vitest ESM environment**
- **Found during:** Task 1 verification
- **Issue:** Both `BellNotification.test.tsx` and `SubmissionArea.test.tsx` used `require('./ComponentName').default` inside render helper functions (Wave 0 stub pattern). This pattern fails in Vitest's ESM mode — `require()` with relative paths does not resolve correctly when called inside a function body in ESM context.
- **Fix:** Converted both test files to use top-level ESM `import` statements. For `SubmissionArea.test.tsx`, the `uploadSubmission` mock that referenced `mockGradedSubmission` (causing hoisting issues) was fixed by inlining the mock data directly in the `vi.mock()` factory.
- **Files modified:** `src/components/student/BellNotification.test.tsx`, `src/components/student/SubmissionArea.test.tsx`
- **Commits:** 4f4ca60 (BellNotification), 3705203 (SubmissionArea)

## Self-Check: PASSED

**Files created/modified:**
- FOUND: src/components/student/BellNotification.tsx
- FOUND: src/components/student/StudentLayout.tsx (modified)
- FOUND: src/components/student/SubmissionArea.tsx (modified)

**Commits verified:**
- FOUND: 4f4ca60 feat(05-03): add BellNotification component and wire into StudentLayout header
- FOUND: 3705203 feat(05-03): extend SubmissionArea with score/10 display and markGradeViewed
