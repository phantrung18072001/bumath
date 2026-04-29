---
plan: 07-02
phase: 07-auth-security-fixes
status: complete
started: 2026-04-29T09:55:00Z
completed: 2026-04-29T09:59:30Z
commits:
  - task: "1 (RED)"
    hash: 4e9ad6b
    message: "test(07-02): add failing tests for Login redirect logic (AUTH-04)"
  - task: "1 (GREEN)"
    hash: 600df22
    message: "feat(07-02): fix Login.tsx redirect logic (AUTH-04)"
  - task: "2 (RED)"
    hash: 6ab25e3
    message: "test(07-02): add failing tests for AdminLayout logout (AUTH-03)"
  - task: "2 (GREEN)"
    hash: 5abe409
    message: "feat(07-02): add logout button to AdminLayout (AUTH-03)"
key-files:
  modified:
    - src/pages/Login.tsx
    - src/pages/Login.test.tsx
    - src/components/admin/AdminLayout.tsx
    - src/components/admin/AdminLayout.test.tsx
---

# Plan 07-02: Auth Fixes — Summary

## Objective
Fix login redirect behavior (AUTH-04) and add logout to AdminLayout (AUTH-03).

## What Was Built

### Task 1: Login.tsx redirect logic (AUTH-04)
- Added `profile` to `useAuth()` destructure
- Replaced `if (!loading && user) navigate('/')` with role-aware redirect in `useEffect`:
  - `pending`/`rejected` → `/pending`
  - `admin` (approved) → `/admin/users`
  - `teacher` (approved) → `/` (until Phase 8)
  - `student` (approved) → `/courses`
- Removed `navigate('/')` from `handleSubmit` success path (redirect handled by useEffect)
- 7 tests: all passing

### Task 2: AdminLayout logout button (AUTH-03)
- Added imports: `useNavigate`, `LogOut` icon, `useAuth`, `Button`
- Added `signOut`/`navigate` hooks + `handleLogout` async function
- Added `<Button variant="ghost">` with `LogOut` icon and "Đăng xuất" text
- 5 tests: all passing

## Verification
- ✓ 12 tests pass (7 Login + 5 AdminLayout)
- ✓ Regression gate: 8 pre-existing failures, same before and after — no new regressions
- ✓ AUTH-03 satisfied: admin can log out from AdminLayout
- ✓ AUTH-04 satisfied: login redirects based on role and approval_status

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed. **Impact:** none.

## Self-Check: PASSED
