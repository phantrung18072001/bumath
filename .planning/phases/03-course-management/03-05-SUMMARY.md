---
phase: 03-course-management
plan: "05"
subsystem: admin-enrollment
tags: [enrollment, users, dialog, supabase, rls, react-query]
dependency_graph:
  requires: [03-01-rls, 03-02-courses-page, 02-auth-access-control]
  provides: [admin-enrollment-management]
  affects: []
tech_stack:
  added: []
  patterns: [Dialog-based enrollment management, TanStack Query per-user cache key, Supabase join query in select]
key_files:
  created:
    - src/lib/api/enrollments.ts
    - src/components/admin/UserEnrollmentDialog.tsx
  modified:
    - src/pages/admin/UsersPage.tsx
decisions:
  - "Enrollment dialog triggered only for approved users — pending/rejected have no courses yet"
  - "getUserEnrollments uses Supabase select with foreign key join (courses!enrollments_course_id_fkey) for single-query fetch"
  - "availableCourses computed client-side by diffing allCourses against enrolledCourseIds Set — no extra RPC needed"
  - "RLS from Plan 01 already adequate: admin_all_enrollments covers INSERT/DELETE; student_read_own_enrollments covers SELECT"
metrics:
  duration: 2min
  completed_date: "2026-03-24"
  tasks_completed: 4
  files_created: 2
  files_modified: 1
---

# Phase 03 Plan 05: Enrollment Management Summary

Admin enrollment management dialog on UsersPage — assign and remove courses per student with grade-badged UI matching the CoursesPage palette.

## What Was Built

**Task 1 — `src/lib/api/enrollments.ts`**

Three API functions:
- `getUserEnrollments(userId)` — joins the `courses` table via Supabase foreign key select to return `EnrollmentWithCourse[]` including `course.title` and `course.target_grade`
- `addEnrollment(userId, courseId)` — inserts into the `enrollments` table
- `removeEnrollment(enrollmentId)` — deletes by enrollment id

`EnrollmentWithCourse` interface defined for UI consumption without separate fetches.

**Tasks 2 + 3 — `UserEnrollmentDialog.tsx` and UsersPage integration**

`UserEnrollmentDialog` component:
- Shows a table of current enrollments with a ghost "Xoa" (Trash2 icon) button per row
- Shows a `<Select>` dropdown of courses the student is NOT yet enrolled in, populated by diffing all courses vs enrolled course ids
- Grade badges (`GradeBadge`) use the same `GRADE_BADGE` palette as `CoursesPage` (blue/green/purple/orange per grade)
- "Them" button adds the selected course; disabled when nothing selected or mutation pending
- Shows a message when student is enrolled in all available courses
- TanStack Query cache key: `['admin', 'enrollments', user.id]` for per-student isolation

`UsersPage.tsx` changes:
- Added `onManageEnrollments` prop to `UsersTable`
- Approved users now show a "Quan ly khoa hoc" button (BookOpen icon) in the actions column
- `UserEnrollmentDialog` rendered at page level, toggled via `enrollmentUser` state

**Task 4 — Permissions Matrix Verification**

Reviewed `20260324_course_management_rls.sql` from Plan 01:
- `admin_all_enrollments` policy: admin has `FOR ALL` on enrollments — covers `addEnrollment` (INSERT) and `removeEnrollment` (DELETE)
- `student_read_own_enrollments` policy: students can only SELECT their own rows — cannot self-enroll
- `fetchCourses()` called within admin ProtectedRoute context only — no student leakage
- No changes to SQL needed.

## Commits

| Task | Description | Hash |
|------|-------------|------|
| 1 | Enrollment API functions | 1f2e8f0 |
| 2+3 | UserEnrollmentDialog + UsersPage integration | c7bd1a8 |

## Deviations from Plan

**1. [Rule 2 - Missing feature] Merged Tasks 2 and 3 into one commit**
- The dialog component (Task 3) and its integration into UsersPage (Task 2) are tightly coupled with no meaningful intermediate state; committed together as one atomic unit.

**2. Task 4 — No code changes required**
- RLS policies from Plan 01 already correctly cover all enrollment operations. Verified by reading `20260324_course_management_rls.sql`. No SQL migrations or code changes needed.

## Known Stubs

None — all data flows from real Supabase queries. No hardcoded/placeholder values in UI.

## Self-Check: PASSED

- [x] src/lib/api/enrollments.ts — FOUND
- [x] src/components/admin/UserEnrollmentDialog.tsx — FOUND
- [x] src/pages/admin/UsersPage.tsx — MODIFIED
- [x] Commit 1f2e8f0 — FOUND
- [x] Commit c7bd1a8 — FOUND
- [x] TypeScript build passes (yarn tsc --noEmit)
- [x] Production build succeeds (yarn build)
