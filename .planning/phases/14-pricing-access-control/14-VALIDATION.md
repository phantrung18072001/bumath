---
phase: 14
slug: pricing-access-control
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-04
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test --run` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test --run`
- **After migration files:** Manual verification in Supabase Dashboard SQL Editor
- **After UI tasks:** Visual check in browser at `http://localhost:8080`

---

## Requirement Verification

| Req ID | Verification Method |
|--------|---------------------|
| PRICE-01 | Open `/quan-tri/goi-hoc`. Create package "Test Lớp 7", price 1500000, grade: grade_7 only. Package appears in table. Edit → change name. Delete → confirm dialog → package gone. |
| PRICE-02 | Open UsersPage. Click "Quản lý gói học" on a student. Assign "Test Lớp 7" package. Verify `user_packages` row exists in DB. Verify `enrollments` row also created for grade_7 courses (trigger fired). Revoke → verify both user_packages and enrollment deleted. |
| PRICE-03 | Student A has grade_7 package. Login as Student A. Open a grade_7 lesson → video plays. Login as Student B (no package). Open same lesson → locked state shows (Lock icon + message). Verify `video_url` is NULL in network response for Student B. |
| PRICE-05 | Login as student with assigned package. Go to `/ho-so`. Verify: name, email visible. Package card shows package name + grade badge + assigned date. No packages → empty state visible. |
| VIDEO-01 | (a) Verify `video_url` in DB is a `youtube-nocookie.com` URL. (b) In DevTools Network tab, confirm lesson response for unauthorized student has `video_url: null`. (c) Curl app domain with `-I` and verify `x-frame-options: SAMEORIGIN` header. |

---

## Migration Verification

After each migration file (run manually in Supabase Dashboard → SQL Editor):

| Migration | Verification |
|-----------|-------------|
| `18_packages_schema` | Verify 3 new tables exist: `packages`, `package_grades`, `user_packages`. Check columns match schema. |
| `19_backfill_user_packages` | Run verification query at bottom of file. All existing enrolled students appear with ≥1 legacy package. |
| `20_packages_rls_trigger` | Test `has_grade_access('grade_7')` in SQL Editor as a student. Test `lessons_view` returns NULL for `video_url` when student has no package. |

---

## Common Pitfalls

### Pitfall 1: Applying RLS Before Backfill
**What goes wrong:** After RLS is applied, `has_grade_access()` returns false for all existing students (no `user_packages` rows) → all `video_url` becomes NULL → existing students lose access.
**How to avoid:** Run migrations in strict order: File 18 → File 19 → File 20. Never skip or combine.
**Warning signs:** After File 20, all lesson pages show locked state for students who should have access.

### Pitfall 2: View Not Respecting Underlying RLS
**What goes wrong:** `lessons_view` returns all lesson rows to all authenticated users, ignoring row-level policies.
**How to avoid:** Use `security_invoker = true, security_barrier = true` on the view. Test as a non-enrolled student.

### Pitfall 3: Multi-Package Revoke Deletes Too Many Enrollments
**What goes wrong:** Student owns grade_7 + grade_9 packages. Revoking grade_7 package also removes grade_9 enrollments.
**How to avoid:** Delete trigger must use `NOT EXISTS` sub-query to only remove enrollments not covered by OTHER active packages (D-02).

---

## Nyquist Dimensions

| Dimension | Coverage |
|-----------|---------|
| Unit tests | API functions (packages CRUD, user_packages CRUD) |
| Integration | Supabase RLS policy + view behavior |
| E2E flows | Admin assigns package → student sees video; Student without package sees locked state |
| Migration safety | Order-dependent: 18 → 19 → 20 |
