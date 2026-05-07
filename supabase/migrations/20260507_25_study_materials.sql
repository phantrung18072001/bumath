-- Migration 25: Study Materials — Phase 16
-- Creates: study_materials table, RLS policies, study-materials private Storage bucket + policies
-- Purpose: Lesson-scoped reference materials (PDF/image) uploaded by admin, accessible to students with grade access

-- ── 1. study_materials table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_materials (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id   uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title       text NOT NULL,
  file_path   text NOT NULL,
  file_type   text NOT NULL CHECK (file_type IN ('pdf', 'image')),
  category    text NOT NULL CHECK (
    category IN ('giua_ky', 'cuoi_ky', 'vao_10', 'hsg', 'chuyen_toan')
  ),
  grade       text NOT NULL CHECK (grade IN ('grade_7', 'grade_8', 'grade_9')),
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Index on lesson_id (primary access pattern) ──────────────────────
CREATE INDEX IF NOT EXISTS idx_study_materials_lesson_id
  ON public.study_materials(lesson_id);

-- ── 3. Enable RLS ────────────────────────────────────────────────────────
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- ── 4. Admin: full CRUD ──────────────────────────────────────────────────
CREATE POLICY "admin_all_study_materials"
  ON public.study_materials FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ── 5. Student: SELECT where has_grade_access(grade) ────────────────────
-- has_grade_access() is SECURITY DEFINER and checks user_packages for the grade.
-- Students without a matching package get 0 rows automatically.
CREATE POLICY "student_read_study_materials"
  ON public.study_materials FOR SELECT TO authenticated
  USING (public.has_grade_access(grade));

-- ── 6. Create private Storage bucket ────────────────────────────────────
-- public = false → signed URLs required (TTL 1h per roadmap constraint)
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;

-- ── 7. Storage policy: Admin upload (INSERT) ────────────────────────────
CREATE POLICY "admin_upload_study_materials"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'admin'
  );

-- ── 8. Storage policy: Authenticated download (SELECT for signed URL) ───
-- Access is enforced at the API layer via RLS on study_materials table.
-- Students can only get a signed URL if they can query the file_path from the table.
CREATE POLICY "auth_read_study_materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'study-materials');

-- ── 9. Storage policy: Admin delete ─────────────────────────────────────
CREATE POLICY "admin_delete_study_materials"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'admin'
  );
