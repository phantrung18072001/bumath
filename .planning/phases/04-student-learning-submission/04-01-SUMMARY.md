---
phase: 04-student-learning-submission
plan: "01"
subsystem: api-foundation
tags: [api, supabase, sql, image-compression, constants]
dependency_graph:
  requires: []
  provides:
    - lesson-progress-api
    - submissions-api
    - grade-badge-constants
    - db-migration-04
  affects:
    - 04-02
    - 04-03
    - 04-04
    - 04-05
tech_stack:
  added:
    - browser-image-compression@2.0.2
    - heic2any@0.0.4
  patterns:
    - supabase typed query pattern (insert/select/single, throw on error)
    - dynamic import for heic2any (avoid bundle cost unless needed)
    - pure function getCourseProgress (computed at render, never stored)
key_files:
  created:
    - supabase/migrations/04_student_learning.sql
    - src/lib/api/lesson-progress.ts
    - src/lib/api/submissions.ts
    - src/lib/constants/grades.ts
  modified:
    - package.json
    - yarn.lock
    - src/pages/admin/CoursesPage.tsx
decisions:
  - "browser-image-compression chosen (D-16/D-17 research confirmed) with heic2any dynamic import for HEIC fallback"
  - "getCourseProgress is a pure function — progress never stored in DB, always computed"
  - "Signed URL TTL 3600s (1 hour) — balances security and UX for viewing submissions"
  - "Unique constraint on (user_id, lesson_id) in both tables — one completion/submission per lesson per student"
metrics:
  duration: "2min"
  completed_date: "2026-04-07"
  tasks_completed: 2
  files_created: 4
  files_modified: 3
---

# Phase 4 Plan 1: Dependencies, DB Migration, and API Foundation Summary

One-liner: Data foundation for student learning — SQL schema with RLS policies, typed API modules for lesson progress and image submissions, with HEIC-aware client-side compression.

## What Was Built

**Task 1: Dependencies, SQL migration, grade constants**

- Installed `browser-image-compression@2.0.2` and `heic2any@0.0.4` via yarn
- Created `supabase/migrations/04_student_learning.sql` with:
  - `lesson_progress` table: uuid PK, user_id/lesson_id FK, unique(user_id, lesson_id), RLS for students + admin/teacher
  - `submissions` table: uuid PK, file_path, status (submitted/graded), score, comment, unique(user_id, lesson_id), RLS for students + admin/teacher
  - `submissions` storage bucket (private) with per-user folder RLS
- Created `src/lib/constants/grades.ts` exporting `GRADE_BADGE` shared constant
- Updated `src/pages/admin/CoursesPage.tsx` to import `GRADE_BADGE` from shared module (removed local declaration)

**Task 2: API modules**

- `src/lib/api/lesson-progress.ts`: `markLessonComplete`, `getLessonProgress`, `getCourseProgress`
- `src/lib/api/submissions.ts`: `compressImage`, `uploadSubmission`, `getSubmission`, `getSubmissions`, `getSubmissionSignedUrl`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 4bd581b | feat(04-01): install deps, add DB migration, extract grade constants |
| 2 | 9968eea | feat(04-01): add lesson-progress and submissions API modules |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - this plan creates foundational API functions; no UI stubs introduced.

## Self-Check: PASSED

- [x] supabase/migrations/04_student_learning.sql exists
- [x] src/lib/api/lesson-progress.ts exports markLessonComplete, getLessonProgress, getCourseProgress
- [x] src/lib/api/submissions.ts exports compressImage, uploadSubmission, getSubmission, getSubmissions, getSubmissionSignedUrl
- [x] src/lib/constants/grades.ts exports GRADE_BADGE
- [x] src/pages/admin/CoursesPage.tsx imports GRADE_BADGE from shared constants (no local declaration)
- [x] yarn build passes with no errors
- [x] commits 4bd581b and 9968eea exist
