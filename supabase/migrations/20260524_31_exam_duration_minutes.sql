-- Add exam duration (minutes) separated from open window and enforce deadline on submit.

ALTER TABLE public.exam_sessions
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 45;

ALTER TABLE public.exam_sessions
  DROP CONSTRAINT IF EXISTS exam_sessions_duration_minutes_min;

ALTER TABLE public.exam_sessions
  ADD CONSTRAINT exam_sessions_duration_minutes_min CHECK (duration_minutes >= 1);

CREATE OR REPLACE FUNCTION public.submit_exam_attempt(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_uid uuid;
  v_attempt public.exam_attempts;
  v_session public.exam_sessions;
  v_total integer;
  v_correct integer;
  v_score_10 numeric(4,2);
  v_per_question jsonb;
  v_deadline timestamptz;
BEGIN
  v_role := public.get_my_role();
  v_uid := auth.uid();

  IF v_role <> 'student' THEN
    RAISE EXCEPTION 'Only students can submit exam attempts.';
  END IF;

  SELECT * INTO v_attempt
  FROM public.exam_attempts ea
  WHERE ea.id = p_attempt_id
    AND ea.user_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found.';
  END IF;

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

  v_deadline := LEAST(
    v_session.ends_at,
    v_attempt.started_at + make_interval(mins => COALESCE(v_session.duration_minutes, 45))
  );

  IF now() > v_deadline THEN
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
        'is_correct', selected_choice = correct_choice::text
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

  RETURN jsonb_build_object(
    'raw_score', v_attempt.raw_score,
    'score_10', v_attempt.score_10,
    'per_question', COALESCE(v_per_question, '[]'::jsonb)
  );
END;
$$;
