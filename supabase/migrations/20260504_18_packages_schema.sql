-- Migration 18: Packages schema
-- Creates: packages, package_grades, user_packages tables with RLS
-- Must run BEFORE migration 19 (backfill) and 20 (RLS triggers)

-- ── 1. packages table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.packages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  description text,
  price_vnd   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 2. package_grades junction table ────────────────────────────
-- One package can cover multiple grades (D-01)
CREATE TABLE IF NOT EXISTS public.package_grades (
  package_id  uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  grade       text NOT NULL CHECK (grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced')),
  PRIMARY KEY (package_id, grade)
);

-- ── 3. user_packages table ───────────────────────────────────────
-- A student can own multiple packages simultaneously (D-02)
CREATE TABLE IF NOT EXISTS public.user_packages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id  uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, package_id)
);

-- ── 4. Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_package_grades_package_id ON public.package_grades(package_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_user_id ON public.user_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_package_id ON public.user_packages(package_id);

-- ── 5. Enable RLS ────────────────────────────────────────────────
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;

-- ── 6. packages RLS policies ─────────────────────────────────────
-- Admin: full CRUD
CREATE POLICY "admin_all_packages"
  ON public.packages FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- All authenticated users: read packages (needed for profile page + admin assign dialog)
CREATE POLICY "auth_read_packages"
  ON public.packages FOR SELECT TO authenticated
  USING (true);

-- ── 7. package_grades RLS policies ──────────────────────────────
CREATE POLICY "admin_all_package_grades"
  ON public.package_grades FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "auth_read_package_grades"
  ON public.package_grades FOR SELECT TO authenticated
  USING (true);

-- ── 8. user_packages RLS policies ───────────────────────────────
-- Admin: full CRUD (assign / revoke)
CREATE POLICY "admin_all_user_packages"
  ON public.user_packages FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- Student: read own packages only (for profile page)
CREATE POLICY "student_read_own_user_packages"
  ON public.user_packages FOR SELECT TO authenticated
  USING (user_id = auth.uid());
