---
phase: 13-student-pages
plan: "01"
subsystem: student-ui
tags: [claymorphism, progress-bar, empty-state, url-fix, teal]
dependency_graph:
  requires: ["13-00"]
  provides: ["CoursesPage-claymorphism", "LessonSidebar-teal-progress"]
  affects: ["src/pages/student/CoursesPage.tsx", "src/components/student/LessonSidebar.tsx"]
tech_stack:
  added: []
  patterns: ["bm-clay-card-student", "bm-progress-teal", "Claymorphism teal cards"]
key_files:
  modified:
    - src/pages/student/CoursesPage.tsx
    - src/components/student/LessonSidebar.tsx
decisions:
  - "Used bm-clay-card-student CSS class (defined in 13-00) for card styling — border-0 shadow-none overrides shadcn Card defaults"
  - "Progress track color bg-[#CCFBF1] provides subtle teal background for progress bar"
  - "Empty state CTA uses bm-btn-cta class matching design system Button style"
metrics:
  duration: "5min"
  completed: "2026-05-02T13:18:23Z"
  tasks: 2
  files: 2
---

# Phase 13 Plan 01: CoursesPage Claymorphism Refactor + LessonSidebar Teal Progress Summary

Refactored CoursesPage with Claymorphism teal card styling, h-3 teal progress bars, polished Vietnamese empty state with BookOpen icon, and fixed the `/courses/` → `/khoa-hoc/` URL bug; updated LessonSidebar progress bar to teal fill via bm-progress-teal CSS class.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Refactor CoursesPage — Claymorphism cards, progress, empty state, URL fix | `7549e31` | src/pages/student/CoursesPage.tsx |
| 2 | Update LessonSidebar progress bar to teal | `a8897e4` | src/components/student/LessonSidebar.tsx |

## Changes Made

### Task 1: CoursesPage Refactor

**File:** `src/pages/student/CoursesPage.tsx`

1. **Imports:** Removed `Alert, AlertDescription`; added `BookOpen` (lucide-react) and `Button`
2. **Page heading:** `font-semibold` → `font-bold text-[#134E4A]`
3. **Error state:** Replaced `<Alert variant="destructive">` with `<p className="text-destructive text-center py-8">`
4. **Skeleton loading:** `h-40 rounded-xl` → `h-36 rounded-3xl` (4 cards)
5. **Empty state:** Full redesign — BookOpen icon (h-16 w-16 text-[#0D9488]), heading "Bạn chưa có khóa học nào", body text, Button CTA to `/danh-muc` with `bm-btn-cta` class
6. **URL bug fix:** `to={\`/courses/${course.slug}\`}` → `to={\`/khoa-hoc/${course.slug}\`}`
7. **Card:** `hover:shadow-md transition-shadow` → `bm-clay-card-student border-0 shadow-none p-0 overflow-hidden`
8. **CardTitle:** `font-semibold` → `font-bold text-[#134E4A]`
9. **Progress bar:** `h-2 bg-muted` → `h-3 bg-[#CCFBF1] bm-progress-teal`
10. **Progress label:** `mt-1` → `mt-2`

### Task 2: LessonSidebar Update

**File:** `src/components/student/LessonSidebar.tsx`

1. **Progress header border:** `border-sidebar-border` → `border-[#0D9488]/20`
2. **Progress bar:** `bg-muted` → `bg-[#CCFBF1] bm-progress-teal`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data is wired through existing `useQuery` hooks.

## Self-Check: PASSED

- `src/pages/student/CoursesPage.tsx` — exists and contains `bm-clay-card-student`, `/khoa-hoc/${course.slug}`, `BookOpen`, `bm-progress-teal`, `h-3`, `bg-[#CCFBF1]`, `text-destructive`, no Alert import
- `src/components/student/LessonSidebar.tsx` — exists and contains `bm-progress-teal`, `bg-[#CCFBF1]`, `border-[#0D9488]/20`
- Commit `7549e31` — exists
- Commit `a8897e4` — exists
