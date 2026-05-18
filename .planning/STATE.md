---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Platform Expansion
status: Phase 21 next
stopped_at: Phase 20 complete (P01–P04) — advancing to Phase 21 discussion
last_updated: "2026-05-18T21:45:00.000Z"
progress:
  total_phases: 8
  completed_phases: 8
  total_plans: 30
  completed_plans: 30
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-03 — v3.0 milestone started)

**Core value:** Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm
**Current focus:** Phase 21 — Tài liệu Page (public browse + admin upload)

## Current Position

Phase: 21 (tai-lieu-page) — NEXT
Plan: 0 of TBD

## Performance Metrics

**Velocity:**

- Total plans completed: 30
- Average duration: ~7min
- Total execution time: ~3.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 18 | 4/4 | complete | - |
| Phase 19 | 1/1 | complete | - |
| Phase 20 | 4/4 | complete | - |

## Accumulated Context

### Roadmap Evolution

- Phase 6 added: UX Polish — grading filters, student course discovery, nav fixes, progress bar color
- Phase 12.1 inserted after Phase 12: UI fix - error states typography touch targets (URGENT)
- v3.0 Phases 14–19 created 2026-05-03: 31 requirements mapped across 6 phases
- Phase 20 added: Thay đổi UI/UX: Landing page hiện đại theo phong cách AI EdTech SaaS
- Phase 20 completed P04 (2026-05-18): exam pages glassmorphism — covers all student/admin screens
- Phase 21 added: Tài liệu Page public browse + admin upload

### v3.0 Phase Map

| Phase | Name | Requirements | Key Risk |
|-------|------|--------------|----------|
| 14 | Pricing + Access Control | PRICE-01–03, PRICE-05, VIDEO-01 | ✅ Complete |
| 15 | Admin UX + Audit | AUDIT-01, ADMIN-01–03 | ✅ Complete |
| 16 | Lesson Tabs + Study Materials | LESSON-01–03, MAT-01–03 | ✅ Complete |
| 17 | In-Lesson Chat | CHAT-01–03 | ✅ Complete |
| 18 | Mock Exam System | EXAM-01–06 | ✅ Complete (4/4 plans) |
| 19 | Landing + Navigator + Video | NAV-01–02, LAND-03, VIDEO-02, PRICE-04 | ✅ Complete (1 plan) |
| 20 | UI/UX Redesign | TBD | ✅ Complete (4/4 plans — P01–P04) |
| 21 | Tài liệu Page | TBD | Not started |

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work: (see previous STATE.md content — all Phase 17–20 decisions preserved)

- [Phase 17-in-lesson-chat]: No UPDATE/DELETE RLS policies on lesson_chat_messages — soft-delete exclusively via SECURITY DEFINER RPC delete_chat_message
- [Phase 17-in-lesson-chat]: REPLICA IDENTITY FULL on lesson_chat_messages — required for Supabase Realtime UPDATE/DELETE to deliver full old row for client state reconciliation
- [Phase 17-04]: enabled: isTeacherOrAdmin gates chat unread poll — students never trigger get_teacher_unread_chat_count RPC
- [Phase 20 context]: Phase 20 CONTEXT: out of scope = landing page. UI-only overhaul. bm-glass-card, glassmorphism, indigo #4F46E5.
- [Phase 20 P04]: Exam system pages (MockExamsPage, MockExamAttemptPage, ExamSessionsPage, ExamSessionDetailPage) added to Phase 20 scope — these were built in Phase 18 after original P01–P03 were planned.
- [RECURRING BUG — RESOLVED AT SOURCE]: Tooltip displays below content / clipped by overflow-hidden. Fix: wrap TooltipPrimitive.Content inside TooltipPrimitive.Portal in tooltip.tsx (done 2026-05-13).

### Pending Todos

None.

### Blockers/Concerns

- Node 18.20.8 in use: pin `@supabase/supabase-js` to 2.78.0 or upgrade Node to 20 LTS
- Uncommitted: `src/App.tsx` (adds `/gioi-thieu` route), `src/pages/GioiThieu.tsx`, `yarn.lock` — review before Phase 21

## Session Continuity

Last session: 2026-05-18T21:45:00.000Z
Stopped at: Phase 20 P04 complete — ready for Phase 21 discuss/plan
Resume file: .planning/phases/21-tai-lieu-page/
