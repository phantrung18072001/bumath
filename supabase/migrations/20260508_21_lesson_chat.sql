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

-- ── 3. RLS on lesson_chat_messages ───────────────────────────────
ALTER TABLE public.lesson_chat_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: students see messages in lessons whose course target_grade they have access to;
--         teachers/admins see all.
CREATE POLICY "chat_select_access" ON public.lesson_chat_messages
  FOR SELECT
  TO authenticated
  USING (
    get_my_role() IN ('admin', 'teacher')
    OR has_grade_access((
      SELECT c.target_grade::text
      FROM public.lessons l
      JOIN public.chapters ch ON ch.id = l.chapter_id
      JOIN public.courses c ON c.id = ch.course_id
      WHERE l.id = lesson_chat_messages.lesson_id
    ))
  );

-- INSERT: sender must be the caller; same access gate as SELECT.
CREATE POLICY "chat_insert_own" ON public.lesson_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      get_my_role() IN ('admin', 'teacher')
      OR has_grade_access((
        SELECT c.target_grade::text
        FROM public.lessons l
        JOIN public.chapters ch ON ch.id = l.chapter_id
        JOIN public.courses c ON c.id = ch.course_id
        WHERE l.id = lesson_id
      ))
    )
  );
-- NOTE: no UPDATE policy and no DELETE policy. Soft-delete is performed
-- exclusively by the SECURITY DEFINER function delete_chat_message (Task 3).

-- ── 4. RLS on lesson_chat_reads ──────────────────────────────────
ALTER TABLE public.lesson_chat_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_reads_select_own" ON public.lesson_chat_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "chat_reads_insert_own" ON public.lesson_chat_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_reads_update_own" ON public.lesson_chat_reads
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
