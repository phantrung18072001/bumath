---
phase: 18
slug: mock-exam-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `yarn test src/lib/api/exams.test.ts src/pages/student/MockExamsPage.test.tsx src/pages/student/MockExamAttemptPage.test.tsx src/pages/admin/ExamSessionsPage.test.tsx` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/lib/api/exams.test.ts src/pages/student/MockExamsPage.test.tsx src/pages/student/MockExamAttemptPage.test.tsx src/pages/admin/ExamSessionsPage.test.tsx`
- **After every plan wave:** Run `yarn test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | EXAM-01, EXAM-02 | unit/integration | `yarn test src/lib/api/exams.test.ts` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 1 | EXAM-03, EXAM-04, EXAM-06 | integration | `yarn test src/pages/student/MockExamAttemptPage.test.tsx` | ❌ W0 | ⬜ pending |
| 18-03-01 | 03 | 2 | EXAM-05 | integration | `yarn test src/pages/student/MockExamsPage.test.tsx` | ❌ W0 | ⬜ pending |
| 18-04-01 | 04 | 2 | EXAM-01..EXAM-06 | e2e-lite | `yarn test src/pages/admin/ExamSessionsPage.test.tsx src/pages/student/MockExamsPage.test.tsx src/pages/student/MockExamAttemptPage.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/api/exams.test.ts` — API contract stubs for EXAM-01, EXAM-02, EXAM-04, EXAM-06
- [ ] `src/pages/student/MockExamAttemptPage.test.tsx` — timing/one-attempt/deadline stubs
- [ ] `src/pages/student/MockExamsPage.test.tsx` — open-session list and immediate result entry flow stubs
- [ ] `src/pages/admin/ExamSessionsPage.test.tsx` — authoring lifecycle stubs

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Countdown realtime under unstable network | EXAM-03 | Timing drift in browser tabs hard to simulate reliably | Open exam on 2 tabs, throttle network, verify countdown sync and autosubmit behavior |
| Server-side deadline rejection UX copy | EXAM-06 | Need end-user copy confirmation | Submit exactly after `ends_at`, confirm toast/message and no duplicate attempt |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
