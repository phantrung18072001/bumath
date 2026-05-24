-- Operational SQL (NOT migration): reset password for all existing auth users.
-- New password for every user: 12345678

UPDATE auth.users
SET encrypted_password = crypt('12345678', gen_salt('bf')),
    updated_at = now();
