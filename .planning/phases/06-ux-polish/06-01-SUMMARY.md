---
phase: "06-ux-polish"
plan: "01"
subsystem: "student-ux"
tags: ["ux", "navigation", "404", "progress-bar", "vietnamese"]
dependency_graph:
  requires: ["06-00"]
  provides: ["vietnamese-404", "student-nav-links", "progress-bar-color-fix"]
  affects: ["src/pages/NotFound.tsx", "src/components/student/StudentLayout.tsx", "src/pages/student/CoursesPage.tsx", "src/components/student/LessonSidebar.tsx"]
tech_stack:
  added: []
  patterns: ["role-aware-redirect", "NavLink-active-styling", "className-override-for-shadcn"]
key_files:
  created:
    - src/pages/NotFound.test.tsx
  modified:
    - src/pages/NotFound.tsx
    - src/components/student/StudentLayout.tsx
    - src/pages/student/CoursesPage.tsx
    - src/components/student/LessonSidebar.tsx
decisions:
  - "bg-muted className override on Progress (not modifying progress.tsx per CLAUDE.md constraint)"
  - "Role-aware redirect: profile?.role === 'student' → /courses, otherwise → /"
  - "NavLink with isActive callback for active route highlighting"
metrics:
  duration: "5 minutes"
  completed_date: "2026-04-27"
  tasks_completed: 3
  files_changed: 5
---

# Phase 06 Plan 01: UX Polish — 404 Page, Navigation, Progress Bar Summary

## One-liner

Vietnamese 404 page with role-aware student redirect, StudentLayout logo/nav links, and neutral-gray progress bar track.

## What Was Built

### Task 1: NotFound.tsx — Vietnamese copy + role-aware link (8524541)
- Replaced English "Oops! Page not found" with Vietnamese "Trang không tìm thấy"
- Replaced English "Return to Home" with Vietnamese "Về trang chủ"
- Added `useAuth` import for profile role detection
- Students (`profile?.role === 'student'`) are redirected to `/courses`; all others go to `/`
- Replaced `<a href="/">` with `<Link to={homeLink}>` (React Router, no page reload)
- Created `src/pages/NotFound.test.tsx` with 5 passing tests

### Task 2: StudentLayout.tsx — Logo link + nav links (1a94689)
- Added `Link` and `NavLink` to react-router-dom imports
- Replaced plain `<span>BuMath</span>` with a `<Link to="/">` containing logo image and text
- Logo link has `aria-label="Trang chủ BuMath"` for accessibility
- Added nav links: "Khóa học của tôi" (`/courses`) and "Khám phá khóa học" (`/catalogue`)
- Nav links use `NavLink` with `isActive` callback for active route highlighting
- Nav hidden on mobile (`hidden sm:flex`) — responsive design maintained

### Task 3: Progress bar track color (576dda6)
- `CoursesPage.tsx`: `className="h-2 mt-2"` → `className="h-2 mt-2 bg-muted"`
- `LessonSidebar.tsx`: `className="h-2"` → `className="h-2 bg-muted"`
- `bg-muted` = warm neutral gray (`hsl(30 20% 94%)`) replaces `bg-secondary` = blue/cyan
- `src/components/ui/progress.tsx` not modified (className override per CLAUDE.md)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `bg-muted` className override on Progress | CLAUDE.md prohibits manual edits to `src/components/ui/` |
| Role-aware redirect to `/courses` for students | Students don't have a home page at `/`; their home is the courses list |
| `NavLink` over `Link` for nav items | `NavLink` provides `isActive` for highlighting current route without extra state |

## Test Results

- `src/pages/NotFound.test.tsx`: 5/5 passed ✓
- `src/components/student/StudentLayout.test.tsx`: 4/4 passed ✓
- Pre-existing failures in unrelated files (BellNotification, SubmissionsPage, CourseDetailPage, CataloguePage) — caused by parallel agents working on other Phase 06 plans, not from this plan's changes

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — all changes are functional with real data.

## Self-Check: PASSED
