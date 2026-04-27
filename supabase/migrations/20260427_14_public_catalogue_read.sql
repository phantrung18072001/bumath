-- Migration: Allow public (anon) read access to courses for catalogue browsing
-- Phase 6 UX Polish — unauthenticated visitors can browse the course catalogue

-- Allow anonymous users to read courses (title, description, target_grade, slug)
CREATE POLICY "public_read_courses"
  ON courses FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read chapters (needed for course TOC preview)
CREATE POLICY "public_read_chapters"
  ON chapters FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read lesson titles (needed for course TOC preview)
-- Note: video_url (YouTube embeds) and assignment_path are not secret
CREATE POLICY "public_read_lessons"
  ON lessons FOR SELECT
  TO anon
  USING (true);
