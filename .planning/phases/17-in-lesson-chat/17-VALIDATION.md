---
phase: 17
slug: in-lesson-chat
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + React Testing Library |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `yarn test --run src/components/student/` |
| **Full suite command** | `yarn test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test --run src/components/student/`
- **After every plan wave:** Run `yarn test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | CHAT-01 | unit | `yarn test --run src/components/student/ChatPanel.test.tsx` | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | CHAT-01 | unit | `yarn test --run src/components/student/ChatPanel.test.tsx` | ❌ W0 | ⬜ pending |
| 17-02-01 | 02 | 2 | CHAT-02 | unit | `yarn test --run src/components/student/BellNotification.test.tsx` | ❌ W0 | ⬜ pending |
| 17-03-01 | 03 | 1 | CHAT-01 | unit | `yarn test --run src/components/student/LessonContent.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/student/ChatPanel.test.tsx` — stubs for CHAT-01 (send message, realtime subscribe, dedup, lazy open, cleanup)
- [ ] `src/components/student/BellNotification.test.tsx` — stubs for CHAT-02/CHAT-03 teacher unread badge
- [ ] `src/components/student/LessonContent.test.tsx` — stubs for Tab 3 integration (admin guard removal)

*Existing infrastructure covers Supabase mock patterns from Phase 14/16 test files.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase Realtime channel lifecycle (no orphaned subs) | CHAT-01 | Cannot mock WS channel teardown reliably in jsdom | Open lesson, open Tab 3, switch lesson — verify no error in console |
| Teacher sees student message in real-time | CHAT-01 | Requires two simultaneous browser sessions | Open lesson as student + teacher, student sends message, teacher sees it without refresh |
| BellNotification badge updates after 60s poll | CHAT-03 | Timer-based polling | As teacher: receive chat message, wait 60s, verify bell badge increments |
| Delete message (teacher only) | CHAT-02 | Role-based visibility | As teacher: delete a message, verify soft-deleted; as student: verify no delete button |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
