-- Phase 05 GAP-C: allow teachers to attach feedback images on a submission.
alter table public.submissions
  add column if not exists teacher_images text;

comment on column public.submissions.teacher_images is
  'JSON-encoded array of storage paths (bucket: submissions, prefix: teacher/{submissionId}/) uploaded by the grader.';
