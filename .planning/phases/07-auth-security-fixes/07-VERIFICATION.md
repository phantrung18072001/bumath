---
status: passed
phase: 07-auth-security-fixes
verified: 2026-04-29T10:00:00Z
requirements:
  - ROLE-03
  - AUTH-03
  - AUTH-04
---

# Phase 07: Auth & Security Fixes — Verification Report

## Goal
Close three auth/security gaps identified in v1.0 milestone audit:
1. Add profiles table RLS so students cannot see each other's data (ROLE-03)
2. Fix login redirect for pending/rejected students (AUTH-04)
3. Add logout to AdminLayout (AUTH-03)

## Must-Have Verification

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Test stub files exist for Login and AdminLayout | ✓ PASS | `src/pages/Login.test.tsx`, `src/components/admin/AdminLayout.test.tsx` both present |
| 2 | Profiles RLS migration is idempotent | ✓ PASS | `DROP POLICY IF EXISTS` + `CREATE POLICY` pattern, 3 policies |
| 3 | Pending students redirect to /pending | ✓ PASS | `navigate('/pending')` in Login.tsx useEffect; test passes |
| 4 | Rejected students redirect to /pending | ✓ PASS | same branch covers `rejected`; test passes |
| 5 | Approved students redirect to /courses | ✓ PASS | `navigate('/courses')` in Login.tsx; test passes |
| 6 | Approved admins redirect to /admin/users | ✓ PASS | `navigate('/admin/users')` in Login.tsx; test passes |
| 7 | Admin can log out from AdminLayout | ✓ PASS | `handleLogout` calls `signOut()` then `navigate('/login')`; test passes |
| 8 | Logout button shows "Đăng xuất" | ✓ PASS | Button text present; test passes |
| 9 | Migration file created | ✓ PASS | `supabase/migrations/20260429_16_profiles_rls.sql` exists |
| 10 | Migration applied to live DB | ✓ PASS | Human confirmed "applied" |

## Automated Test Results
- `src/pages/Login.test.tsx`: **7/7 tests pass**
- `src/components/admin/AdminLayout.test.tsx`: **5/5 tests pass**
- Full suite: 8 pre-existing failures (unrelated to this phase), no new regressions

## Requirements Coverage
- **ROLE-03**: Profiles RLS migration ensures students cannot read each other's profile rows ✓
- **AUTH-03**: AdminLayout has functional logout button with Vietnamese text ✓
- **AUTH-04**: Login redirects based on role + approval_status, not unconditionally to `/` ✓

## Verdict: PASSED
All 3 gap requirements closed. Phase 07 complete.
