-- Auto-close expired exam sessions (lazy evaluation in fetch functions).
-- Submit is allowed up to ends_at + 5 minutes grace period.

-- 1. Helper: close any published sessions whose ends_at has passed
CREATE OR REPLACE FUNCTION public.close_expired_exam_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.exam_sessions
  SET status = 'closed', updated_at = now()
  WHERE status = 'published' AND ends_at < now();
$$;

-- 2. Student list: auto-close expired sessions before returning
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Lazily close sessions whose window has passed
  -- Qualify with table name to avoid ambiguity with RETURNS TABLE 'status' column
  UPDATE public.exam_sessions es
  SET status = 'closed', updated_at = now()
  WHERE es.status = 'published' AND es.ends_at < now();

  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.grade::text,
    s.session_type::text,
    CASE
      WHEN ea.submitted_at IS NOT NULL THEN 'done'
      WHEN s.status = 'closed' THEN 'closed'
      ELSE 'open'
    END AS status,
    s.duration_minutes,
    s.starts_at,
    s.ends_at,
    ea.score_10
  FROM public.exam_sessions s
  LEFT JOIN public.exam_attempts ea
    ON ea.exam_session_id = s.id
   AND ea.user_id = p_user_id
  WHERE s.status = 'published'
     OR (s.status = 'closed' AND ea.user_id IS NOT NULL)
  ORDER BY s.starts_at ASC;
END;
$$;

-- 3. Admin list: also auto-close on fetch so status column stays accurate
CREATE OR REPLACE FUNCTION public.fetch_admin_exam_sessions_with_close()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.exam_sessions
  SET status = 'closed', updated_at = now()
  WHERE status = 'published' AND ends_at < now();
$$;

-- 4. Submit: allow up to ends_at + 5 minutes, then auto-close session after submit
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_attempt public.exam_attempts;
  v_session public.exam_sessions;
  v_total integer;
  v_correct integer;
  v_score_10 numeric(4,2);
  v_per_question jsonb;
  v_hard_deadline timestamptz;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_attempt
  FROM public.exam_attempts ea
  WHERE ea.id = p_attempt_id
    AND ea.user_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found.';
  END IF;

  -- Already submitted: return existing result
  IF v_attempt.submitted_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'raw_score', v_attempt.raw_score,
      'score_10', v_attempt.score_10,
      'per_question', COALESCE(v_attempt.answers_payload->'per_question', '[]'::jsonb)
    );
  END IF;

  SELECT * INTO v_session
  FROM public.exam_sessions s
  WHERE s.id = v_attempt.exam_session_id;

  -- Hard deadline: ends_at + 5 minutes grace period
  v_hard_deadline := v_session.ends_at + interval '5 minutes';

  IF now() > v_hard_deadline THEN
    RAISE EXCEPTION 'Exam submission deadline has passed.';
  END IF;

  WITH question_checks AS (
    SELECT
      q.id AS question_id,
      a.correct_choice,
      COALESCE(v_attempt.answers_payload ->> q.id::text, '') AS selected_choice
    FROM public.exam_questions q
    JOIN public.exam_question_answers a ON a.question_id = q.id
    WHERE q.exam_session_id = v_attempt.exam_session_id
  )
  SELECT
    count(*),
    count(*) FILTER (WHERE selected_choice = correct_choice::text),
    jsonb_agg(
      jsonb_build_object(
        'question_id', question_id,
        'is_correct', selected_choice = correct_choice::text,
        'correct_choice', correct_choice::text,
        'selected_choice', selected_choice
      )
      ORDER BY question_id
    )
  INTO v_total, v_correct, v_per_question
  FROM question_checks;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Exam session has no gradable questions.';
  END IF;

  v_score_10 := round((v_correct::numeric * 10.0) / v_total, 2);

  UPDATE public.exam_attempts
  SET submitted_at = now(),
      raw_score = v_correct,
      score_10 = v_score_10,
      answers_payload = jsonb_set(COALESCE(answers_payload, '{}'::jsonb), '{per_question}', COALESCE(v_per_question, '[]'::jsonb), true),
      updated_at = now()
  WHERE id = v_attempt.id
  RETURNING * INTO v_attempt;

  -- Auto-close session if its window has already ended
  IF now() > v_session.ends_at THEN
    UPDATE public.exam_sessions
    SET status = 'closed', updated_at = now()
    WHERE id = v_session.id AND status = 'published';
  END IF;

  RETURN jsonb_build_object(
    'raw_score', v_attempt.raw_score,
    'score_10', v_attempt.score_10,
    'per_question', COALESCE(v_per_question, '[]'::jsonb)
  );
END;
$$;
