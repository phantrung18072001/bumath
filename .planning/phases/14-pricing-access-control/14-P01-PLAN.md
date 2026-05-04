---
plan: P01
phase: 14
wave: 1
depends_on: []
autonomous: false
files_modified:
  - supabase/migrations/20260504_18_packages_schema.sql
  - supabase/migrations/20260504_19_backfill_user_packages.sql
  - supabase/migrations/20260504_20_packages_rls_trigger.sql
requirements:
  - PRICE-01
  - PRICE-02
  - PRICE-03
  - VIDEO-01

must_haves:
  truths:
    - "tables `packages`, `package_grades`, `user_packages` exist in Supabase DB"
    - "RLS is enabled on all 3 new tables"
    - "All existing enrolled students have ≥1 user_packages row (backfill complete)"
    - "lessons_view masks video_url to NULL for students without a matching package"
    - "INSERT trigger on user_packages auto-creates enrollments for grade-matching published courses"
    - "DELETE trigger on user_packages removes enrollments not covered by any remaining package"
  artifacts:
    - path: supabase/migrations/20260504_18_packages_schema.sql
      provides: "Schema for packages, package_grades, user_packages tables + RLS"
    - path: supabase/migrations/20260504_19_backfill_user_packages.sql
      provides: "Backfill existing enrollments → user_packages records"
    - path: supabase/migrations/20260504_20_packages_rls_trigger.sql
      provides: "has_grade_access() function, lessons_view, enrollment triggers"
  key_links:
    - from: "lessons_view"
      to: "has_grade_access()"
      via: "CASE WHEN in view definition"
    - from: "user_packages INSERT trigger"
      to: "enrollments table"
      via: "add_enrollments_for_package()"
---

# P01 — Database Schema: Packages + Access Control

**Goal:** Write 3 migration SQL files and execute them in Supabase Dashboard in strict order (18 → 19 → 20). File 19 (backfill) must run before File 20 (RLS) to avoid locking out existing students.

---

<task id="T01" type="execute">
  <title>Write migration file 18 — packages schema</title>

  <read_first>
    - supabase/migrations/20260324_03_course_management_schema.sql (table + index + RLS pattern)
    - supabase/migrations/20260429_16_profiles_rls.sql (get_my_role() RLS policy pattern)
    - .planning/phases/14-pricing-access-control/14-CONTEXT.md § D-01, D-02, D-04 (schema decisions)
  </read_first>

  <action>
Create file `supabase/migrations/20260504_18_packages_schema.sql` with this exact content:

```sql
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
```
  </action>

  <acceptance_criteria>
    - [ ] File `supabase/migrations/20260504_18_packages_schema.sql` exists
    - [ ] `grep -c "CREATE TABLE IF NOT EXISTS public.packages" supabase/migrations/20260504_18_packages_schema.sql` returns 1
    - [ ] `grep -c "CREATE TABLE IF NOT EXISTS public.package_grades" supabase/migrations/20260504_18_packages_schema.sql` returns 1
    - [ ] `grep -c "CREATE TABLE IF NOT EXISTS public.user_packages" supabase/migrations/20260504_18_packages_schema.sql` returns 1
    - [ ] `grep -c "ENABLE ROW LEVEL SECURITY" supabase/migrations/20260504_18_packages_schema.sql` returns 3
    - [ ] File contains string `grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced')`
    - [ ] File contains string `UNIQUE (user_id, package_id)`
  </acceptance_criteria>
</task>

---

<task id="T02" type="execute">
  <title>Write migration file 19 — backfill user_packages</title>

  <read_first>
    - .planning/phases/14-pricing-access-control/14-CONTEXT.md § D-10 (backfill approach)
    - .planning/phases/14-pricing-access-control/14-VALIDATION.md § Migration Verification (verification query)
    - supabase/migrations/20260504_18_packages_schema.sql (tables that must exist before this runs)
  </read_first>

  <action>
Create file `supabase/migrations/20260504_19_backfill_user_packages.sql` with this exact content:

