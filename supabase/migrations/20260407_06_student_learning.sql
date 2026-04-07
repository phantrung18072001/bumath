-- Phase 4: Student Learning & Submission tables
-- Tables: lesson_progress, submissions
-- Storage: submissions bucket

-- lesson_progress: tracks which lessons a student has completed
create table lesson_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table lesson_progress enable row level security;

create policy "Students can insert own progress"
  on lesson_progress for insert
  with check (user_id = auth.uid());

create policy "Students can read own progress"
  on lesson_progress for select
  using (user_id = auth.uid());

-- Admin/teacher can read all progress (for future grading dashboard)
create policy "Admin and teacher can read all progress"
  on lesson_progress for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'teacher')
    )
  );

-- submissions: tracks student assignment submissions
create table submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  file_path    text not null,
  submitted_at timestamptz not null default now(),
  status       text not null default 'submitted'
                check (status in ('submitted', 'graded')),
  score        numeric(5,2),
  comment      text,
  unique (user_id, lesson_id)
);

alter table submissions enable row level security;

create policy "Students can insert own submissions"
  on submissions for insert
  with check (user_id = auth.uid());

create policy "Students can read own submissions"
  on submissions for select
  using (user_id = auth.uid());

-- Admin/teacher can read all submissions (for Phase 5 grading)
create policy "Admin and teacher can read all submissions"
  on submissions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'teacher')
    )
  );

-- Admin/teacher can update submissions (for Phase 5 grading)
create policy "Admin and teacher can update submissions"
  on submissions for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'teacher')
    )
  );

-- Storage: submissions bucket (private)
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Storage RLS: students can upload to their own folder
create policy "Students can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: students can read their own submissions
create policy "Students can read own submission files"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: admin/teacher can read all submission files (Phase 5)
create policy "Admin and teacher can read all submission files"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'teacher')
    )
  );
