-- Phase 7 gap closure: Remove approval_status from profiles
-- User decision (UAT tests 2/3): Access controlled by enrollment, not account approval.
-- Idempotent: safe to re-run. All statements use IF EXISTS guards.

-- ============================================================
-- 1. FIX student_upload_own_submissions storage policy
--    Remove: AND profiles.approval_status = 'approved'
--    Keep:   role = 'student' check only
-- ============================================================
DROP POLICY IF EXISTS "student_upload_own_submissions" ON storage.objects;

CREATE POLICY "student_upload_own_submissions"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignments' AND
    (storage.foldername(name))[1] = 'submissions' AND
    (storage.foldername(name))[2] = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'student'
    )
  );

-- ============================================================
-- 2. REPLACE is_approved_user() catalogue policies
--    Old: is_approved_user() (queries approval_status = 'approved')
--    New: auth.uid() IS NOT NULL (any authenticated user)
-- ============================================================
DROP POLICY IF EXISTS "approved_user_read_all_courses" ON courses;
DROP POLICY IF EXISTS "approved_user_read_published_courses" ON courses;
DROP POLICY IF EXISTS "approved_user_read_all_chapters" ON chapters;
DROP POLICY IF EXISTS "approved_user_read_all_lessons" ON lessons;

CREATE POLICY "authenticated_read_published_courses"
  ON courses FOR SELECT
  TO authenticated
  USING (is_published = true AND auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_read_all_chapters"
  ON chapters FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_read_all_lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 3. DROP is_approved_user() helper function
--    (defined in 20260324_04_course_management_rls.sql)
--    No longer needed after policies above are replaced.
-- ============================================================
DROP FUNCTION IF EXISTS is_approved_user();

-- ============================================================
-- 4. DROP approval_status index
-- ============================================================
DROP INDEX IF EXISTS idx_profiles_approval_status;

-- ============================================================
-- 5. DROP approval_status column (the goal of this migration)
-- ============================================================
ALTER TABLE public.profiles DROP COLUMN IF EXISTS approval_status;
