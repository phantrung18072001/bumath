---
phase: 05-grading-notification
plan: 02
subsystem: admin-ui
tags: [react, shadcn-ui, tanstack-query, radix-dialog, vitest, teacher-grading]

# Dependency graph
requires:
  - phase: 05-grading-notification
    plan: 01
    provides: getUngraded, gradeSubmission, getSubmissionSignedUrl API functions
provides:
  - Teacher grading queue page at /admin/submissions
  - GradingDialog modal for viewing photo, entering score (0-10) and comment
  - Route /admin/submissions protected by admin ProtectedRoute
  - Navigation link from CoursesPage to grading queue
affects:
  - CoursesPage (nav link added to header)
  - App.tsx (new route registered)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - shadcn Dialog with Radix portal for grading overlay
    - TanStack Query useQuery + useQueryClient.invalidateQueries for optimistic queue removal
    - Cancellation pattern in useEffect for signed URL loading (cancelled flag)
    - Dynamic import() in tests instead of require() for ESM vitest compatibility

key-files:
  created:
    - src/pages/admin/SubmissionsPage.tsx
    - src/components/admin/GradingDialog.tsx
  modified:
    - src/App.tsx
    - src/pages/admin/CoursesPage.tsx
    - src/pages/admin/SubmissionsPage.test.tsx
    - src/components/admin/GradingDialog.test.tsx

key-decisions:
  - "Dynamic import() replaces require() in vitest ESM test stubs — CJS require() fails in Vitest ESM mode"
  - "Cancellation flag in useEffect for getSubmissionSignedUrl — prevents state updates after dialog unmount, avoids act() warnings"
  - "sr-only <label htmlFor> for score input — avoids getByLabelText conflict with button aria-label in tests"
  - "GradingDialog test regex fixed: [đĐDd] instead of [Dd] — Vietnamese đ (U+0111) not in ASCII [Dd]"

patterns-established:
  - "Wave 0 test stubs must use dynamic import() not require() in ESM vitest environment"
  - "useEffect cancellation pattern for async side-effects in dialogs (cancelled flag)"

requirements-completed: [GRADE-01, GRADE-02, GRADE-03]

# Metrics
duration: 11min
completed: 2026-04-08
---

# Phase 5 Plan 02: Teacher Grading Queue UI Summary

**SubmissionsPage (flat table with TanStack Query) and GradingDialog (Radix Dialog with signed-URL photo, score 0-10, comment textarea) wired at /admin/submissions with ProtectedRoute; CoursesPage nav link added**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-08T09:30:52Z
- **Completed:** 2026-04-08T09:41:52Z
- **Tasks:** 3
- **Files created:** 2
- **Files modified:** 4

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create SubmissionsPage | 2ef060e | src/pages/admin/SubmissionsPage.tsx, test |
| 2 | Create GradingDialog | 39fe6c1 | src/components/admin/GradingDialog.tsx, test |
| 3 | Wire route + CoursesPage nav | b8c4bd0 | src/App.tsx, src/pages/admin/CoursesPage.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test stubs: require() -> dynamic import()**
- **Found during:** Task 1 verification
- **Issue:** Wave 0 test stubs used `require('./SubmissionsPage').default` inside functions. In Vitest ESM mode (v3), CJS `require()` is not available — "Cannot find module" error even when file exists.
- **Fix:** Changed all `require()` calls to `const { default: Comp } = await import('./Comp')` and made helper functions `async`. Added `await` before all render calls in tests.
- **Files modified:** src/pages/admin/SubmissionsPage.test.tsx, src/components/admin/GradingDialog.test.tsx
- **Commit:** 2ef060e, 39fe6c1

**2. [Rule 1 - Bug] Fixed GradingDialog test regex for Vietnamese đ character**
- **Found during:** Task 2 verification
- **Issue:** Test regex `/[Ll][uư]u [Dd]i[eể]m/` cannot match "Lưu điểm" because Vietnamese `đ` (U+0111) is not ASCII `d` (U+0064). Character class `[Dd]` only contains ASCII D and d.
- **Fix:** Updated test regex to `[đĐDd]` to include the Vietnamese d-with-stroke characters.
- **Files modified:** src/components/admin/GradingDialog.test.tsx
- **Commit:** 39fe6c1

**3. [Rule 2 - Missing Critical] Added cancellation flag in GradingDialog useEffect**
- **Found during:** Task 2 implementation
- **Issue:** Without cancellation, `getSubmissionSignedUrl` promise resolves after component unmounts, causing React act() warnings and interfering with subsequent tests.
- **Fix:** Added `let cancelled = false` + cleanup `return () => { cancelled = true }` in useEffect. State setters only called when `!cancelled`.
- **Files modified:** src/components/admin/GradingDialog.tsx
- **Commit:** 39fe6c1

**4. [Rule 1 - Bug] Score input uses sr-only <label> instead of aria-label to avoid getByLabelText conflict**
- **Found during:** Task 2 verification
- **Issue:** Using `aria-label="diem so"` on input AND `aria-label="Lưu diem"` on button caused `getByLabelText(/[Dd]i[eể]m/)` to find BOTH elements (RTL matches any element by aria-label).
- **Fix:** Used `<label htmlFor="grading-score" className="sr-only">diem so</label>` associated with input. RTL `getByLabelText` with htmlFor only associates with form controls, not buttons.
- **Files modified:** src/components/admin/GradingDialog.tsx
- **Commit:** 39fe6c1

## Known Stubs

None. All data flows from `getUngraded()` and `gradeSubmission()` API functions implemented in Plan 01.

## Self-Check: PASSED

- FOUND: src/pages/admin/SubmissionsPage.tsx
- FOUND: src/components/admin/GradingDialog.tsx
- FOUND: commit 2ef060e (SubmissionsPage)
- FOUND: commit 39fe6c1 (GradingDialog)
- FOUND: commit b8c4bd0 (route + nav link)
- Build: PASSED (yarn build)
- Tests: 6/6 PASSED (SubmissionsPage.test.tsx + GradingDialog.test.tsx)
