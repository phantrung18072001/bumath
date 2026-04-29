---
plan: 07-01
phase: 07-auth-security-fixes
status: complete
started: 2026-04-29T09:54:35Z
completed: 2026-04-29T09:56:00Z
commits:
  - task: 1
    hash: eb7d1ee
    message: "feat(07-01): create idempotent profiles RLS migration (ROLE-03)"
key-files:
  created:
    - supabase/migrations/20260429_16_profiles_rls.sql
---

# Plan 07-01: Profiles RLS Migration — Summary

## Objective
Create an idempotent SQL migration to ensure profiles table RLS policies are applied on the live Supabase instance.

## What Was Built
`supabase/migrations/20260429_16_profiles_rls.sql` — idempotent migration that:
- Enables and forces RLS on `public.profiles`
- Creates/replaces `get_my_role()` SECURITY DEFINER helper
- DROP IF EXISTS + CREATE POLICY for 3 policies:
  - `Students can view own profile` (SELECT — own row, or admin/teacher sees all)
  - `Users can update own profile` (UPDATE own)
  - `Admin can update any profile` (UPDATE any)

## Verification
- ✓ All 5 acceptance criteria checked via grep
- ✓ Migration applied to live Supabase instance (human confirmed: "applied")
- ✓ ROLE-03 requirement satisfied

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed. **Impact:** none.

## Self-Check: PASSED
