-- Migration 23: Restrict direct lessons table access + fix view security mode
--
-- PROBLEM 1 (found in Phase 14 audit):
--   lessons_view masks video_url via CASE WHEN + has_grade_access(), but it
--   uses security_invoker=true — meaning the view runs in the CALLER's context.
--   Because migrations 13-14 still grant SELECT on `lessons` to all authenticated
--   and anon users, students can bypass lessons_view entirely by querying the
--   `lessons` table directly and receiving unmasked video_url.
--
-- PROBLEM 2 (TC12 bug):
--   If video_url was saved as '' (empty string) instead of NULL, has_video
--   incorrectly returns true even though the teacher never added a video.
--   The student then sees "Bạn chưa có gói học phù hợp" instead of nothing.
--
-- FIX:
--   1. Sanitize existing data: set video_url = NULL where it was saved as ''.
--   2. Drop old open-access RLS policies on lessons table.
--   3. Add new policy granting direct lessons access ONLY to admin/teacher.
--   4. Re-create lessons_view WITHOUT security_invoker (defaults to security_definer),
--      treating empty strings as NULL in both video_url output and has_video.
--
-- RUN: Supabase Dashboard → SQL Editor → paste and run.

-- ── Step 1: Clean up empty-string video_url in existing data ────────────────
UPDATE public.lessons SET video_url = NULL WHERE video_url = '';

-- ── Step 2: Remove open-access policies from lessons ────────────────────────
DROP POLICY IF EXISTS "public_read_lessons"               ON public.lessons;
DROP POLICY IF EXISTS "approved_user_read_all_lessons"    ON public.lessons;

-- ── Step 3: Admin and teacher can still read lessons table directly ──────────
CREATE POLICY "admin_teacher_read_lessons" ON public.lessons
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- ── Step 4: Re-create lessons_view without security_invoker ──────────────────
-- Without security_invoker=true the view executes as the VIEW OWNER (postgres /
-- supabase_admin), which has BYPASSRLS, so students can query the view even
-- though they can no longer read `lessons` directly.
-- NULLIF(l.video_url, '') ensures empty strings are treated as NULL everywhere.
DROP VIEW IF EXISTS public.lessons_view;

CREATE VIEW public.lessons_view
  WITH (security_barrier = true)   -- security_invoker intentionally OMITTED (definer mode)
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
    ) THEN NULLIF(l.video_url, '')
    ELSE NULL
  END AS video_url,
  l.created_at,
  l.updated_at,
  (l.video_url IS NOT NULL AND l.video_url != '') AS has_video
FROM public.lessons l;

GRANT SELECT ON public.lessons_view TO authenticated;
