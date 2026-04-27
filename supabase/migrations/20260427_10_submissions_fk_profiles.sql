-- Fix submissions.user_id FK to point at public.profiles(id) instead of auth.users(id).
-- PostgREST only discovers relationships within the public schema; the cross-schema
-- auth.users FK makes profiles(full_name) joins return 400 Bad Request.
-- profiles.id is guaranteed to equal auth.users.id (shared UUID), so no data changes.

ALTER TABLE public.submissions
  DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
