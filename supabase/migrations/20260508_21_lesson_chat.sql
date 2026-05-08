-- Migration 21: In-lesson chat — tables, RLS, RPCs, Realtime replica identity
-- Depends on migrations 16 (get_my_role), 20 (has_grade_access)

-- ── 1. lesson_chat_messages table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(trim(content)) > 0),
  parent_id  uuid REFERENCES public.lesson_chat_messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_lesson_chat_messages_lesson_created
  ON public.lesson_chat_messages(lesson_id, created_at);

-- REQUIRED for Supabase Realtime postgres_changes to deliver full old/new rows on UPDATE/DELETE
ALTER TABLE public.lesson_chat_messages REPLICA IDENTITY FULL;

-- ── 2. lesson_chat_reads table (per-user, per-lesson last read) ──
CREATE TABLE IF NOT EXISTS public.lesson_chat_reads (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id  uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  read_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
