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
