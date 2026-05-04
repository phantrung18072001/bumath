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
