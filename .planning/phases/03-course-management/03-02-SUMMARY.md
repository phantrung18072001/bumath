---
phase: 03-course-management
plan: 02
subsystem: ui
tags: [react, tanstack-query, react-hook-form, zod, supabase, shadcn-ui, tailwind]

# Dependency graph
requires:
  - phase: 03-course-management
    provides: courses table with RLS policies (03-01-PLAN.md)
  - phase: 02-auth-access-control
    provides: ProtectedRoute component, AuthContext
provides:
  - Admin Courses page at /admin/courses
  - Course CRUD API module (src/lib/api/courses.ts)
  - CourseFormDialog component (create + edit)
  - Grade target badge component with semantic colors
affects: [03-03, 03-04, 03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Admin page shell: container mx-auto px-4 py-8 with breadcrumb + CTA header bar"
    - "Grade badges: semantic colors bg-{color}-100 text-{color}-700 per target_grade enum"
    - "Delete confirmation via AlertDialog (not inline) for irreversible destructive actions"
    - "CourseFormDialog: useEffect reset on open/course change, RHF+Zod, mutation with toast"

key-files:
  created:
    - src/lib/api/courses.ts
    - src/pages/admin/CoursesPage.tsx
    - src/components/admin/CourseFormDialog.tsx
  modified:
    - src/App.tsx

key-decisions:
  - "target_grade enum values: grade_7, grade_8, grade_9, advanced — maps to UI labels Lớp 7/8/9/Ôn chuyên"
  - "CourseFormDialog resets via useEffect on open/course change (not onOpenChange) for clean controlled state"

patterns-established:
  - "Admin CRUD page: API module -> Page with useQuery + useMutation -> separate FormDialog component"
  - "Grade badge colors: blue=7, green=8, purple=9, orange=advanced (UI-SPEC semantic colors)"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 3 Plan 2: Admin Courses Page Summary

**Admin Courses page at /admin/courses with full CRUD: Supabase API module, Table with grade badges, Create/Edit Dialog (RHF+Zod), AlertDialog for delete confirmation**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-24T16:10:16Z
- **Completed:** 2026-03-24T16:14:46Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- Course API module with typed fetch/insert/update/delete via Supabase
- Admin Courses page with loading state, empty state, and Table following UsersPage.tsx patterns
- Grade target badges with semantic colors (blue/green/purple/orange) per UI-SPEC
- CourseFormDialog with RHF+Zod validation, success/error toasts in Vietnamese
- Delete confirmation via AlertDialog with full Vietnamese copy per UI-SPEC
- /admin/courses route wired in App.tsx with ProtectedRoute admin guard

## Task Commits

Each task was committed atomically:

1. **Task 1: Setup Course API calls** - `ff6f208` (feat)
2. **Task 2: Setup Admin Courses Page UI Outline** - `b655463` (feat)
3. **Task 3: Build Course List Table** - `b655463` (included in Task 2 commit — table is part of CoursesPage)
4. **Task 4: Build Create/Edit Course Dialog** - `253d862` (feat)

## Files Created/Modified
- `src/lib/api/courses.ts` - Course CRUD API with typed Course interface and Supabase methods
- `src/pages/admin/CoursesPage.tsx` - Admin courses list page with loading/empty/table states, delete AlertDialog
- `src/components/admin/CourseFormDialog.tsx` - Create/edit dialog with RHF+Zod, insert/update mutations
- `src/App.tsx` - Added /admin/courses route with ProtectedRoute admin guard

## Decisions Made
- `target_grade` enum values use `grade_7`, `grade_8`, `grade_9`, `advanced` to match DB schema from 03-01
- CourseFormDialog resets form via `useEffect` watching `open` and `course` props — clean controlled reset pattern
- Tasks 2 and 3 (page + table) committed together as the table is integral to the page shell

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `yarn build` failed initially because node_modules missing in worktree — ran `yarn install` to populate (worktree-specific setup, not a code issue).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Admin Courses page complete; ready for 03-03 (Chapters/Lessons management)
- Course data model and API module established for re-use in subsequent plans

## Self-Check: PASSED

- FOUND: src/lib/api/courses.ts
- FOUND: src/pages/admin/CoursesPage.tsx
- FOUND: src/components/admin/CourseFormDialog.tsx
- FOUND: ff6f208 (Task 1 commit)
- FOUND: b655463 (Task 2+3 commit)
- FOUND: 253d862 (Task 4 commit)

---
*Phase: 03-course-management*
*Completed: 2026-03-24*
