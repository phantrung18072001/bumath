---
phase: 07-auth-security-fixes
plan: 04
status: complete
duration: 5min
tasks_completed: 2
files_changed: 6
commits:
  - b632862
  - 73e80e5
---

# Plan 07-04 Summary: Redesign Admin Nav Inside StudentLayout

## Objective Achieved

Admin users now experience the same top-level StudentLayout header (logo, courses, catalogue, logout) as students — with an additional "Quản trị" link (Shield icon) that appears only for admin role. AdminLayout is now a pure inner sidebar component with no auth dependencies.

## Tasks Completed

| Task | Status | Commit |
|------|--------|--------|
| Task 1: Simplify AdminLayout to inner sidebar nav panel | ✅ Done | b632862 |
| Task 2: Add admin nav link to StudentLayout + wrap admin routes in App.tsx | ✅ Done | b632862 |
| Bonus: Rewrite UsersPage.test.tsx for simplified UI | ✅ Done | 73e80e5 |

## Key Files

### Modified
- `src/components/admin/AdminLayout.tsx` — simplified to pure inner sidebar (removed: useAuth, signOut, useNavigate, LogOut, Button, LayoutDashboard; added: min-h-[calc(100vh-48px)] to account for StudentLayout header)
- `src/components/admin/AdminLayout.test.tsx` — rewritten: 3 tests for nav items, children, correct hrefs (removed 5 auth-related tests)
- `src/components/student/StudentLayout.tsx` — added Shield import + role-conditional "Quản trị" NavLink for admin role pointing to /admin/users
- `src/components/student/StudentLayout.test.tsx` — added 2 new tests for admin link (shows for admin, hidden for student)
- `src/App.tsx` — added StudentLayout import; all 6 /admin/* routes now wrap ProtectedRoute → StudentLayout → AdminLayout → page
- `src/pages/admin/UsersPage.test.tsx` — rewritten for simplified flat-table UI (RoleBadge, enrollment button, empty state)

## Verification

- ✅ `yarn tsc --noEmit` → exit code 0
- ✅ AdminLayout tests: 3 passed (nav items, children, hrefs)
- ✅ StudentLayout tests: 6 passed (4 existing + 2 new admin link tests)
- ✅ UsersPage tests: 6 passed
- ✅ `grep -c "useAuth|signOut|LogOut|handleLogout" src/components/admin/AdminLayout.tsx` → 0
- ✅ `grep -c "StudentLayout" src/App.tsx` → 7 (1 import + 6 route usages)
- ✅ `grep -n "Shield" src/components/student/StudentLayout.tsx` → 2 matches

## Deviations from Plan

**[Rule 3 - Blocking] UsersPage.test.tsx had tests for removed approval UI** — Found during: full test suite run | Issue: 6 tests were failing because they tested approval tabs and mutations that no longer exist | Fix: Rewrote test file to match the simplified flat-table UI with RoleBadge and enrollment button | Files modified: `src/pages/admin/UsersPage.test.tsx` | Verification: 6 tests pass | Commit hash: 73e80e5

**Total deviations:** 1 auto-fixed (blocking test cleanup). **Impact:** Positive — overall test failures reduced from 16 (pre-plan) to 8 (post-plan, all pre-existing).

## Session Notes

- Pre-existing failures (8): BellNotification (3), SubmissionsPage (1), CataloguePage (2), CourseDetailPage (2) — all confirmed pre-existing, unrelated to this plan
- Overall improvement: 16 → 8 test failures across the suite

## Self-Check: PASSED
