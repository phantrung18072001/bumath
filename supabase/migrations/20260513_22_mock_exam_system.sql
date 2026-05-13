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

