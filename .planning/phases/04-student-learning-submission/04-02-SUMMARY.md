---
phase: 04-student-learning-submission
plan: "02"
subsystem: student-layout-courses
tags: [ui, react, student, courses, progress, routing]
dependency_graph:
  requires:
    - lesson-progress-api (04-01)
    - grade-badge-constants (04-01)
    - enrollments-api (04-01)
  provides:
    - student-layout-shell
    - courses-listing-page
    - student-routes
  affects:
    - 04-03
    - 04-04
    - 04-05
tech_stack:
  added: []
  patterns:
    - TanStack Query with enabled guard (prevents empty-state flash before profile loads)
    - Progress computed at render time via getCourseProgress (never stored in DB)
    - Nested useQuery for chapters/lessons/progress aggregation
    - ProtectedRoute wrapping student routes with requiredRole="student"
key_files:
  created:
    - src/components/student/StudentLayout.tsx
    - src/pages/student/CoursesPage.tsx
    - src/pages/student/CourseDetailPage.tsx
  modified:
    - src/App.tsx
decisions:
  - "StudentLayout uses sticky 48px header with bg-card/border-b — meets UX-02 tap target requirement"
  - "CourseDetailPage created as placeholder stub for Plan 03 to replace"
  - "Progress query enabled only when enrollments.length > 0 — avoids unnecessary chapter/lesson fetches"
metrics:
  duration: "8min"
  completed_date: "2026-04-07"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 4 Plan 2: Student Layout and Courses Page Summary

One-liner: Student portal shell with compact 48px header and enrolled course grid showing per-course progress bars computed from lesson completion data.

## What Was Built

**Task 1: StudentLayout component and CoursesPage**

- `src/components/student/StudentLayout.tsx`:
  - Compact sticky header (h-12 = 48px) with BuMath logo, student full_name, and Đăng xuất button
  - Logout button has `min-h-[48px] min-w-[48px]` satisfying UX-02 tap target
  - No marketing nav links (D-04 separation from landing page)
  - Body wrapped in `<main className="min-h-[calc(100vh-48px)] bg-background">`

- `src/pages/student/CoursesPage.tsx`:
  - "Khóa học của tôi" heading (text-2xl font-semibold)
  - Enrollment query with `enabled: !!profile?.id` guard (prevents empty-state flash before profile loads)
  - Progress query chains fetchChapters → fetchLessons → getLessonProgress → getCourseProgress per course
  - Grid layout: `grid grid-cols-1 gap-6 sm:grid-cols-2` (1-col mobile, 2-col desktop, D-02)
  - Each card shows: course title, GRADE_BADGE, Progress bar with aria-label, "% hoàn thành" label
  - Loading state: 4 Skeleton cards (h-40 rounded-xl)
  - Empty state: centered card with "Chưa có khóa học nào" and Vietnamese body text (D-03)
  - Error state: Alert with "Không thể tải khóa học. Vui lòng làm mới trang."

**Task 2: Wire student routes into App.tsx**

- Added imports for `StudentCoursesPage` and `StudentCourseDetailPage`
- Created placeholder `src/pages/student/CourseDetailPage.tsx` for Plan 03
- Added two protected routes:
  - `/courses` → `ProtectedRoute(requiredRole="student")` → `StudentCoursesPage`
  - `/courses/:courseId` → `ProtectedRoute(requiredRole="student")` → `CourseDetailPage`
- ProtectedRoute already redirects pending/rejected users to /pending

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| prereq | b7e9eef | chore(04-02): incorporate Plan 01 API foundation into worktree |
| 1 | 0748e41 | feat(04-02): create StudentLayout and CoursesPage |
| 2 | fa6899a | feat(04-02): wire student routes into App.tsx |

## Deviations from Plan

**1. [Rule 3 - Blocking] Cherry-picked Plan 01 files into parallel worktree**
- **Found during:** Pre-task setup
- **Issue:** Parallel worktree branch didn't have Plan 01's lesson-progress.ts, grades.ts, or submissions.ts — committed on main but not in this worktree's branch
- **Fix:** Cherry-picked Plan 01 implementation commits (4bd581b, 9968eea) as a separate prerequisite commit
- **Files modified:** src/lib/api/lesson-progress.ts, src/lib/api/submissions.ts, src/lib/constants/grades.ts, supabase/migrations/04_student_learning.sql
- **Commit:** b7e9eef

## Known Stubs

- `src/pages/student/CourseDetailPage.tsx` — placeholder page showing "Trang chi tiết khóa học (đang phát triển)". Plan 03 will replace this with the full lesson detail implementation.

## Self-Check: PASSED

- [x] src/components/student/StudentLayout.tsx contains "signOut", "Đăng xuất", "min-h-[48px]", "bg-card border-b"
- [x] src/pages/student/CoursesPage.tsx contains "getUserEnrollments", "getCourseProgress", "GRADE_BADGE", "enabled: !!profile?.id", "Khóa học của tôi", "Chưa có khóa học nào", "grid grid-cols-1 gap-6 sm:grid-cols-2", Progress component, aria-label
- [x] src/App.tsx contains path="/courses", path="/courses/:courseId", requiredRole="student" (x2)
- [x] src/pages/student/CourseDetailPage.tsx exists as placeholder
- [x] yarn build succeeds
- [x] commits b7e9eef, 0748e41, fa6899a exist
