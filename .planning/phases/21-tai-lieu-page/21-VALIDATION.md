---
phase: 21
slug: tai-lieu-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + jsdom + @testing-library/react |
| **Config file** | `vitest.config.ts` (root) |
| **Setup file** | `src/test/setup.ts` |
| **Quick run command** | `yarn test src/pages/TaiLieuPage.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/pages/TaiLieuPage.test.tsx`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| migration | P1 | 1 | D-03/D-04 | manual | psql verify nullable + grade check | ❌ manual | ⬜ pending |
| fetchStandalone | P1 | 1 | D-06 | unit | `yarn test src/lib/api/study-materials.test.ts` | ❌ Wave 0 | ⬜ pending |
| TaiLieuPage renders | P2 | 2 | D-01 | unit | `yarn test src/pages/TaiLieuPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| Grade filter | P2 | 2 | D-02 | unit | `yarn test src/pages/TaiLieuPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| Download behavior | P2 | 2 | D-08 | unit | `yarn test src/pages/TaiLieuPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| Admin page render | P3 | 3 | D-05 | unit | `yarn test src/pages/admin/TaiLieuAdminPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| Upload form adapted | P3 | 3 | D-09 | unit | `yarn test src/pages/admin/TaiLieuAdminPage.test.tsx` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/TaiLieuPage.test.tsx` — stubs for D-01, D-02, D-08
- [ ] `src/pages/admin/TaiLieuAdminPage.test.tsx` — stubs for D-05, D-09
- [ ] `src/lib/api/study-materials.test.ts` — stubs for D-06

Existing infrastructure (Vitest + RTL + setup.ts) covers all phase requirements — no new framework install needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DB migration applied | D-04 | Supabase migrations run via Dashboard only | Check `lesson_id` is nullable in Supabase Studio; verify `grade_8`, `grade_9`, `advanced` accepted in CHECK constraint |
| RLS anon read works | D-01 | Requires anon key + live DB | Call `fetchStandaloneStudyMaterials()` without auth, verify non-empty response |
| Teacher upload works | D-05 | Requires teacher session + live Supabase Storage | Upload PDF as teacher, verify file appears in public list |
| Signed URL download | D-08 | Requires live Supabase Storage | Click download, verify signed URL opens PDF in new tab |
