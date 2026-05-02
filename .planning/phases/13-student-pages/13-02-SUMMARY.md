---
phase: 13-student-pages
plan: "02"
subsystem: student-pages
tags: [catalogue, infinite-scroll, search, claymorphism, ux]
dependency_graph:
  requires: [13-00]
  provides: [catalogue-search, catalogue-infinite-scroll, catalogue-claymorphism]
  affects: [src/pages/student/CataloguePage.tsx]
tech_stack:
  added: []
  patterns: [useInfiniteQuery, IntersectionObserver, client-side-filter]
key_files:
  created: []
  modified:
    - src/pages/student/CataloguePage.tsx
    - src/pages/student/CataloguePage.test.tsx
decisions:
  - useInfiniteQuery replaces useQuery for paginated course loading (pageSize=12)
  - Client-side search+grade filter operates on all loaded pages (avoids re-fetching)
  - IntersectionObserver sentinel at page bottom triggers fetchNextPage automatically
  - Grade URL param uses raw grade value (grade_7 etc.) directly instead of short alias mapping
metrics:
  duration: "251 seconds (~4 min)"
  completed: "2026-05-02T13:22:05Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 13 Plan 02: CataloguePage Refactor — Search, Infinite Scroll, Claymorphism

**One-liner:** CataloguePage refactored with teal search bar, useInfiniteQuery infinite scroll (pageSize=12), Claymorphism cards (`bm-clay-card-student`), client-side search+grade filtering, and two distinct empty states.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Refactor CataloguePage — search, infinite scroll, Claymorphism | 06b69d9 | src/pages/student/CataloguePage.tsx |
| 2 | Extend CataloguePage tests with new behavior stubs | 34ef466 | src/pages/student/CataloguePage.test.tsx |

## What Was Built

### CataloguePage.tsx

- **Imports updated:** Removed `Alert/AlertDescription`, `fetchAllCourses`; added `useInfiniteQuery`, `fetchCoursesPaginated`, `Input`, `Search`, `BookOpen`, `useState`, `useRef`, `useEffect`
- **useInfiniteQuery:** Replaces `useQuery`; loads courses in pages of 12 via `fetchCoursesPaginated`; `getNextPageParam` returns next page number when last page has exactly 12 results
- **IntersectionObserver:** `sentinelRef` div at bottom of content area; triggers `fetchNextPage` when visible and `hasNextPage && !isFetchingNextPage`
- **Search bar:** Input with teal border (`border-[#0D9488]`), Search icon, min-h-[48px], `aria-label="Tìm kiếm khóa học"`
- **Grade filter pills:** `bg-[#0D9488] text-white` for active state; min-h-[44px]; font-bold
- **Client-side filter:** AND combination of grade filter + searchQuery (case-insensitive)
- **Loading skeleton:** 6 cards, `rounded-3xl`, `lg:grid-cols-3`
- **Empty state (filtered):** Search icon + "Không tìm thấy kết quả" when allCourses > 0 but filteredCourses = 0
- **Empty state (no courses):** BookOpen icon + "Chưa có khóa học nào" when allCourses = 0
- **Course grid:** `lg:grid-cols-3`, cards use `bm-clay-card-student` Claymorphism styling
- **Loading dots:** 3 animated Skeleton circles when `isFetchingNextPage`
- **Unauthenticated wrapper:** `bg-[#F0FDFA]` teal tint

### CataloguePage.test.tsx

- Fixed mock: `fetchAllCourses` → `fetchCoursesPaginated` (returns `{ data, total }`)
- Fixed mock: `useAuth` now includes `user: { id: 'user-1' }` so `isAuthenticated` works
- Added `IntersectionObserver` mock for jsdom compatibility
- Added 6 `it.todo()` stubs for Phase 13 behaviors: search filtering, Claymorphism class, filtered empty state, skeleton loading

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] IntersectionObserver not defined in jsdom test environment**
- **Found during:** Task 2
- **Issue:** `IntersectionObserver` not available in jsdom, causing all tests to fail with `ReferenceError`
- **Fix:** Added `Object.defineProperty(window, 'IntersectionObserver', ...)` mock at top of test file
- **Files modified:** src/pages/student/CataloguePage.test.tsx
- **Commit:** 34ef466

**2. [Rule 1 - Bug] useAuth mock missing `user` field, causing isAuthenticated=false**
- **Found during:** Task 2
- **Issue:** Tests for "Đã đăng ký" / "Chưa đăng ký" badges failed because `isAuthenticated = !authLoading && !!user` was false (no `user` in mock)
- **Fix:** Added `user: { id: 'user-1' }` to the `useAuth` mock return value
- **Files modified:** src/pages/student/CataloguePage.test.tsx
- **Commit:** 34ef466

## Success Criteria Verification

- [x] Search bar exists above grade filters with teal border styling
- [x] Search filters courses client-side by title (case-insensitive, AND with grade)
- [x] `useInfiniteQuery` replaces `useQuery` for course fetching
- [x] `IntersectionObserver` triggers `fetchNextPage` at scroll bottom
- [x] Page size is 12 courses per page
- [x] Cards use `.bm-clay-card-student` class
- [x] Grid is 3 columns on lg breakpoint (`lg:grid-cols-3`)
- [x] Active grade pill has `bg-[#0D9488] text-white` styling
- [x] Empty state (filtered) shows Search icon and "Không tìm thấy kết quả"
- [x] Empty state (no courses) shows BookOpen icon
- [x] Loading indicator shows 3 skeleton dots while fetching more
- [x] Error state uses plain `<p>` not `<Alert>`
- [x] Unauthenticated wrapper has `bg-[#F0FDFA]`

## Known Stubs

None — all features are fully wired. The `it.todo()` stubs in the test file are intentional test placeholders for future test implementation, not data/feature stubs.

## Self-Check: PASSED
