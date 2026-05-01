---
phase: 07-auth-security-fixes
plan: 03
status: complete
duration: 8min
tasks_completed: 3
files_changed: 9
commits:
  - 6203aea
  - 3d46bbf
---

# Plan 07-03 Summary: Remove approval_status from Auth Stack

## Objective Achieved

Removed `approval_status` entirely from the BuMath auth stack. Access control now uses enrollment (not account approval) — any authenticated user can access the app; course content is gated by enrollment.

## Tasks Completed

| Task | Status | Commit |
|------|--------|--------|
| Task 1: Create idempotent migration to drop approval_status | ✅ Done | 6203aea |
| Task 2: Remove approval_status from types, auth flow, routes | ✅ Done | 3d46bbf |
| Task 3: Simplify UsersPage — remove approval UI, add RoleBadge | ✅ Done | 3d46bbf |

## Key Files

### Created
- `supabase/migrations/20260429_17_remove_approval_status.sql` — idempotent migration (5 sections: storage policy fix, catalogue policy replacement, function drop, index drop, column drop)

### Modified
- `src/types/auth.ts` — removed `approval_status` field from Profile interface
- `src/components/auth/ProtectedRoute.tsx` — removed `requireApproved` prop and pending/rejected redirect; now role-only guard
- `src/pages/Login.tsx` — removed `approval_status` branch from useEffect; clean student/admin/teacher redirect
- `src/pages/Login.test.tsx` — removed 2 `/pending` redirect tests, cleaned approval_status from mocks
- `src/components/auth/ProtectedRoute.test.tsx` — removed 2 `/pending` tests, cleaned approval_status from mocks
- `src/App.tsx` — removed `Pending` import and `/pending` route
- `src/pages/admin/UsersPage.tsx` — removed tabs/StatusBadge/approve/reject mutations; added RoleBadge, flat user table with enrollment management

### Deleted
- `src/pages/Pending.tsx` — no longer needed

## Verification

- ✅ `grep -rn "approval_status" src/` (non-test) → 0 results
- ✅ `yarn tsc --noEmit` → exit code 0
- ✅ `yarn test src/pages/Login.test.tsx` → 5 tests pass
- ✅ `yarn test src/components/auth/ProtectedRoute.test.tsx` → 6 tests pass
- ✅ `src/pages/Pending.tsx` does not exist
- ✅ `src/App.tsx` has no `/pending` route
- ✅ Migration file has all 5 idempotent sections

## Deviations from Plan

**[Rule 3 - Blocking] ProtectedRoute.test.tsx had approval_status tests** — Found during: Task 2 | Issue: Two tests (`redirects to /pending when approval_status is pending/rejected`) were failing because ProtectedRoute no longer has approval_status logic | Fix: Deleted the two obsolete tests, removed approval_status from mock profiles, removed `requireApproved` from `renderProtected` signature | Files modified: `src/components/auth/ProtectedRoute.test.tsx` | Verification: 6 tests pass | Commit hash: 3d46bbf

**Total deviations:** 1 auto-fixed (blocking test cleanup). **Impact:** No behavioral change — tests now correctly reflect that ProtectedRoute only checks auth + role.

## Session Notes

- BellNotification test failures are pre-existing (unrelated to this plan) — confirmed by running tests against prior commit
- Migration requires manual application via Supabase Dashboard SQL Editor

## Self-Check: PASSED
