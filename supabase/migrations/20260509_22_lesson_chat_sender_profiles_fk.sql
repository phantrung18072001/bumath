-- Migration 22: Add profiles FK on lesson_chat_messages.sender_id
-- Required for PostgREST to resolve the profiles:sender_id(full_name, role) join.
-- Without this, all fetchMessages/sendMessage calls return 400 "no foreign key relationship found".
--
-- auth.users is the authoritative identity table; profiles.id is a 1:1 mirror.
-- sender_id already references auth.users(id); this adds a SECOND FK to profiles(id)
-- so PostgREST can auto-join it with the profiles:sender_id(...) alias pattern.

ALTER TABLE public.lesson_chat_messages
  ADD CONSTRAINT lesson_chat_messages_sender_id_profiles_fkey
  FOREIGN KEY (sender_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
