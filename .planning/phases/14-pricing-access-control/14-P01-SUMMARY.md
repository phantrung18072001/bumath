# P01 Summary — Database Schema: Packages + Access Control

**Status:** Complete
**Commit:** 8dbc495

## What Was Built

3 migration SQL files written and executed in Supabase Dashboard (order: 18 → 19 → 20):

### Migration 18 — packages_schema.sql
- Tables: `packages`, `package_grades`, `user_packages` with RLS enabled
- Indexes on `package_id`, `user_id` for performance
- RLS policies: admin full CRUD, authenticated users read packages, students read own user_packages
- Uses `get_my_role()` SECURITY DEFINER pattern (no infinite recursion)

### Migration 19 — backfill_user_packages.sql
- Backfilled all existing enrolled students → `user_packages` records
- Created legacy packages per grade (`Lớp 7 Legacy`, `Lớp 8 Legacy`, etc.)
- ON CONFLICT DO NOTHING for idempotency

### Migration 20 — packages_rls_trigger.sql
- `has_grade_access(p_grade)`: SECURITY DEFINER function checking user package ownership
- `lessons_view`: security_invoker=true, security_barrier=true — masks `video_url` to NULL for students without matching package
- `trg_add_enrollments_for_package`: auto-enrolls student in grade-matching courses on package assign
- `trg_remove_enrollments_for_package`: removes enrollments on revoke (multi-package safe via NOT EXISTS)

## Artifacts

| File | Change |
|------|--------|
| `supabase/migrations/20260504_18_packages_schema.sql` | Created — 3 tables + RLS |
| `supabase/migrations/20260504_19_backfill_user_packages.sql` | Created — backfill logic |
| `supabase/migrations/20260504_20_packages_rls_trigger.sql` | Created — functions + view + triggers |

## Verification

- ✅ 3 migration files exist with correct naming convention
- ✅ All 3 migrations executed in Supabase Dashboard (18 → 19 → 20)
- ✅ Tables `packages`, `package_grades`, `user_packages` exist with RLS
- ✅ `has_grade_access()` function exists
- ✅ `lessons_view` uses security_invoker + security_barrier
- ✅ Both enrollment triggers active
- ✅ No `slug` column reference (lessons table has none)

## Requirements Satisfied

- PRICE-01: Package schema with grade coverage
- PRICE-02: User package assignment with auto-enrollment triggers
- PRICE-03: Backfill existing enrolled students
- VIDEO-01: video_url masking via lessons_view for unauthorized students

## Key Decisions Applied

- D-01: One package → multiple grades (package_grades junction)
- D-02: Student can own multiple packages simultaneously (UNIQUE user_id+package_id)
- D-05: video_url column-level masking in view (not row-level RLS)
- D-09: Auto-enrollment trigger on user_packages INSERT
- D-10: Backfill runs BEFORE triggers to avoid locking out existing students
