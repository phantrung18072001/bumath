-- Phase 5: Add student_viewed_at for bell notification (D-14)
-- and SECURITY DEFINER RPC so students can only update this one field (Pitfall 4)

alter table submissions
  add column if not exists student_viewed_at timestamptz;

-- RPC: students can mark their own graded submission as viewed
-- Uses SECURITY DEFINER to bypass RLS and restrict to student_viewed_at only
create or replace function mark_submission_viewed(submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update submissions
  set student_viewed_at = now()
  where id = submission_id
    and user_id = auth.uid()
    and status = 'graded'
    and student_viewed_at is null;
end;
$$;
