-- Phase 2: Profiles table, trigger, and RLS policies
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Prerequisites:
--   1. Phone provider enabled in Supabase Dashboard > Authentication > Providers
--   2. Phone verification ("Confirm phone") set to DISABLED
--
-- This migration:
--   1. Creates the profiles table matching src/types/auth.ts
--   2. Creates a trigger that auto-creates a profile row when a user signs up
--   3. Enables RLS on profiles
--   4. Creates policies: students see only own row; admin/teacher see all; admin can update

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  year_of_birth INTEGER NOT NULL DEFAULT 0,
  address TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, year_of_birth, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, ''),
    COALESCE((NEW.raw_user_meta_data->>'year_of_birth')::INTEGER, 0),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists to make migration idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (prevents bypassing via service role in client)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- ============================================================
-- 4. HELPER FUNCTION (must be before policies)
-- ============================================================

-- SECURITY DEFINER: runs as function owner (bypasses RLS on profiles).
-- Needed to avoid infinite recursion — policies on profiles cannot
-- subquery profiles directly or they trigger themselves.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

-- Policy: Students see only their own row; admins/teachers see all rows
CREATE POLICY "Students can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR get_my_role() IN ('admin', 'teacher')
  );

-- Policy: Users can update their own profile (name, address, etc.)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: Admin can update any profile (for approve/reject in UsersPage.tsx)
-- Matches: `.update({ approval_status: 'approved' }).eq('id', userId)`
CREATE POLICY "Admin can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Policy: No direct INSERT from client (trigger handles creation)
-- The handle_new_user function runs as SECURITY DEFINER, bypassing RLS.
-- No INSERT policy needed for authenticated users.

-- ============================================================
-- 6. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
