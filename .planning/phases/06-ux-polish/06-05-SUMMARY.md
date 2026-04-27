---
phase: 06-ux-polish
plan: "05"
subsystem: student-learning
tags:
  - preview-mode
  - enrollment
  - course-detail
  - rls-migration
dependency_graph:
  requires:
    - 06-00  # RLS migration allowing all approved users to read courses
    - 06-04  # CataloguePage (students can navigate to any course URL)
  provides:
    - preview-mode-non-enrolled
  affects:
    - src/pages/student/CourseDetailPage.tsx
tech_stack:
  added: []
  patterns:
    - enrollment-check via getUserEnrollments + isEnrolled derived state
    - conditional rendering (enrolled vs preview mode)
    - enrollmentsLoading in composite isLoading to prevent mode flash
key_files:
  created: []
  modified:
    - src/pages/student/CourseDetailPage.tsx
decisions:
  - "Include enrollmentsLoading in composite isLoading to prevent brief full→preview or preview→full flash"
  - "Preview mode uses Lock icons with aria-hidden=true (decorative, no screen reader verbosity)"
  - "Contact CTA is static text only (no email link) — enrollment is managed manually by teacher"
metrics:
  duration: "~8min"
  completed: "2026-04-27T15:27:24Z"
  tasks_completed: 2
  files_modified: 1
---

# Phase 06 Plan 05: Course Preview Mode for Non-Enrolled Students Summary

## One-liner

CourseDetailPage now detects enrollment status via getUserEnrollments query and renders a locked preview (chapter/lesson list with Lock icons, contact CTA) for non-enrolled students, while enrolled students see the unchanged full sidebar+video layout.

## What Was Built

Modified `src/pages/student/CourseDetailPage.tsx` to add enrollment detection and conditional rendering:

### Task 1: Enrollment Query
- Imported `getUserEnrollments` from `@/lib/api/enrollments`
- Added `useQuery` with `queryKey: ['enrollments', profile?.id]` and `enabled: !!profile?.id`
- Derived `isEnrolled = !!enrollments?.some(e => e.course_id === courseId)`
- Added `enrollmentsLoading` to composite `isLoading` — prevents mode flash during load

### Task 2: Preview Mode UI
- Imported `Lock` from `lucide-react`, `Badge` from `@/components/ui/badge`, `GRADE_BADGE` from `@/lib/constants/grades`
- Wrapped main content block with `isEnrolled ?` conditional:
  - **Full mode** (enrolled): unchanged desktop and mobile layouts (sidebar + LessonContent + Tabs)
  - **Preview mode** (not enrolled):
    - Course title + grade badge header
    - Lock notice banner: "Bạn chưa đăng ký khóa học này."
    - Chapter list with lesson titles, each prefixed with `Lock` icon (`aria-hidden="true"`)
    - Contact CTA: "Vui lòng liên hệ giảng viên để được đăng ký khóa học này."
    - No video player, no submission area, no progress tracking

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `99a1ffd` | feat(06-05): add enrollment query and isEnrolled check to CourseDetailPage |
| 2 | `c82c0dd` | feat(06-05): add preview mode UI for non-enrolled students in CourseDetailPage |

## Test Results

- `CourseDetailPage.test.tsx`: **4/4 passed**
  - ✓ shows lock notice "Bạn chưa đăng ký khóa học này." when not enrolled
  - ✓ shows contact CTA when not enrolled
  - ✓ shows Lock icons (aria-hidden="true") next to lesson titles
  - ✓ does NOT show preview mode when user is enrolled
- Build: `yarn build:dev` ✓ (warnings are pre-existing, unrelated to this plan)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data is live from `getUserEnrollments` API query.

## Deferred Issues

Pre-existing test failure in `src/components/student/BellNotification.test.tsx` (3 tests failing on `getGradedUnviewed` mock export) — not caused by this plan, tracked for separate fix.

## Self-Check: PASSED
