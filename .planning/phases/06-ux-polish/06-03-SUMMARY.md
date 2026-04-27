---
phase: 06-ux-polish
plan: "03"
subsystem: catalogue-infrastructure
tags: [rls, api, routing, catalogue, student]
dependency_graph:
  requires: [06-00, 06-01]
  provides: [catalogue-rls, fetchAllCourses, catalogue-route]
  affects: [courses, chapters, lessons, App.tsx]
tech_stack:
  added: []
  patterns: [RLS-policy-broadening, API-function-separation]
key_files:
  created:
    - supabase/migrations/20260428_13_catalogue_rls.sql
  modified:
    - src/lib/api/courses.ts
    - src/App.tsx
decisions:
  - "fetchAllCourses() is separate from fetchCourses() — different ordering (target_grade ASC vs created_at DESC) allows future divergence"
  - "approved_user_read_all_* policies replace restrictive enrolled-only policies — enrollment lock is in UI, not RLS"
  - "/catalogue route uses requiredRole=student — admins use /admin/courses"
metrics:
  duration: "~7 minutes"
  completed: "2026-04-27T15:17:35Z"
  tasks: 3
  files: 3
---

# Phase 06 Plan 03: Catalogue Infrastructure Summary

**One-liner:** RLS broadened to all approved users, `fetchAllCourses()` added ordering by grade, and `/catalogue` route wired for students.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create RLS migration for catalogue access | a8c3561 | supabase/migrations/20260428_13_catalogue_rls.sql |
| 2 | Add fetchAllCourses function to courses.ts | b58238b | src/lib/api/courses.ts |
| 3 | Add /catalogue route to App.tsx | c692c05 | src/App.tsx |

## What Was Built

### RLS Migration (`20260428_13_catalogue_rls.sql`)
Drops the old `student_read_enrolled_*` policies that restricted students to only querying courses they were enrolled in. Replaces them with `approved_user_read_all_*` policies using the `is_approved_user()` SECURITY DEFINER helper. This enables catalogue browsing — all approved users can see all courses. The enrollment "lock" is enforced by UI, not RLS.

### API Function (`fetchAllCourses`)
Added to `src/lib/api/courses.ts`. Deliberately separate from `fetchCourses()` (admin):
- `fetchCourses()` → `order('created_at', { ascending: false })` — admin sees newest first
- `fetchAllCourses()` → `order('target_grade', { ascending: true })` — students see grouped by grade level

### Route Wiring (`App.tsx`)
Import and `/catalogue` route added. Uses `ProtectedRoute requiredRole="student"` consistent with other student routes. Renders the existing `CataloguePage.tsx` stub (full implementation in Plan 04).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `src/pages/student/CataloguePage.tsx` — returns `<div />` placeholder. Created in Wave 0 for test loading. Full implementation in Plan 04.

## Self-Check: PASSED
