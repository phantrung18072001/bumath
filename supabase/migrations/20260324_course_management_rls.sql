-- RLS policies for course management tables

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
-- Uses the profiles table created in phase 2
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Helper: check if current user is approved student or admin
CREATE OR REPLACE FUNCTION is_approved_user()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND approval_status = 'approved'
  );
$$;

-- ─── COURSES ────────────────────────────────────────────────────────────────

-- Admin: full access
CREATE POLICY "admin_all_courses"
  ON courses FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Student: can read courses they are enrolled in
CREATE POLICY "student_read_enrolled_courses"
  ON courses FOR SELECT
  USING (
    is_approved_user() AND
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = courses.id
        AND enrollments.user_id = auth.uid()
    )
  );

-- ─── CHAPTERS ────────────────────────────────────────────────────────────────

-- Admin: full access
CREATE POLICY "admin_all_chapters"
  ON chapters FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Student: can read chapters of courses they are enrolled in
CREATE POLICY "student_read_enrolled_chapters"
  ON chapters FOR SELECT
  USING (
    is_approved_user() AND
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = chapters.course_id
        AND enrollments.user_id = auth.uid()
    )
  );

-- ─── LESSONS ─────────────────────────────────────────────────────────────────

-- Admin: full access
CREATE POLICY "admin_all_lessons"
  ON lessons FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Student: can read lessons of chapters in enrolled courses
CREATE POLICY "student_read_enrolled_lessons"
  ON lessons FOR SELECT
  USING (
    is_approved_user() AND
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN chapters ON chapters.id = lessons.chapter_id
      WHERE enrollments.course_id = chapters.course_id
        AND enrollments.user_id = auth.uid()
    )
  );

-- ─── ENROLLMENTS ─────────────────────────────────────────────────────────────

-- Admin: full access (can enroll/unenroll students)
CREATE POLICY "admin_all_enrollments"
  ON enrollments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Student: can read own enrollment records
CREATE POLICY "student_read_own_enrollments"
  ON enrollments FOR SELECT
  USING (user_id = auth.uid());
