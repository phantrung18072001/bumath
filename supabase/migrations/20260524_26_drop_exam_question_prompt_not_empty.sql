-- Phase 18 hotfix: allow empty prompt text in exam_questions (UAT request)
-- Removes strict NOT EMPTY check so draft questions can be saved without prompt.

ALTER TABLE public.exam_questions
  DROP CONSTRAINT IF EXISTS exam_questions_prompt_not_empty;
