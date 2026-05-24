-- Student exam list RPC: returns open published sessions plus any sessions the user has attempted,
-- so closed sessions can still show as "Đã làm".

CREATE OR REPLACE FUNCTION public.fetch_student_exam_sessions(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  grade text,
  session_type text,
  status text,
  duration_minutes integer,
  starts_at timestamptz,
  ends_at timestamptz,
  score_10 numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.title,
    s.grade::text,
    s.session_type::text,
    CASE WHEN ea.submitted_at IS NOT NULL THEN 'done' ELSE 'open' END AS status,
    s.duration_minutes,
    s.starts_at,
    s.ends_at,
    ea.score_10
  FROM public.exam_sessions s
  LEFT JOIN public.exam_attempts ea
    ON ea.exam_session_id = s.id
   AND ea.user_id = p_user_id
  WHERE s.status = 'published'
     OR ea.user_id IS NOT NULL
  ORDER BY s.starts_at ASC;
$$;
