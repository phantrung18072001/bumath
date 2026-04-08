---
phase: 05-grading-notification
plan: 01
subsystem: database, api
tags: [supabase, postgresql, rpc, security-definer, rls, typescript]

# Dependency graph
requires:
  - phase: 04-student-learning-submission
    provides: submissions table with status/score/comment fields and storage bucket
provides:
  - student_viewed_at column on submissions table for bell notification tracking
  - mark_submission_viewed SECURITY DEFINER RPC for safe student-side update
  - getUngraded() API function returning teacher grading queue with joined student/lesson/course names
  - gradeSubmission() API function to set score, comment, status=graded
  - getUnviewedGradeCount() API function for bell badge count
  - markGradeViewed() API function calling the RPC
affects:
  - 05-02 (teacher grading queue UI depends on getUngraded, gradeSubmission)
  - 05-03 (student bell notification depends on getUnviewedGradeCount, markGradeViewed)
  - 05-04 (grade result view depends on Submission.student_viewed_at field)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SECURITY DEFINER RPC for restricted student-side updates (avoids blanket UPDATE policy)
    - PostgREST foreign key traversal for 3-level nested joins (submissions->lessons->chapters->courses)
    - count: exact + head: true for efficient COUNT queries without data transfer

key-files:
  created:
    - supabase/migrations/20260407_07_student_viewed_at.sql
  modified:
    - src/lib/api/submissions.ts

key-decisions:
  - "SECURITY DEFINER RPC for student_viewed_at update — prevents students from using blanket UPDATE policy that could modify score/comment fields"
  - "mark_submission_viewed RPC enforces user_id=auth.uid(), status=graded, student_viewed_at IS NULL — safe against abuse"

patterns-established:
  - "SECURITY DEFINER RPC pattern: use when students need to update exactly one field on a table they cannot fully UPDATE"

requirements-completed: [GRADE-01, GRADE-02, GRADE-03, GRADE-04, GRADE-05]

# Metrics
duration: 5min
completed: 2026-04-08
---

# Phase 5 Plan 01: Grading & Notification Data Layer Summary

**Supabase migration adding student_viewed_at column with SECURITY DEFINER RPC, plus 4 new API functions (getUngraded, gradeSubmission, getUnviewedGradeCount, markGradeViewed) in submissions.ts**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-08T02:27:21Z
- **Completed:** 2026-04-08T02:32:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created migration adding `student_viewed_at timestamptz` column to submissions table for bell notification tracking
- Created `mark_submission_viewed` SECURITY DEFINER RPC that restricts students to updating only student_viewed_at (not score/comment)
- Extended `submissions.ts` with updated Submission interface, UngradedSubmission interface, and 4 new exported functions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration for student_viewed_at column and mark_submission_viewed RPC** - `aa031eb` (feat)
2. **Task 2: Extend submissions.ts with Submission type update and 4 new API functions** - `02a0d19` (feat)

## Files Created/Modified

- `supabase/migrations/20260407_07_student_viewed_at.sql` - Migration adding student_viewed_at column and mark_submission_viewed SECURITY DEFINER RPC
- `src/lib/api/submissions.ts` - Extended with student_viewed_at field in Submission, new UngradedSubmission interface, getUngraded, gradeSubmission, getUnviewedGradeCount, markGradeViewed

## Decisions Made

- SECURITY DEFINER RPC chosen for student_viewed_at update to prevent students from having a blanket UPDATE policy that could expose score/comment fields to manipulation (Pitfall 4 from RESEARCH.md)
- RPC triple-checks: `user_id = auth.uid()` AND `status = 'graded'` AND `student_viewed_at IS NULL` — prevents both unauthorized access and double-marking

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `yarn build` initially failed with lockfile mismatch (unrelated to this plan's changes — parallel agents added packages). Ran `yarn install` to update lockfile, then build passed cleanly.

## User Setup Required

None - no external service configuration required.

The migration must be applied to the Supabase instance via `supabase db push` or through the Supabase dashboard SQL editor.

## Next Phase Readiness

- All data contracts for Phase 5 grading and notification are established
- 05-02 (teacher grading queue UI) can use `getUngraded()` and `gradeSubmission()`
- 05-03 (student bell notification) can use `getUnviewedGradeCount()` and `markGradeViewed()`
- 05-04 (grade result view) can use `Submission.student_viewed_at` field
- Build passes with no TypeScript errors

---
*Phase: 05-grading-notification*
*Completed: 2026-04-08*
