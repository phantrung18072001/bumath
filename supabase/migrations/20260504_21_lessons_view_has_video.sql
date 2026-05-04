-- Migration 21: Add has_video column to lessons_view
-- Problem: video_url = NULL has two meanings:
--   1. Teacher never set a video (genuine NULL)
--   2. RLS masking — student has no matching package
-- has_video always reflects the true DB state, never masked.
-- Client logic:
--   video_url != null              → show iframe
--   has_video = true, url = null   → show lock (no package access)
--   has_video = false, url = null  → show nothing (no video set by teacher)

-- Must DROP first because PostgreSQL does not allow adding columns in the
-- middle of a view via CREATE OR REPLACE VIEW.
DROP VIEW IF EXISTS public.lessons_view;

CREATE VIEW public.lessons_view
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
  l.updated_at,
  (l.video_url IS NOT NULL) AS has_video
FROM public.lessons l;

GRANT SELECT ON public.lessons_view TO authenticated;
