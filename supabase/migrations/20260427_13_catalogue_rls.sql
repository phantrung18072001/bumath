-- Migration: Broaden course/chapter/lesson SELECT policies for catalogue browsing
-- Phase 6 UX Polish — allows all approved users to browse the full course catalogue
-- Previous state: Students could only query courses they were enrolled in
-- New state: All approved users can query all courses/chapters/lessons for catalogue view

-- Drop old restrictive student policies
DROP POLICY IF EXISTS "student_read_enrolled_courses" ON courses;
DROP POLICY IF EXISTS "student_read_enrolled_chapters" ON chapters;
DROP POLICY IF EXISTS "student_read_enrolled_lessons" ON lessons;

-- Create new permissive policies for approved users
-- Note: is_approved_user() is a SECURITY DEFINER helper from migration 01

CREATE POLICY "approved_user_read_all_courses"
  ON courses FOR SELECT
  USING (is_approved_user());

CREATE POLICY "approved_user_read_all_chapters"
  ON chapters FOR SELECT
  USING (is_approved_user());

CREATE POLICY "approved_user_read_all_lessons"
  ON lessons FOR SELECT
  USING (is_approved_user());

-- Security consideration (documented in RESEARCH.md):
-- - YouTube embed URLs are not secret (public videos)
-- - Assignment PDFs/images in assignments bucket already had permissive read policy
-- - Product uses manual enrollment (admin controls access), not payment-gated content
-- - The "lock" is enrollment (teacher assigns students), not RLS
-- - Preview mode in CourseDetailPage shows locked UI for non-enrolled students
