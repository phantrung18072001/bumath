-- Allow students to update their own submissions (resubmit) only when not yet graded
create policy "Students can update own submitted submissions"
  on submissions for update
  using (user_id = auth.uid() and status = 'submitted')
  with check (user_id = auth.uid());
