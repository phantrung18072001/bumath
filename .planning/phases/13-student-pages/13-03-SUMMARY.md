---
phase: 13-student-pages
plan: "03"
subsystem: student-pages
tags: [ui-refactor, mobile-ux, sheet-drawer, claymorphism, breakpoints]
dependency_graph:
  requires: [13-00]
  provides: [CourseDetailPage-mobile-drawer, Claymorphism-preview-card]
  affects: [src/pages/student/CourseDetailPage.tsx]
tech_stack:
  added: []
  patterns: [Sheet drawer for mobile sidebar, Claymorphism card styling, lg: breakpoints]
key_files:
  modified:
    - src/pages/student/CourseDetailPage.tsx
    - src/pages/student/CourseDetailPage.test.tsx
decisions:
  - "Replaced enrolled mobile Tabs navigation with Sheet drawer from left side for cleaner UX"
  - "Changed all breakpoints from md: to lg: for desktop/mobile split consistency"
  - "Applied Claymorphism bm-clay-card-student to preview mode Card per D-01"
  - "Error state changed from Alert component to plain p.text-destructive per Phase 12.1 pattern"
metrics:
  duration: "8min"
  completed: "2026-05-02"
  tasks: 2
  files: 2
---

# Phase 13 Plan 03: CourseDetailPage Sheet Drawer & Claymorphism Summary

**One-liner:** Sheet drawer replaces Tabs for enrolled mobile lesson navigation with Claymorphism preview card and lg: breakpoints throughout CourseDetailPage.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Refactor CourseDetailPage — Sheet drawer, breakpoints, Claymorphism | `3c48692` | src/pages/student/CourseDetailPage.tsx |
| 2 | Add test stubs for new behaviors | `f5bbe34` | src/pages/student/CourseDetailPage.test.tsx |

## What Was Built

### Task 1: CourseDetailPage Full Refactor

**Sheet Drawer (Enrolled Mobile):**
- Replaced the mobile Tabs (`block md:hidden`) with a clean Sheet drawer triggered by "Danh sách bài học" button
- Sheet slides in from left side (`side="left"`) with `w-[85vw] max-w-[320px]`
- `drawerOpen` state added; selecting a lesson auto-closes the drawer (`setDrawerOpen(false)`)
- Trigger button: teal outline style `border-[#0D9488] text-[#0D9488]`, `min-h-[48px]`, Menu icon

**Breakpoint Changes:**
- All `hidden md:flex` → `hidden lg:flex`
- All `block md:hidden` → `block lg:hidden`  
- Error/not-found/empty state padding: `px-4 md:px-8` → `px-4 lg:px-8`

**Desktop Sidebar Styling:**
- `bg-sidebar border-r border-sidebar-border` → `bg-white border-r border-[#0D9488]/20`
- Applied to both enrolled and preview desktop layouts

**Preview Mode Card — Claymorphism:**
- `Card className="bm-clay-card-student border-0 shadow-none w-full max-w-sm p-0"` (Claymorphism)
- Lock icon circle: `bg-[#CCFBF1] border-2 border-[#0D9488]` (was `bg-muted border border-border`)
- Lock icon: `text-[#0D9488]` (was `text-muted-foreground`)
- Heading: `font-bold text-[#134E4A]` (was `font-semibold`)
- Login CTA: `bm-btn-cta min-h-[48px]` class added

**Preview Mobile Tabs:**
- TabsTrigger: `data-[state=active]:border-[#0D9488]` (was `border-primary`), `font-bold` (was `font-semibold`)
- Tab content background: `bg-[#F0FDFA]` on content tab
- Mobile lock icon: `bg-[#CCFBF1] border-2 border-[#0D9488]` (was `bg-muted border border-border`)

**Background & Error State:**
- Unauthenticated wrapper: `bg-[#F0FDFA]` (was `bg-background`)
- Error state: `<p className="text-destructive text-center py-8">` (was `<Alert variant="destructive">`)
- Skeleton: Added `pt-4`, rounded classes (`rounded-xl`, `rounded-3xl`), more skeleton lines

### Task 2: Test Stubs

Added 5 `it.todo()` stubs to `CourseDetailPage.test.tsx`:
- Sheet drawer behavior (3 stubs)
- Claymorphism preview card (1 stub)
- lg: breakpoint (1 stub)

## Deviations from Plan

None — plan executed exactly as written.

## Known Issues (Pre-existing)

2 tests fail in the existing test suite (pre-existing before this plan):
- `shows lock notice "Bạn chưa đăng ký khóa học này."` — Mock doesn't set `user` field, so `isAuthenticated = false`, rendering "Đăng nhập" text instead
- `shows contact CTA "Vui lòng liên hệ giảng viên..."` — Same root cause

These failures existed before and are not caused by plan 13-03 changes. Verified by `git stash` test run (same 2 failed | 2 passed results).

## Self-Check: PASSED

- [x] `src/pages/student/CourseDetailPage.tsx` — modified, committed 3c48692
- [x] `src/pages/student/CourseDetailPage.test.tsx` — modified, committed f5bbe34
- [x] `Sheet, SheetContent, SheetHeader, SheetTitle` imported
- [x] `Menu` imported from lucide-react
- [x] `drawerOpen` state present
- [x] "Danh sách bài học" trigger button present
- [x] `hidden lg:flex` × 2 (no `hidden md:flex`)
- [x] `block lg:hidden` × 2 (no `block md:hidden`)
- [x] `bm-clay-card-student` on preview Card
- [x] `bg-[#F0FDFA]` on content areas
- [x] `border-[#0D9488]/20` on sidebar
- [x] `bg-[#CCFBF1] border-[#0D9488]` on lock icon circles
- [x] Error state uses `<p className="text-destructive"` not `<Alert>`
- [x] 5 `it.todo()` stubs in test file
