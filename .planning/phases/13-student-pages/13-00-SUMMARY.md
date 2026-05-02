---
phase: 13-student-pages
plan: "00"
subsystem: student-ui
tags: [css, design-system, claymorphism, teal, fonts, test-scaffold]
dependency_graph:
  requires: []
  provides:
    - bm-clay-card-student CSS class
    - bm-progress-teal CSS class
    - Baloo 2 + Comic Neue font imports
    - StudentLayout mint-teal background
    - CoursesPage test scaffold
  affects:
    - src/pages/student/CoursesPage.tsx (will use bm-clay-card-student)
    - src/pages/student/CataloguePage.tsx (will use bm-clay-card-student)
    - src/pages/student/CourseDetailPage.tsx (will use bg-[#F0FDFA])
tech_stack:
  added: []
  patterns:
    - Claymorphism student card variant with teal theme
    - CSS class extension pattern (bm-clay-card-student extends bm-clay-card concept)
key_files:
  created:
    - src/pages/student/CoursesPage.test.tsx
  modified:
    - src/index.css
    - src/components/student/StudentLayout.tsx
decisions:
  - Student pages use teal (#0D9488) claymorphism variant on mint (#F0FDFA) background
  - Fonts: Baloo 2 + Comic Neue added for student pages alongside Be Vietnam Pro (scoped, not global)
metrics:
  duration: "~5 minutes"
  completed: "2026-05-02"
  tasks: 3
  files: 3
---

# Phase 13 Plan 00: CSS Foundation and Test Scaffold Summary

**One-liner:** Teal claymorphism CSS classes (.bm-clay-card-student, .bm-progress-teal), Baloo 2 + Comic Neue font imports, mint background on StudentLayout, and CoursesPage test scaffold for Wave 1 refactors.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add CSS classes and font imports to index.css | 10299f5 | src/index.css |
| 2 | Update StudentLayout page background | 35eb901 | src/components/student/StudentLayout.tsx |
| 3 | Create CoursesPage test scaffold | ab40b33 | src/pages/student/CoursesPage.test.tsx |

---

## What Was Built

### CSS Foundation (src/index.css)
- **Font import updated**: Baloo 2 (wght@400;700) + Comic Neue (wght@400;700) added alongside existing Be Vietnam Pro. Student pages will scope these fonts to specific elements without changing global body font.
- **`.bm-clay-card-student`**: New Claymorphism card class with teal variant — `border: 3px solid #0D9488`, double shadow (`0 8px 0 #0D9488` outer + `0 2px 0 rgba(255,255,255,0.8)` inset), `border-radius: 24px`, hover lift (`translateY(-2px)`), `prefers-reduced-motion` media query support.
- **`.bm-progress-teal`**: Progress bar override targeting `[data-slot="progress-indicator"]` and `> div` with `background-color: #0D9488 !important` for teal fill.

### StudentLayout Background (src/components/student/StudentLayout.tsx)
- Changed `<main>` from `bg-background` to `bg-[#F0FDFA]` — sets mint-teal background for all student pages (CoursesPage, CataloguePage, CourseDetailPage enrolled view).

### CoursesPage Test Scaffold (src/pages/student/CoursesPage.test.tsx)
- Created with mocked AuthContext and TanStack Query
- 1 passing test: page heading "Khóa học của tôi"
- 9 `.todo()` stubs for Wave 1 behaviors: STUDENT-UI-01 (card layout + progress), STUDENT-UI-04 (empty state), DS-02 (loading skeleton), Error state

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Self-Check: PASSED

- [x] `src/index.css` contains `.bm-clay-card-student` (4 occurrences: class, hover, reduced-motion ×2)
- [x] `src/index.css` contains `.bm-progress-teal` (2 occurrences)
- [x] `src/index.css` @import contains `Baloo+2` and `Comic+Neue`
- [x] `src/components/student/StudentLayout.tsx` main has `bg-[#F0FDFA]`
- [x] `src/pages/student/CoursesPage.test.tsx` exists with describe blocks
- [x] `yarn test CoursesPage.test.tsx` passes: 1 passed, 9 todo
- [x] Commits 10299f5, 35eb901, ab40b33 verified in git log
