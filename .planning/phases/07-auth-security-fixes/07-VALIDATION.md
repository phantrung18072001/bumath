---
phase: 7
slug: auth-security-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-29
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `yarn test --run` |
| **Full suite command** | `yarn test --run` |
| **Estimated runtime** | ~7 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test --run`
- **After every plan wave:** Run `yarn test --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 7 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-00-T1 | 00 | 0 | AUTH-03, AUTH-04 | unit stub | `yarn test src/pages/Login.test.tsx --run` | ✅ W0 creates | ⬜ pending |
| 07-00-T2 | 00 | 0 | AUTH-03, AUTH-04 | unit stub | `yarn test src/components/admin/AdminLayout.test.tsx --run` | ✅ W0 creates | ⬜ pending |
| 07-01-T1 | 01 | 1 | ROLE-03 | manual | *(SQL migration — manual verification via Supabase Dashboard)* | ✅ created | ⬜ pending |
| 07-01-T2 | 01 | 1 | ROLE-03 | manual | *(Supabase Dashboard — no CLI runner configured)* | n/a | ⬜ pending |
| 07-02-T1 | 02 | 1 | AUTH-04 | unit | `yarn test src/pages/Login.test.tsx --run` | ✅ W0 stub | ⬜ pending |
| 07-02-T2 | 02 | 1 | AUTH-03 | unit | `yarn test src/components/admin/AdminLayout.test.tsx --run` | ✅ W0 stub | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/Login.test.tsx` — stub file for AUTH-04 redirect tests (07-00-T1)
- [ ] `src/components/admin/AdminLayout.test.tsx` — stub file for AUTH-03 logout tests (07-00-T2)

*Existing vitest infrastructure covers all phase requirements — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Profiles RLS policies applied on live Supabase | ROLE-03 | No CLI runner configured for Supabase — requires Dashboard SQL Editor | Open Supabase Dashboard > SQL Editor > paste `supabase/migrations/20260429_16_profiles_rls.sql` > Run; verify 3 policies appear in Table Editor > profiles > Policies |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 7s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** {pending / approved YYYY-MM-DD}
