---
phase: 21-tai-lieu-page
plan: P01
subsystem: api/database
tags: [study-materials, supabase, typescript, rls, migration]
dependency_graph:
  requires: []
  provides:
    - fetchStandaloneStudyMaterials
    - uploadStandaloneStudyMaterial
    - StudyMaterialGrade (with 'advanced')
    - GRADE_LABELS (with 'advanced')
  affects:
    - src/lib/api/study-materials.ts
    - supabase/migrations/20260518_28_study_materials_public.sql
tech_stack:
  added: []
  patterns:
    - "Supabase RLS policy: anon SELECT filtered by IS NULL predicate"
    - "Storage path namespacing: standalone/ prefix separates from lesson-linked files"
    - "Nullable FK pattern: lesson_id nullable for polymorphic materials"
key_files:
  created:
    - supabase/migrations/20260518_28_study_materials_public.sql
  modified:
    - src/lib/api/study-materials.ts
decisions:
  - "Use lesson_id IS NULL (not a separate table) to represent standalone materials — simpler schema, single RLS boundary"
  - "standalone/ path prefix in storage separates lesson-linked and standalone objects"
  - "category: null for standalone materials — not all materials belong to an exam category"
metrics:
  duration: "~20 minutes"
  completed: "2026-05-18T15:55:00Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 1
---

# Phase 21 Plan P01: DB Migration + API Foundation Summary

**One-liner:** Nullable `lesson_id` schema migration + two new TypeScript API functions enabling public-access standalone study materials with grade filtering.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write DB migration SQL | `29dad41` | `supabase/migrations/20260518_28_study_materials_public.sql` |
| 2 | Apply migration in Supabase Dashboard | *(manual — checkpoint cleared)* | — |
| 3 | Extend study-materials.ts | `e61c1e3` | `src/lib/api/study-materials.ts` |

## What Was Built

### Migration (Task 1) — `20260518_28_study_materials_public.sql`

8 SQL statements applied to the Supabase project:

1. `ALTER COLUMN lesson_id DROP NOT NULL` — standalone materials have no lesson
2. `DROP + ADD CONSTRAINT study_materials_grade_check` — adds `'advanced'` value
3. `ALTER COLUMN category DROP NOT NULL` — standalone materials have no exam category
4. Policy `anon_read_standalone_study_materials` — anon SELECT where `lesson_id IS NULL`
5. Policy `anon_read_study_materials_storage` — anon can call `createSignedUrl`
6. Policy `teacher_upload_study_materials` — teachers can upload to bucket
7. Policy `teacher_delete_study_materials` — teachers can delete their uploads
8. Policy `teacher_all_study_materials` — teachers can INSERT/DELETE table rows

### TypeScript API (Task 3) — `src/lib/api/study-materials.ts`

**Interface changes:**
- `lesson_id: string | null` (was `string NOT NULL`)
- `category: 'giua_ky' | ... | null` (was non-nullable)
- `grade: 'grade_7' | 'grade_8' | 'grade_9' | 'advanced'` (added `'advanced'`)

**GRADE_LABELS extended:**
```typescript
advanced: 'Ôn thi chuyên'
```

**New exported functions:**
- `fetchStandaloneStudyMaterials(grade?)` — queries `WHERE lesson_id IS NULL`, optional grade filter, sorted by `created_at DESC`
- `uploadStandaloneStudyMaterial(file, meta)` — storage path `standalone/{ts}-{rnd}.{ext}`, inserts with `lesson_id: null, category: null`, rollbacks storage on DB error

## Verification

```
yarn build → ✓ built in 14.72s (exit 0)
grep "lesson_id: string | null" → ✓ 1 match
grep "advanced: 'Ôn thi chuyên'" → ✓ 1 match
grep "fetchStandaloneStudyMaterials" → ✓ exported
grep "uploadStandaloneStudyMaterial" → ✓ exported
grep "standalone/${timestamp}" → ✓ 1 match
grep "lesson_id: null" → ✓ 1 match
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The API functions are fully wired to Supabase; no placeholder data.

## Threat Flags

No new security surface beyond what was modeled in the plan's `<threat_model>`. All 4 threats (T-21-01 through T-21-04) were addressed by the migration's RLS policies:
- T-21-01 mitigated: `anon_read_standalone_study_materials` uses `lesson_id IS NULL` predicate
- T-21-02 mitigated: `teacher_all_study_materials` uses `get_my_role() = 'teacher'`
- T-21-03 accepted: Signed URLs 1h TTL, no object listing
- T-21-04 accepted: Teacher can insert; lesson-linked materials not separately scoped

## Self-Check: PASSED
