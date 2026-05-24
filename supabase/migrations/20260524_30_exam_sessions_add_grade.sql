-- Add grade field for exam sessions so admin can scope an exam by class level.

ALTER TABLE public.exam_sessions
  ADD COLUMN IF NOT EXISTS grade text NOT NULL DEFAULT 'grade_7';

ALTER TABLE public.exam_sessions
  DROP CONSTRAINT IF EXISTS exam_sessions_grade_check;

ALTER TABLE public.exam_sessions
  ADD CONSTRAINT exam_sessions_grade_check
  CHECK (grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced'));
