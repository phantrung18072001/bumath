-- Phase 05 GAP-C: allow admin/teacher to upload feedback images to
-- submissions bucket under the teacher/{submissionId}/ prefix.
-- Without this policy, storage.upload() returns 400 (RLS violation).

create policy "Admin and teacher can upload teacher feedback images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = 'teacher'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'teacher')
    )
  );
