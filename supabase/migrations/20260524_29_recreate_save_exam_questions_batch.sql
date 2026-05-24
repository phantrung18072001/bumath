-- Hotfix: recreate function with stable OUT signature (avoid ambiguous OUT vars)
-- Required because PostgreSQL cannot ALTER return type via CREATE OR REPLACE.

DROP FUNCTION IF EXISTS public.save_exam_questions_batch(uuid, jsonb);

CREATE FUNCTION public.save_exam_questions_batch(
  p_session_id uuid,
  p_questions jsonb
)
RETURNS TABLE(id uuid, order_index integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_item jsonb;
  v_id uuid;
  v_ids uuid[] := ARRAY[]::uuid[];
  v_correct public.exam_choice;
BEGIN
  v_role := public.get_my_role();
  IF v_role NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Only admin/teacher can save exam questions.';
  END IF;

  PERFORM public.assert_exam_session_not_started(p_session_id);

  IF p_questions IS NULL OR jsonb_typeof(p_questions) <> 'array' THEN
    RAISE EXCEPTION 'p_questions must be a JSON array.';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    v_id := NULLIF(v_item->>'id', '')::uuid;
    v_correct := COALESCE(NULLIF(v_item->>'correct_choice', ''), 'A')::public.exam_choice;

    IF v_id IS NULL THEN
      INSERT INTO public.exam_questions (
        exam_session_id, prompt, prompt_latex, image_url,
        option_a, option_b, option_c, option_d, order_index, updated_at
      ) VALUES (
        p_session_id,
        COALESCE(v_item->>'prompt', ''),
        NULLIF(v_item->>'prompt_latex', ''),
        NULLIF(v_item->>'image_url', ''),
        COALESCE(v_item->>'option_a', ''),
        COALESCE(v_item->>'option_b', ''),
        COALESCE(v_item->>'option_c', ''),
        COALESCE(v_item->>'option_d', ''),
        COALESCE((v_item->>'order_index')::integer, 1),
        now()
      ) RETURNING exam_questions.id INTO v_id;
    ELSE
      UPDATE public.exam_questions eq
      SET
        prompt = COALESCE(v_item->>'prompt', ''),
        prompt_latex = NULLIF(v_item->>'prompt_latex', ''),
        image_url = NULLIF(v_item->>'image_url', ''),
        option_a = COALESCE(v_item->>'option_a', ''),
        option_b = COALESCE(v_item->>'option_b', ''),
        option_c = COALESCE(v_item->>'option_c', ''),
        option_d = COALESCE(v_item->>'option_d', ''),
        order_index = COALESCE((v_item->>'order_index')::integer, eq.order_index),
        updated_at = now()
      WHERE eq.id = v_id
        AND eq.exam_session_id = p_session_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Question % not found in session %.', v_id, p_session_id;
      END IF;
    END IF;

    INSERT INTO public.exam_question_answers (question_id, correct_choice, updated_at)
    VALUES (v_id, v_correct, now())
    ON CONFLICT (question_id)
    DO UPDATE SET
      correct_choice = EXCLUDED.correct_choice,
      updated_at = now();

    v_ids := array_append(v_ids, v_id);
  END LOOP;

  IF array_length(v_ids, 1) IS NULL THEN
    DELETE FROM public.exam_questions eq
    WHERE eq.exam_session_id = p_session_id;
  ELSE
    DELETE FROM public.exam_questions eq
    WHERE eq.exam_session_id = p_session_id
      AND eq.id <> ALL(v_ids);
  END IF;

  RETURN QUERY
  SELECT q.id, q.order_index
  FROM public.exam_questions q
  WHERE q.exam_session_id = p_session_id
  ORDER BY q.order_index ASC;
END;
$$;
