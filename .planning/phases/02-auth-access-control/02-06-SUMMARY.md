---
phase: 02-auth-access-control
plan: 06
status: completed
completed_at: "2026-03-24"
files_modified:
  - supabase/migrations/20260324_rls_profiles.sql
tasks_completed: 1
---

# Plan 02-06 Summary: RLS Policies SQL Migration

## What Was Built

Created `supabase/migrations/20260324_rls_profiles.sql` — a complete SQL migration for:

1. **Profiles table DDL** — matches `src/types/auth.ts` Profile interface exactly (id, full_name, phone, year_of_birth, address, role, approval_status, created_at)
2. **Auto-create trigger** — `handle_new_user()` runs `SECURITY DEFINER`, inserts a profile row from `raw_user_meta_data` on every `auth.users` INSERT
3. **RLS enabled + forced** — `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`
4. **3 policies**:
   - `Students can view own profile` — students see `WHERE id = auth.uid()`; admin/teacher see all rows via OR clause
   - `Users can update own profile` — self-edit for future profile page
   - `Admin can update any profile` — approve/reject flow in UsersPage.tsx

## Key Decisions

- Single SELECT policy with OR clause covers both student (own row) and admin/teacher (all rows) — avoids policy conflicts
- No INSERT policy needed — trigger is SECURITY DEFINER and bypasses RLS
- FORCE ROW LEVEL SECURITY prevents accidental bypass via service role
- Migration is idempotent: `CREATE TABLE IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`

## How to Apply

Copy-paste into **Supabase Dashboard > SQL Editor > New query** and run.

## Verification

- File exists at `supabase/migrations/20260324_rls_profiles.sql`
- 2× `ENABLE ROW LEVEL SECURITY` / 3× `CREATE POLICY` / 6× `auth.uid()` / 3× `handle_new_user`
- Build unaffected (SQL not compiled)

## Requirements Satisfied

- ROLE-03: RLS policies trong Supabase ngăn học sinh xem dữ liệu của nhau
