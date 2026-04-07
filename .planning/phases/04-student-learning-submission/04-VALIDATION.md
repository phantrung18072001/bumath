---
phase: 4
slug: student-learning-submission
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^3.2.4 + React Testing Library ^16.0.0 |
| **Config file** | `vite.config.ts` (vitest config inline) |
| **Quick run command** | `yarn test src/lib/api/lesson-progress.test.ts src/lib/api/submissions.test.ts` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test src/lib/api/`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-W0-01 | 01 | 0 | LEARN-01 | unit | `yarn test src/lib/api/enrollments.test.ts -x` | ❌ W0 | ⬜ pending |
| 4-W0-02 | 01 | 0 | LEARN-04, LEARN-05 | unit | `yarn test src/lib/api/lesson-progress.test.ts -x` | ❌ W0 | ⬜ pending |
| 4-W0-03 | 01 | 0 | SUBMIT-01, SUBMIT-02, SUBMIT-03 | unit | `yarn test src/lib/api/submissions.test.ts -x` | ❌ W0 | ⬜ pending |
| 4-W0-04 | 01 | 0 | LEARN-02, LEARN-03 | unit | `yarn test src/pages/student/CourseDetailPage.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/api/enrollments.test.ts` — stubs for LEARN-01 (getUserEnrollments with mocked Supabase)
- [ ] `src/lib/api/lesson-progress.test.ts` — stubs for LEARN-04, LEARN-05
- [ ] `src/lib/api/submissions.test.ts` — stubs for SUBMIT-01, SUBMIT-02, SUBMIT-03
- [ ] `src/pages/student/CourseDetailPage.test.tsx` — stubs for LEARN-02, LEARN-03

All test files follow the `vi.mock` hoisting pattern established in `src/contexts/AuthContext.test.tsx`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS blocks student from reading another student's submission | SUBMIT-04 | Requires two auth sessions and Supabase SQL editor | In Supabase SQL editor: insert submission as user A, query as user B — should return 0 rows |
| `/courses` renders on 375px without horizontal scroll | UX-01 | Visual layout check | DevTools → 375px viewport; check no horizontal overflow on courses list |
| All interactive elements ≥48px tap target | UX-02 | Visual/device check | DevTools → inspect padding on buttons, checkboxes; verify min 48×48px hit area |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
