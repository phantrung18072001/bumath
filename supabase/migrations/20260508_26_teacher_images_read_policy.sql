-- Migration 26: Allow students to read teacher feedback images
-- Root cause: "Students can read own submission files" only matches (foldername)[1] = auth.uid()
-- Teacher images are stored at teacher/{submissionId}/... so students cannot createSignedUrl

create policy "Students can read teacher feedback for own submissions"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = 'teacher'
    and exists (
      select 1 from public.submissions
      where submissions.id::text = (storage.foldername(name))[2]
        and submissions.user_id = auth.uid()
    )
  );
