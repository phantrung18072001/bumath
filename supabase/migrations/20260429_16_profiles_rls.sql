-- Migration: Confirm and enforce profiles table RLS (ROLE-03 gap closure)
-- Phase 7: Auth & Security Fixes
-- Purpose: Idempotently ensure RLS policies for the profiles table are applied
-- on the live Supabase instance. The schema migration (01_profiles.sql) contained
-- these policies but was marked orphaned in Phase 2 verification. This migration
-- makes ROLE-03 definitively satisfied.

-- ============================================================
-- 1. ENABLE RLS (safe to re-run — idempotent)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- ============================================================
-- 2. ENSURE get_my_role() HELPER EXISTS
-- ============================================================
-- CREATE OR REPLACE is idempotent — safe to re-run
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ============================================================
-- 3. DROP + RECREATE SELECT POLICY (idempotent)
-- ============================================================
-- Policy: Students see only their own row; admins/teachers see all rows
DROP POLICY IF EXISTS "Students can view own profile" ON public.profiles;

CREATE POLICY "Students can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR get_my_role() IN ('admin', 'teacher')
  );

-- ============================================================
-- 4. DROP + RECREATE UPDATE POLICIES (idempotent)
-- ============================================================
-- Policy: Users can update their own profile (name, address, etc.)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: Admin can update any profile (for approve/reject)
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;

CREATE POLICY "Admin can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- ============================================================
-- VERIFICATION NOTES
-- ============================================================
-- After running this migration in Supabase SQL Editor:
-- 1. Go to Table Editor > profiles > Policies (top-right)
-- 2. Verify these 3 policies appear:
--    - "Students can view own profile" (SELECT)
--    - "Users can update own profile" (UPDATE)
--    - "Admin can update any profile" (UPDATE)
-- 3. RLS should show as "Enabled" on the profiles table
