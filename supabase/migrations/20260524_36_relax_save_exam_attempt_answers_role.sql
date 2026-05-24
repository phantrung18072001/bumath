-- Relax role validation: allow authenticated users to save exam answers.

CREATE OR REPLACE FUNCTION public.save_exam_attempt_answers(p_attempt_id uuid, p_answers jsonb)
RETURNS public.exam_attempts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_attempt public.exam_attempts;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
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