```sql
-- Migration 19: Backfill user_packages from existing enrollments
-- MUST run AFTER migration 18 (schema) and BEFORE migration 20 (RLS/triggers)
-- Logic: for each student + grade combination in existing enrollments,
--        find or create a legacy package, then create user_packages record.

DO $$
DECLARE
  v_grade      text;
  v_package_id uuid;
  v_user_id    uuid;
  v_pkg_name   text;
BEGIN
  -- Iterate over every grade that has at least one enrollment
  FOR v_grade IN
    SELECT DISTINCT c.target_grade
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    ORDER BY c.target_grade
  LOOP
    -- Determine the legacy package name for this grade
    v_pkg_name := CASE v_grade
      WHEN 'grade_7'   THEN 'Lớp 7 Legacy'
      WHEN 'grade_8'   THEN 'Lớp 8 Legacy'
      WHEN 'grade_9'   THEN 'Lớp 9 Legacy'
      WHEN 'advanced'  THEN 'Ôn chuyên Legacy'
      ELSE v_grade || ' Legacy'
    END;

    -- Find or create the legacy package for this grade
    SELECT id INTO v_package_id
    FROM public.packages
    WHERE name = v_pkg_name;

    IF v_package_id IS NULL THEN
      INSERT INTO public.packages (name, description, price_vnd)
      VALUES (v_pkg_name, 'Gói học cũ (backfill tự động)', 0)
      RETURNING id INTO v_package_id;

      -- Add grade coverage for the new legacy package
      INSERT INTO public.package_grades (package_id, grade)
      VALUES (v_package_id, v_grade);
    END IF;

    -- Create user_packages for every student enrolled in courses of this grade
    FOR v_user_id IN
      SELECT DISTINCT e.user_id
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE c.target_grade = v_grade
    LOOP
      INSERT INTO public.user_packages (user_id, package_id)
      VALUES (v_user_id, v_package_id)
      ON CONFLICT (user_id, package_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Backfilled grade % (package: %)', v_grade, v_pkg_name;
  END LOOP;
END;
$$;

-- ── Verification query (run after migration to confirm) ───────────
-- SELECT u.email, p.name AS package_name, pg.grade
-- FROM public.user_packages up
-- JOIN auth.users u ON u.id = up.user_id
-- JOIN public.packages p ON p.id = up.package_id
-- JOIN public.package_grades pg ON pg.package_id = up.package_id
-- ORDER BY u.email, pg.grade;
```
  </action>

  <acceptance_criteria>
    - [ ] File `supabase/migrations/20260504_19_backfill_user_packages.sql` exists
    - [ ] `grep -c "ON CONFLICT (user_id, package_id) DO NOTHING" supabase/migrations/20260504_19_backfill_user_packages.sql` returns 1
    - [ ] File contains string `MUST run AFTER migration 18`
    - [ ] File contains string `Lớp 7 Legacy`
    - [ ] File contains the verification query comment block
  </acceptance_criteria>
</task>

---

<task id="T03" type="execute">
  <title>Write migration file 20 — has_grade_access, lessons_view, triggers</title>

  <read_first>
    - .planning/phases/14-pricing-access-control/14-CONTEXT.md § D-05, D-06, D-07, D-09 (RLS architecture)
    - .planning/phases/14-pricing-access-control/14-VALIDATION.md § Pitfall 1 (RLS before backfill), Pitfall 2 (view security_invoker), Pitfall 3 (multi-package revoke)
    - supabase/migrations/20260324_03_course_management_schema.sql lines 26–36 (lessons table columns: id, chapter_id, title, description, video_url, assignment_path, order_index, created_at, updated_at — NO slug column)
  </read_first>

  <action>
Create file `supabase/migrations/20260504_20_packages_rls_trigger.sql` with this exact content.

CRITICAL: The `lessons` table has NO `slug` column. The view must NOT include `slug`.
CRITICAL: Use `security_invoker = true, security_barrier = true` on the view (Pitfall 2).
CRITICAL: The revoke trigger must use NOT EXISTS sub-query (Pitfall 3 — multi-package safety).

