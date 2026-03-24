---
phase: 03-course-management
plan: "01"
subsystem: database
tags: [schema, rls, storage, typescript, supabase]
dependency_graph:
  requires: [02-auth-access-control]
  provides: [course-schema, rls-policies, assignments-bucket, course-types]
  affects: [03-02, 03-03, 03-04, 03-05]
tech_stack:
  added: []
  patterns: [RLS with helper functions, storage path conventions, TypeScript Insert/Update input types]
key_files:
  created:
    - supabase/migrations/20260324_course_management_schema.sql
    - supabase/migrations/20260324_course_management_rls.sql
    - supabase/migrations/20260324_course_management_storage.sql
    - src/types/course.ts
  modified: []
decisions:
  - "is_admin() and is_approved_user() as SECURITY DEFINER helper functions — avoids repeating profiles JOIN in every policy"
  - "Storage read policy is intentionally permissive for authenticated users — file path discovery is blocked by lesson RLS"
  - "Student upload path enforces user_id in folder structure: submissions/{user_id}/{lesson_id}/{filename}"
  - "EnrichChapterWithLessons and CourseWithChapters types defined for UI consumption"
metrics:
  duration: 2min
  completed_date: "2026-03-24"
  tasks_completed: 4
  files_created: 4
  files_modified: 0
---

# Phase 03 Plan 01: Course Management Foundation Summary

Database schema, RLS policies, storage bucket, and TypeScript types establishing the full course management data layer in Supabase.

## What Was Built

Four SQL migrations and one TypeScript module that form the complete data foundation for the course management hierarchy:

1. **Schema migration** — `courses`, `chapters`, `lessons`, `enrollments` tables with proper foreign keys (ON DELETE CASCADE), `order_index` on chapters and lessons, and performance indexes. `set_updated_at()` trigger auto-maintains `updated_at` timestamps.

2. **RLS migration** — Row Level Security on all 4 tables. Two SECURITY DEFINER helper functions (`is_admin()`, `is_approved_user()`) keep policy expressions lean. Admins have ALL on all tables. Approved students can SELECT courses/chapters/lessons they are enrolled in, and SELECT their own enrollment records.

3. **Storage migration** — `assignments` private bucket (10 MB limit, image/PDF MIME types). Admin can upload/update/delete any file. Any authenticated user can read. Approved students can upload to `submissions/{user_id}/...` paths.

4. **TypeScript types** — `Course`, `Chapter`, `Lesson`, `Enrollment` interfaces. Enriched `CourseWithChapters` and `ChapterWithLessons` for UI. `Insert`/`Update` input types for each entity for use in admin mutation hooks.

## Commits

| Task | Description | Hash |
|------|-------------|------|
| 1 | Schema migration (tables + triggers) | 7218c59 |
| 2 | RLS policies | c476036 |
| 3 | Storage bucket + policies | 51cbef8 |
| 4 | TypeScript types | ffef752 |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan is a pure data-layer foundation with no UI rendering. No placeholder values that flow to the UI.

## Self-Check: PASSED

- [x] supabase/migrations/20260324_course_management_schema.sql — FOUND
- [x] supabase/migrations/20260324_course_management_rls.sql — FOUND
- [x] supabase/migrations/20260324_course_management_storage.sql — FOUND
- [x] src/types/course.ts — FOUND
- [x] Commit 7218c59 — FOUND
- [x] Commit c476036 — FOUND
- [x] Commit 51cbef8 — FOUND
- [x] Commit ffef752 — FOUND
- [x] TypeScript build passes (tsc --noEmit)
