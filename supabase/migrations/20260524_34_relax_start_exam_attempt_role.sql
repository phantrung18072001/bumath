-- Relax role validation: allow authenticated users to start exam attempts.

CREATE OR REPLACE FUNCTION public.start_exam_attempt(p_session_id uuid)
RETURNS public.exam_attempts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_session public.exam_sessions;
  v_attempt public.exam_attempts;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_session
  FROM public.exam_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exam session not found.';
  END IF;

  IF v_session.status <> 'published' THEN
    RAISE EXCEPTION 'Exam session is not published.';
  END IF;

  IF now() < v_session.starts_at OR now() > v_session.ends_at THEN
    RAISE EXCEPTION 'Exam session is outside active window.';
  END IF;

  INSERT INTO public.exam_attempts (exam_session_id, user_id, started_at)
  VALUES (p_session_id, v_uid, now())
  RETURNING * INTO v_attempt;

  RETURN v_attempt;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'You already started this exam session.';
END;
$$;
