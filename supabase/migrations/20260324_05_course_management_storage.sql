-- Storage bucket for assignment files (student submissions and admin uploads)

-- Create the assignments bucket
-- public = false: requires authenticated access; admin controls uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignments',
  'assignments',
  false,
  10485760,   -- 10 MB per file
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ─── STORAGE POLICIES ────────────────────────────────────────────────────────

-- Admin can upload (INSERT) any file into assignments bucket
CREATE POLICY "admin_upload_assignments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Admin can update / replace files
CREATE POLICY "admin_update_assignments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Admin can delete files
CREATE POLICY "admin_delete_assignments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Any authenticated user can read (SELECT) files from assignments bucket
-- Enrollment check for lesson attachments is enforced at the application layer;
-- RLS on storage objects is intentionally permissive for reads to keep
-- signed-URL generation simple. Sensitive access control is handled by
-- the lesson/chapter RLS which prevents students from discovering file paths
-- they should not see.
CREATE POLICY "authenticated_read_assignments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'assignments');

-- Students can upload their own submission files
-- Path convention: submissions/{user_id}/{lesson_id}/{filename}
CREATE POLICY "student_upload_own_submissions"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignments' AND
    (storage.foldername(name))[1] = 'submissions' AND
    (storage.foldername(name))[2] = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'student'
        AND profiles.approval_status = 'approved'
    )
  );
