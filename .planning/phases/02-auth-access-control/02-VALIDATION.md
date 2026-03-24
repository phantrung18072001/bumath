---
phase: 2
slug: auth-access-control
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + React Testing Library 16.0.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test src/contexts/AuthContext.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/[relevant-file].test.{ts,tsx}`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| AUTH-01-a | 01 | 0 | AUTH-01 | unit | `yarn test src/contexts/AuthContext.test.tsx` | ❌ W0 | ⬜ pending |
| AUTH-01-b | 01 | 0 | AUTH-01 | unit | `yarn test src/lib/validators.test.ts` | ❌ W0 | ⬜ pending |
| AUTH-02 | 01 | 0 | AUTH-02 | unit | `yarn test src/contexts/AuthContext.test.tsx` | ❌ W0 | ⬜ pending |
| AUTH-03 | 01 | 0 | AUTH-03 | unit | `yarn test src/contexts/AuthContext.test.tsx` | ❌ W0 | ⬜ pending |
| AUTH-04 | 01 | 0 | AUTH-04 | unit | `yarn test src/components/auth/ProtectedRoute.test.tsx` | ❌ W0 | ⬜ pending |
| AUTH-05 | 01 | 0 | AUTH-05 | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ❌ W0 | ⬜ pending |
| ROLE-01 | 01 | 0 | ROLE-01 | unit | `yarn test src/contexts/AuthContext.test.tsx` | ❌ W0 | ⬜ pending |
| ROLE-02 | 01 | 0 | ROLE-02 | unit | `yarn test src/components/auth/ProtectedRoute.test.tsx` | ❌ W0 | ⬜ pending |
| ROLE-03 | — | — | ROLE-03 | manual | — | N/A | ⬜ pending |
| UX-03 | — | — | UX-03 | manual | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/contexts/AuthContext.test.tsx` — stubs for AUTH-01, AUTH-02, AUTH-03, ROLE-01
- [ ] `src/components/auth/ProtectedRoute.test.tsx` — stubs for AUTH-04, ROLE-02
- [ ] `src/pages/admin/UsersPage.test.tsx` — stubs for AUTH-05
- [ ] `src/lib/validators.test.ts` — stubs for phone E.164 coercion

*All test files are new (Wave 0 creates them).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS policies enforce data isolation | ROLE-03 | Supabase SQL migrations cannot be unit-tested locally without a live Supabase project | Open Supabase Table Editor → run SELECT as student role → verify only own profile row visible |
| All UI copy is in Vietnamese | UX-03 | Visual inspection required across all auth screens | Review /register, /login, /pending, /admin/users pages — check all labels, errors, placeholders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
