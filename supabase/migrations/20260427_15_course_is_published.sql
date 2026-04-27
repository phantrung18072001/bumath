-- Migration: Add is_published column to courses for publish/draft control
-- Admin can toggle published state; only published courses visible to students and public

-- Add column (default false = draft)
ALTER TABLE courses ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;

-- Mark all existing courses as published so nothing disappears for current students
UPDATE courses SET is_published = true;

-- Drop the old broad approved-user read policy (it showed all courses regardless of publish state)
DROP POLICY IF EXISTS "approved_user_read_all_courses" ON courses;

-- New policy: approved users (students/teachers) only see published courses
-- Admin is already covered by admin_all_courses (FOR ALL) from migration 04
CREATE POLICY "approved_user_read_published_courses"
  ON courses FOR SELECT
  USING (is_published = true AND is_approved_user());
