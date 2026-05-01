---
phase: 11
slug: admin-list-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest v3.2.4 + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test src/pages/admin/UsersPage.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/pages/admin/UsersPage.test.tsx` or `yarn test src/pages/admin/CoursesPage.test.tsx`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-W0-01 | W0 | 0 | ADMIN-UI-02 | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ W0 | ⬜ pending |
| 11-W0-02 | W0 | 0 | ADMIN-UI-01 | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ update | ⬜ pending |
| 11-01-01 | 01 | 1 | ADMIN-UI-01 | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | ADMIN-UI-01 | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ | ⬜ pending |
| 11-01-03 | 01 | 1 | DS-02 | unit | `yarn test src/pages/admin/UsersPage.test.tsx` | ✅ | ⬜ pending |
| 11-02-01 | 02 | 1 | ADMIN-UI-02 | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ W0 | ⬜ pending |
| 11-02-02 | 02 | 1 | ADMIN-UI-02 | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ W0 | ⬜ pending |
| 11-02-03 | 02 | 1 | DS-02 | unit | `yarn test src/pages/admin/CoursesPage.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/admin/CoursesPage.test.tsx` — create stub file with skeleton tests for ADMIN-UI-02 + DS-02. Use `vi.mock('@/lib/api/courses', ...)` (NOT supabase direct mock)
- [ ] Update `src/pages/admin/UsersPage.test.tsx` — fix existing empty-state test (line ~125): old message `"Chưa có tài khoản nào được tạo."` → new heading `"Chưa có tài khoản nào"`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pagination ellipsis renders correctly for >5 pages | DS-01 | Visual rendering of shadcn Pagination | Open admin/users, mock >50 users, verify middle pages show ellipsis |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