```sql
-- Migration 20: has_grade_access(), lessons_view, enrollment triggers
-- MUST run AFTER migration 19 (backfill) — otherwise existing students lose video access

-- ── 1. has_grade_access() helper function ────────────────────────
-- SECURITY DEFINER: runs as definer, not caller → bypasses RLS on user_packages
-- Checks: does auth.uid() own any package covering this grade?
CREATE OR REPLACE FUNCTION public.has_grade_access(p_grade TEXT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_packages up
    JOIN package_grades pg ON pg.package_id = up.package_id
    WHERE up.user_id = auth.uid()
      AND pg.grade = p_grade
  );
$$;

-- ── 2. lessons_view — column-level masking via security view ──────
-- security_invoker=true: view respects caller's RLS on underlying tables
-- security_barrier=true: prevents optimizer from pushing predicates through view
-- video_url is NULL when student has no package for the lesson's course grade (D-05)
CREATE OR REPLACE VIEW public.lessons_view
  WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  l.id,
  l.chapter_id,
  l.title,
  l.description,
  l.order_index,
  l.assignment_path,
  CASE
    WHEN public.has_grade_access(
      (
        SELECT c.target_grade
        FROM courses c
        JOIN chapters ch ON ch.course_id = c.id
        WHERE ch.id = l.chapter_id
      )
    ) THEN l.video_url
    ELSE NULL
  END AS video_url,
  l.created_at,
  l.updated_at
FROM public.lessons l;

-- ── 3. Grant SELECT on lessons_view to authenticated role ─────────
GRANT SELECT ON public.lessons_view TO authenticated;

-- ── 4. Enrollment INSERT trigger ─────────────────────────────────
-- On INSERT into user_packages → auto-enroll student in all published
-- courses whose target_grade is covered by the new package (D-09)
CREATE OR REPLACE FUNCTION public.add_enrollments_for_package()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.enrollments (user_id, course_id)
  SELECT NEW.user_id, c.id
  FROM public.courses c
  JOIN public.package_grades pg ON pg.package_id = NEW.package_id
  WHERE c.target_grade = pg.grade
    AND c.is_published = true
  ON CONFLICT (user_id, course_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_enrollments_for_package ON public.user_packages;
CREATE TRIGGER trg_add_enrollments_for_package
  AFTER INSERT ON public.user_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.add_enrollments_for_package();

-- ── 5. Enrollment DELETE trigger ─────────────────────────────────
-- On DELETE from user_packages → remove enrollments ONLY if not covered
-- by another remaining package (handles multi-package case, D-02 / Pitfall 3)
CREATE OR REPLACE FUNCTION public.remove_enrollments_for_package()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.enrollments e
  WHERE e.user_id = OLD.user_id
    AND e.course_id IN (
      SELECT c.id
      FROM public.courses c
      JOIN public.package_grades pg ON pg.package_id = OLD.package_id
      WHERE c.target_grade = pg.grade
    )
    AND NOT EXISTS (
      -- Keep enrollment if another remaining package also covers this course
      SELECT 1
      FROM public.user_packages up2
      JOIN public.package_grades pg2 ON pg2.package_id = up2.package_id
      JOIN public.courses c2 ON c2.target_grade = pg2.grade
      WHERE up2.user_id = OLD.user_id
        AND up2.id != OLD.id
        AND c2.id = e.course_id
    );
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_remove_enrollments_for_package ON public.user_packages;
CREATE TRIGGER trg_remove_enrollments_for_package
  AFTER DELETE ON public.user_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_enrollments_for_package();
```
  </action>

  <acceptance_criteria>
    - [ ] File `supabase/migrations/20260504_20_packages_rls_trigger.sql` exists
    - [ ] `grep -c "has_grade_access" supabase/migrations/20260504_20_packages_rls_trigger.sql` returns at least 3 (definition + 2 usages)
    - [ ] `grep -c "security_invoker = true" supabase/migrations/20260504_20_packages_rls_trigger.sql` returns 1
    - [ ] `grep -c "security_barrier = true" supabase/migrations/20260504_20_packages_rls_trigger.sql` returns 1
    - [ ] `grep -c "NOT EXISTS" supabase/migrations/20260504_20_packages_rls_trigger.sql` returns 1
    - [ ] File contains string `GRANT SELECT ON public.lessons_view TO authenticated`
    - [ ] File does NOT contain the word `slug` (lessons table has no slug column)
    - [ ] File contains both `trg_add_enrollments_for_package` and `trg_remove_enrollments_for_package`
  </acceptance_criteria>
</task>

---

<task id="T04" type="checkpoint:human-action">
  <title>[BLOCKING] Execute migrations in Supabase Dashboard — strict order 18 → 19 → 20</title>

  <action>
⚠️ BLOCKING STEP — Frontend will silently fail without this. Execute migrations manually.

**WHY ORDER MATTERS:**
- File 18 creates the tables (19 and 20 depend on them)
- File 19 backfills existing students → user_packages (must happen BEFORE File 20 enables RLS-based access)
- File 20 activates has_grade_access() and lessons_view (safe only after backfill)
- If 20 runs before 19: all existing students lose video access immediately

**Steps:**

1. Open Supabase Dashboard → Project → SQL Editor

2. **Run File 18 first:**
   - Copy full content of `supabase/migrations/20260504_18_packages_schema.sql`
   - Paste into SQL Editor → Run
   - Verify: Go to Table Editor → confirm tables `packages`, `package_grades`, `user_packages` appear

3. **Run File 19 second:**
   - Copy full content of `supabase/migrations/20260504_19_backfill_user_packages.sql`
   - Paste into SQL Editor → Run
   - Verify: Run the verification query at the bottom of the file (uncomment it). Confirm enrolled students appear with ≥1 legacy package.

4. **Run File 20 third:**
   - Copy full content of `supabase/migrations/20260504_20_packages_rls_trigger.sql`
   - Paste into SQL Editor → Run
   - Verify: Run `SELECT public.has_grade_access('grade_7');` — should return `true` for a student with grade_7 enrollments, `false` for a student with no packages.

**Resume:** Type "migrations done" after all 3 files execute successfully.
  </action>

  <acceptance_criteria>
    - [ ] Admin confirms all 3 migrations executed without errors in Supabase Dashboard
    - [ ] Tables `packages`, `package_grades`, `user_packages` visible in Table Editor
    - [ ] Verification query from File 19 returns rows (enrolled students have user_packages)
    - [ ] `SELECT public.has_grade_access('grade_7')` executes without error
  </acceptance_criteria>
</task>

---

## Must Haves

- [ ] 3 migration files exist in `supabase/migrations/` with correct naming
- [ ] All 3 migrations successfully executed in Supabase Dashboard (in order: 18 → 19 → 20)
- [ ] Tables `packages`, `package_grades`, `user_packages` exist with RLS enabled
- [ ] Existing enrolled students have ≥1 `user_packages` row (backfill confirmed)
- [ ] `lessons_view` exists and uses `security_invoker = true, security_barrier = true`
- [ ] `has_grade_access()` function exists and returns correct boolean
- [ ] Both enrollment triggers (`trg_add_enrollments_for_package`, `trg_remove_enrollments_for_package`) exist

## PLAN COMPLETE
