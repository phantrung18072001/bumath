-- ============================================================
-- Phase 21: Tài liệu public — standalone materials
-- ============================================================

-- 1. Make lesson_id nullable (standalone materials: lesson_id = NULL)
-- The FK + ON DELETE CASCADE constraint stays — lesson-linked materials unchanged.
ALTER TABLE public.study_materials
  ALTER COLUMN lesson_id DROP NOT NULL;

-- 2. Replace grade CHECK constraint to include 'advanced'
ALTER TABLE public.study_materials
  DROP CONSTRAINT IF EXISTS study_materials_grade_check;
ALTER TABLE public.study_materials
  ADD CONSTRAINT study_materials_grade_check
  CHECK (grade IN ('grade_7', 'grade_8', 'grade_9', 'advanced'));

-- 3. Make category nullable (no longer required for standalone materials)
ALTER TABLE public.study_materials
  DROP CONSTRAINT IF EXISTS study_materials_category_check;
ALTER TABLE public.study_materials
  ALTER COLUMN category DROP NOT NULL;

-- 4. Anon SELECT on study_materials — public browse (lesson_id IS NULL rows only)
CREATE POLICY "anon_read_standalone_study_materials"
  ON public.study_materials FOR SELECT
  TO anon
  USING (lesson_id IS NULL);

-- 5. Anon SELECT on storage.objects — allows createSignedUrl from unauthenticated clients
CREATE POLICY "anon_read_study_materials_storage"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'study-materials');

-- 6. Teacher INSERT on storage — teachers can upload (admin policy already exists)
CREATE POLICY "teacher_upload_study_materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'teacher'
  );

-- 7. Teacher DELETE on storage — teachers can delete their uploads
CREATE POLICY "teacher_delete_study_materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND public.get_my_role() = 'teacher'
  );

-- 8. Teacher ALL on study_materials table — insert + delete rows
CREATE POLICY "teacher_all_study_materials"
  ON public.study_materials FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'teacher')
  WITH CHECK (public.get_my_role() = 'teacher');
