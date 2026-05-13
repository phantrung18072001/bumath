-- Phase 18 Plan 01 - Mock Exam System foundation

CREATE TYPE public.exam_session_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE public.exam_session_type AS ENUM ('monthly', 'quarterly');
CREATE TYPE public.exam_choice AS ENUM ('A', 'B', 'C', 'D');

CREATE TABLE public.exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  session_type public.exam_session_type NOT NULL,
  status public.exam_session_status NOT NULL DEFAULT 'draft',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exam_sessions_title_not_empty CHECK (btrim(title) <> ''),
  CONSTRAINT exam_sessions_valid_window CHECK (ends_at > starts_at)
);

CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id uuid NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  prompt_latex text,
  image_url text,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exam_questions_prompt_not_empty CHECK (btrim(prompt) <> ''),
  CONSTRAINT exam_questions_order_index_min CHECK (order_index >= 1),
  CONSTRAINT exam_questions_unique_order UNIQUE (exam_session_id, order_index)
);

CREATE TABLE public.exam_question_answers (
  question_id uuid PRIMARY KEY REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  correct_choice public.exam_choice NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id uuid NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  answers_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_score integer,
  score_10 numeric(4,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_session_id, user_id)
);

CREATE INDEX exam_questions_session_order_idx
  ON public.exam_questions (exam_session_id, order_index);

CREATE INDEX exam_attempts_session_user_idx
  ON public.exam_attempts (exam_session_id, user_id);


ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and teacher manage exam sessions"
  ON public.exam_sessions
  FOR ALL
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Students can read open published sessions"
  ON public.exam_sessions
  FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() = 'student'
    AND status = 'published'
    AND now() >= starts_at
    AND now() <= ends_at
  );

CREATE POLICY "Admin and teacher manage exam questions"
  ON public.exam_questions
  FOR ALL
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Students can read questions of open published sessions"
  ON public.exam_questions
  FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() = 'student'
    AND EXISTS (
      SELECT 1
      FROM public.exam_sessions s
      WHERE s.id = exam_questions.exam_session_id
        AND s.status = 'published'
        AND now() >= s.starts_at
        AND now() <= s.ends_at
    )
  );

CREATE POLICY "Admin and teacher manage question answers"
  ON public.exam_question_answers
  FOR ALL
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin and teacher manage exam attempts"
  ON public.exam_attempts
  FOR ALL
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Students can read own exam attempts"
  ON public.exam_attempts
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'student' AND user_id = auth.uid());

CREATE POLICY "Students can create own exam attempts"
  ON public.exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'student' AND user_id = auth.uid());

CREATE POLICY "Students can update own unsubmitted attempts"
  ON public.exam_attempts
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'student' AND user_id = auth.uid() AND submitted_at IS NULL)
  WITH CHECK (public.get_my_role() = 'student' AND user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.assert_exam_session_not_started(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.exam_attempts ea
    WHERE ea.exam_session_id = p_session_id
  ) THEN
    RAISE EXCEPTION 'Cannot modify questions/answers after any attempt has started.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_guard_exam_questions_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  v_session_id := COALESCE(NEW.exam_session_id, OLD.exam_session_id);
  PERFORM public.assert_exam_session_not_started(v_session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_guard_exam_answers_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  SELECT eq.exam_session_id INTO v_session_id
  FROM public.exam_questions eq
  WHERE eq.id = COALESCE(NEW.question_id, OLD.question_id);

  PERFORM public.assert_exam_session_not_started(v_session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_guard_exam_session_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.exam_attempts ea WHERE ea.exam_session_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete exam session after attempts started.';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_exam_questions_mutation ON public.exam_questions;
CREATE TRIGGER trg_guard_exam_questions_mutation
  BEFORE UPDATE OR DELETE ON public.exam_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_guard_exam_questions_mutation();

DROP TRIGGER IF EXISTS trg_guard_exam_answers_mutation ON public.exam_question_answers;
CREATE TRIGGER trg_guard_exam_answers_mutation
  BEFORE UPDATE OR DELETE ON public.exam_question_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_guard_exam_answers_mutation();

DROP TRIGGER IF EXISTS trg_guard_exam_session_delete ON public.exam_sessions;
CREATE TRIGGER trg_guard_exam_session_delete
  BEFORE DELETE ON public.exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_guard_exam_session_delete();

CREATE OR REPLACE FUNCTION public.publish_exam_session(p_session_id uuid)
RETURNS public.exam_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_session public.exam_sessions;
  v_question_count integer;
  v_answered_count integer;
BEGIN
  v_role := public.get_my_role();
  IF v_role NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Only admin/teacher can publish exam sessions.';
  END IF;

  SELECT * INTO v_session
  FROM public.exam_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exam session not found.';
  END IF;

  SELECT count(*) INTO v_question_count
  FROM public.exam_questions q
  WHERE q.exam_session_id = p_session_id;

  IF v_question_count < 1 THEN
    RAISE EXCEPTION 'Cannot publish exam session without questions.';
  END IF;

  SELECT count(*) INTO v_answered_count
  FROM public.exam_questions q
  JOIN public.exam_question_answers a ON a.question_id = q.id
  WHERE q.exam_session_id = p_session_id;

  IF v_answered_count <> v_question_count THEN
    RAISE EXCEPTION 'Cannot publish exam session: every question must have one valid answer.';
  END IF;

  UPDATE public.exam_sessions
  SET status = 'published', updated_at = now()
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  RETURN v_session;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_exam_attempt(p_session_id uuid)
RETURNS public.exam_attempts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_uid uuid;
  v_session public.exam_sessions;
  v_attempt public.exam_attempts;
BEGIN
  v_role := public.get_my_role();
  v_uid := auth.uid();

  IF v_role <> 'student' THEN
    RAISE EXCEPTION 'Only students can start an exam attempt.';
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

CREATE OR REPLACE FUNCTION public.save_exam_attempt_answers(p_attempt_id uuid, p_answers jsonb)
RETURNS public.exam_attempts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_uid uuid;
  v_attempt public.exam_attempts;
BEGIN
  v_role := public.get_my_role();
  v_uid := auth.uid();

  IF v_role <> 'student' THEN
    RAISE EXCEPTION 'Only students can save answers.';
  END IF;

  UPDATE public.exam_attempts ea
  SET answers_payload = COALESCE(p_answers, '{}'::jsonb),
      updated_at = now()
  WHERE ea.id = p_attempt_id
    AND ea.user_id = v_uid
    AND ea.submitted_at IS NULL
  RETURNING * INTO v_attempt;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found or already submitted.';
  END IF;

  RETURN v_attempt;
END;
$$;

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

  IF now() > v_session.ends_at THEN
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
