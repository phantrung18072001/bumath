---
phase: 6
slug: ux-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-27
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `yarn test` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 0 | UX-P6-02 | unit | `yarn test src/pages/NotFound.test.tsx` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 0 | UX-P6-03 | unit | `yarn test src/components/student/StudentLayout.test.tsx` | ❌ W0 | ⬜ pending |
| 6-01-03 | 01 | 0 | UX-P6-04 | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ❌ W0 | ⬜ pending |
| 6-01-04 | 01 | 0 | UX-P6-05 | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx` | ❌ W0 | ⬜ pending |
| 6-02-01 | 02 | 1 | UX-P6-01 | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ❌ W0 | ⬜ pending |
| 6-02-02 | 02 | 1 | UX-P6-02 | unit | `yarn test src/pages/NotFound.test.tsx` | ❌ W0 | ⬜ pending |
| 6-02-03 | 02 | 1 | UX-P6-03 | unit | `yarn test src/components/student/StudentLayout.test.tsx` | ❌ W0 | ⬜ pending |
| 6-03-01 | 03 | 2 | UX-P6-04 | unit | `yarn test src/pages/student/CataloguePage.test.tsx` | ❌ W0 | ⬜ pending |
| 6-04-01 | 04 | 2 | UX-P6-05 | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/NotFound.test.tsx` — stubs for UX-P6-02 (Vietnamese text)
- [ ] `src/components/student/StudentLayout.test.tsx` — stubs for UX-P6-03 (logo link)
- [ ] `src/pages/student/CataloguePage.test.tsx` — stubs for UX-P6-04 (catalogue render)
- [ ] `src/pages/student/CourseDetailPage.test.tsx` — stubs for UX-P6-05 (preview mode)
- [ ] `src/pages/admin/SubmissionsPage.test.tsx` — stubs for UX-P6-01 (filter behavior)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS migration applies in Supabase | UX-P6-04 | Database migration via Dashboard SQL Editor | Run migration SQL, verify all approved users can SELECT courses table |
| Course progress bar appears gray/neutral | visual | Color perception is subjective | Check progress bar in student lesson sidebar — track should be muted/gray, not blue |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
