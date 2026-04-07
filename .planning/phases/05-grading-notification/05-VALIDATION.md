---
phase: 5
slug: grading-notification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library |
| **Config file** | `vite.config.ts` (vitest config inline) |
| **Quick run command** | `yarn test src/pages/admin/SubmissionsPage.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/[relevant-file].test.tsx`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 0 | GRADE-01 | unit | `yarn test src/pages/admin/SubmissionsPage.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 0 | GRADE-02 | unit | `yarn test src/components/admin/GradingDialog.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-03 | 01 | 0 | GRADE-03 | unit | `yarn test src/components/admin/GradingDialog.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-04 | 01 | 0 | GRADE-04 | unit | `yarn test src/components/student/BellNotification.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-05 | 01 | 0 | GRADE-05 | unit | `yarn test src/components/student/SubmissionArea.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/admin/SubmissionsPage.test.tsx` — stubs for GRADE-01
- [ ] `src/components/admin/GradingDialog.test.tsx` — stubs for GRADE-02, GRADE-03
- [ ] `src/components/student/BellNotification.test.tsx` — stubs for GRADE-04
- [ ] `src/components/student/SubmissionArea.test.tsx` — stubs for GRADE-05 (may extend existing if file created in Phase 4)

*Reference: `src/pages/admin/UsersPage.test.tsx` for vi.mock hoisting and QueryClientProvider wrapper pattern.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Signed URL loads submission photo at full resolution in dialog | GRADE-02 | Requires live Supabase storage bucket and signed URL generation | Open grading dialog for any submission, verify photo renders at full width |
| Bell badge count decrements when student views graded lesson | GRADE-04 | Requires real-time state update between two sessions | Grade a submission as teacher, log in as student, verify badge count, navigate to lesson, verify badge decrements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
