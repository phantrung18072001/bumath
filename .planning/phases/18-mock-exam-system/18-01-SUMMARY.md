---
plan: 18-01
status: completed_with_manual_checkpoint
---

## Outcome
Implemented mock exam database foundation in `supabase/migrations/20260513_22_mock_exam_system.sql`:
- schema/enums/tables for sessions, questions, answers, attempts
- one-attempt uniqueness and ordering constraints
- RLS split between admin/teacher and student scope
- RPCs for publish/start/save/submit with server-side deadline enforcement
- mutation guards to block question/answer edits once attempts exist

## Verification
- Migration content checks passed locally by inspection for required tables/functions/constraints.

## Manual checkpoint (required)
Supabase CLI apply is blocked in this workspace because the project is not linked.

Manual steps:
1. Open Supabase SQL Editor for the target project.
2. Execute `supabase/migrations/20260513_22_mock_exam_system.sql`.
3. Run verification queries:
   - `select to_regclass('public.exam_sessions'), to_regclass('public.exam_questions'), to_regclass('public.exam_question_answers'), to_regclass('public.exam_attempts');`
   - `select routine_name from information_schema.routines where routine_schema='public' and routine_name in ('publish_exam_session','start_exam_attempt','save_exam_attempt_answers','submit_exam_attempt');`
   - `select policyname, tablename from pg_policies where schemaname='public' and tablename in ('exam_sessions','exam_questions','exam_question_answers','exam_attempts');`
