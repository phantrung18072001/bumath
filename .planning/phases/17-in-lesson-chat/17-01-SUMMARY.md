---
phase: 17-in-lesson-chat
plan: "01"
subsystem: database
tags: [sql, migration, rls, realtime, rpc]
dependency_graph:
  requires: [migration-16-get_my_role, migration-20-has_grade_access]
  provides: [lesson_chat_messages table, lesson_chat_reads table, delete_chat_message RPC, get_teacher_unread_chat_count RPC]
  affects: [plan-17-02-api-module, plan-17-03-chat-panel, plan-17-04-bell-notification]
tech_stack:
  added: []
  patterns: [SECURITY DEFINER RPC for soft-delete, REPLICA IDENTITY FULL for Realtime payloads, grade-access RLS via has_grade_access()]
key_files:
  created:
    - supabase/migrations/20260508_21_lesson_chat.sql
  modified: []
key_decisions:
  - No UPDATE/DELETE RLS policies on lesson_chat_messages — soft-delete exclusively via SECURITY DEFINER RPC
  - REPLICA IDENTITY FULL required on lesson_chat_messages for Supabase Realtime UPDATE/DELETE to deliver full old row
  - get_teacher_unread_chat_count uses per-lesson read_at from lesson_chat_reads — epoch fallback for never-read lessons
metrics:
  duration: "2m 23s"
  completed: "2026-05-08"
  tasks_completed: 3
  files_created: 1
  files_modified: 0
---

# Phase 17 Plan 01: In-Lesson Chat Database Foundation Summary

SQL migration creating all data-layer infrastructure for in-lesson chat: two tables with RLS, REPLICA IDENTITY FULL for Realtime, and two SECURITY DEFINER RPCs for soft-delete and unread count.

## What Was Built

### Migration file: `supabase/migrations/20260508_21_lesson_chat.sql`

The migration contains (in order):

1. **`lesson_chat_messages` table** — id (uuid PK), lesson_id (FK→lessons), sender_id (FK→auth.users), content (NOT NULL, non-empty CHECK), parent_id (self-referential FK for threading), created_at, deleted_at (nullable, for soft-delete)
2. **Index** `idx_lesson_chat_messages_lesson_created` on `(lesson_id, created_at)` — required for efficient per-lesson chat pagination
3. **`ALTER TABLE lesson_chat_messages REPLICA IDENTITY FULL`** — delivers full old/new rows in Supabase Realtime UPDATE/DELETE events
4. **`lesson_chat_reads` table** — composite PK `(user_id, lesson_id)`, read_at timestamp — tracks per-user last-read position per lesson
5. **RLS on `lesson_chat_messages`**: two policies — `chat_select_access` (students via `has_grade_access()`, teachers/admins bypass via `get_my_role()`), `chat_insert_own` (sender_id = auth.uid() + same grade gate). No UPDATE or DELETE policies — all deletes go through RPC.
6. **RLS on `lesson_chat_reads`**: three policies — `chat_reads_select_own`, `chat_reads_insert_own`, `chat_reads_update_own` (all restricted to `user_id = auth.uid()`)
7. **`delete_chat_message(p_message_id uuid) → void`** — SECURITY DEFINER, role-gated (admin/teacher only), sets `deleted_at = now()` where `deleted_at IS NULL`
8. **`get_teacher_unread_chat_count() → integer`** — SECURITY DEFINER, STABLE, counts student messages newer than caller's `read_at` per lesson (falls back to epoch for never-read lessons)

### Exact column definitions

**`lesson_chat_messages`:**
| Column     | Type        | Constraints                                              |
|------------|-------------|----------------------------------------------------------|
| id         | uuid        | PRIMARY KEY DEFAULT gen_random_uuid()                    |
| lesson_id  | uuid        | NOT NULL REFERENCES lessons(id) ON DELETE CASCADE        |
| sender_id  | uuid        | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE     |
| content    | text        | NOT NULL CHECK (char_length(trim(content)) > 0)          |
| parent_id  | uuid        | REFERENCES lesson_chat_messages(id) ON DELETE SET NULL   |
| created_at | timestamptz | NOT NULL DEFAULT now()                                   |
| deleted_at | timestamptz | (nullable — soft-delete sentinel)                        |

**`lesson_chat_reads`:**
| Column    | Type        | Constraints                                          |
|-----------|-------------|------------------------------------------------------|
| user_id   | uuid        | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE |
| lesson_id | uuid        | NOT NULL REFERENCES lessons(id) ON DELETE CASCADE    |
| read_at   | timestamptz | NOT NULL DEFAULT now()                               |
| (PK)      |             | PRIMARY KEY (user_id, lesson_id)                     |

### RPC signatures (for Plan 02 API module)

```
delete_chat_message(p_message_id uuid) → void
  - Caller must have role 'admin' or 'teacher' (enforced inside function via get_my_role())
  - RAISES EXCEPTION 'forbidden: only admin or teacher can delete chat messages' otherwise
  - Sets deleted_at = now() WHERE id = p_message_id AND deleted_at IS NULL

get_teacher_unread_chat_count() → integer
  - Returns count of student-sent, non-deleted messages newer than caller's last read_at per lesson
  - Falls back to 'epoch'::timestamptz for lessons the caller has never read
  - Both functions: SECURITY DEFINER, SET search_path = public, GRANT EXECUTE TO authenticated
```

## Migration Application Status

The Supabase CLI (`supabase db push`) could not be run automatically because:
- `supabase` binary is not installed globally (no PATH entry found)
- No `supabase/config.toml` or `.supabase/` directory in project (project not initialized for local dev)
- No `~/.config/supabase/access-token` present (not logged in)

**Action required:** Paste the contents of `supabase/migrations/20260508_21_lesson_chat.sql` into the Supabase SQL Editor (Dashboard → SQL Editor) for project `gtdyvfsndwxaawssdhbf` and execute.

After executing, verify with:
```sql
SELECT proname FROM pg_proc WHERE proname IN ('delete_chat_message', 'get_teacher_unread_chat_count');
-- Expected: 2 rows
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('lesson_chat_messages', 'lesson_chat_reads');
-- Expected: 2 rows
```

## Deviations from Plan

**1. [Rule 3 - Blocking] Migration not applied via CLI — Supabase CLI not linked**
- **Found during:** Task 3
- **Issue:** `npx supabase db push` cannot run — no local Supabase setup (no config.toml, no access token, no global CLI)
- **Fix:** Migration SQL is complete and correct; user must paste it into the Supabase SQL Editor manually
- **Files modified:** None (deviation is operational, not code)

No other deviations — all three tasks executed exactly as planned.

## Self-Check

- [x] `supabase/migrations/20260508_21_lesson_chat.sql` exists
- [x] Task 1 commit: 657b5f7
- [x] Task 2 commit: 1be1d33
- [x] Task 3 commit: 60826b1
- [x] File contains 2 CREATE TABLE, 1 REPLICA IDENTITY FULL, 2 ENABLE ROW LEVEL SECURITY, 5 CREATE POLICY, 2 CREATE OR REPLACE FUNCTION, 4 GRANT/REVOKE
- [x] File does NOT contain `is_approved_user`
