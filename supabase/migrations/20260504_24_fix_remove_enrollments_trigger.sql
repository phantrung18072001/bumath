-- Migration 24: Fix remove_enrollments_for_package trigger
--
-- BUG: When admin deletes a package row (PackagesPage → Xóa gói học),
-- PostgreSQL CASCADE-deletes package_grades BEFORE cascade-deleting
-- user_packages. The AFTER DELETE trigger on user_packages fires after
-- package_grades is already gone, so the query:
--
--   JOIN package_grades pg ON pg.package_id = OLD.package_id
--
-- returns zero rows → no enrollments are removed → student can still see
-- courses in the list, but videos are locked (has_grade_access() correctly
-- returns false via user_packages check).
--
-- FIX: Rewrite the trigger to not depend on the deleted package's grades.
-- Instead, delete all enrollments for this user that are NOT covered by
-- any of their remaining packages. This works for both:
--   (a) Revoke-only: admin removes user_packages row (normal revoke flow)
--   (b) Package delete: admin deletes packages row → cascade triggers this
--
-- DATA FIX: Also clean up any stale enrollments left by the old buggy trigger.

-- ── 1. Fix the trigger function ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.remove_enrollments_for_package()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete enrollments for this user where NO remaining package covers the course.
  -- Works regardless of whether package_grades still exists for OLD.package_id.
  DELETE FROM public.enrollments e
  WHERE e.user_id = OLD.user_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_packages up
      JOIN public.package_grades pg ON pg.package_id = up.package_id
      JOIN public.courses c ON c.target_grade = pg.grade
      WHERE up.user_id = OLD.user_id
        AND c.id = e.course_id
    );
  RETURN OLD;
END;
$$;

-- ── 2. Data fix: remove stale enrollments for users with no packages ──────────
-- Cleans up enrollments that the old buggy trigger failed to remove.
DELETE FROM public.enrollments e
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_packages up
  JOIN public.package_grades pg ON pg.package_id = up.package_id
  JOIN public.courses c ON c.target_grade = pg.grade
  WHERE up.user_id = e.user_id
    AND c.id = e.course_id
);
