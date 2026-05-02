---
phase: 12
slug: admin-detail-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + React Testing Library 16.0.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test src/pages/admin/SubmissionsPage.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/pages/admin/<PageUnderChange>.test.tsx`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-?-01 | TBD | 0 | ADMIN-UI-03 | unit | `yarn test src/pages/admin/ChaptersPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 12-?-02 | TBD | 0 | ADMIN-UI-03 | unit | `yarn test src/pages/admin/LessonsPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 12-?-03 | TBD | 0 | ADMIN-UI-04 | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ✅ (needs update) | ⬜ pending |
| 12-?-04 | TBD | 1 | ADMIN-UI-03 | unit | `yarn test src/pages/admin/ChaptersPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 12-?-05 | TBD | 1 | ADMIN-UI-03 | unit | `yarn test src/pages/admin/LessonsPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 12-?-06 | TBD | 1 | ADMIN-UI-04 | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ✅ | ⬜ pending |
| 12-?-07 | TBD | 1 | DS-02 | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ✅ | ⬜ pending |
| 12-?-08 | TBD | 1 | DS-02 | unit | `yarn test src/pages/admin/ChaptersPage.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 12-?-09 | TBD | 2 | ADMIN-UI-05 | manual | manual-only (jsdom has no real breakpoints) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/admin/ChaptersPage.test.tsx` — drag handles rendered, Skeleton on load (ADMIN-UI-03, DS-02)
- [ ] `src/pages/admin/LessonsPage.test.tsx` — drag handles rendered, Skeleton on load (ADMIN-UI-03, DS-02)
- [ ] Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` — blocks all dnd-kit code
- [ ] Update `src/pages/admin/SubmissionsPage.test.tsx` — mock `getAllSubmissions` (not `getUngraded`), add status filter + pagination tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GradingPage sticky bottom bar on mobile | ADMIN-UI-05 | jsdom has no real CSS breakpoints | 1. Open DevTools → mobile emulation (375px). 2. Confirm `fixed bottom-0 left-0 right-0 lg:hidden` element is present in DOM. 3. Scroll submission content — bar stays fixed at bottom. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
