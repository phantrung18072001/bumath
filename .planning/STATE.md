---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Platform Expansion
status: Phase 20 reopened — P05 added (system-wide redesign from /danh-muc model)
stopped_at: Phase 20 P05 created and foundation rollout started (white shells)
last_updated: "2026-05-25T00:50:00Z"
progress:
  total_phases: 9
  completed_phases: 9
  total_plans: 36
  completed_plans: 35
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-03 — v3.0 milestone started)

**Core value:** Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm
**Current focus:** Phase 20 P05 — system-wide redesign using `/danh-muc` as baseline

## Current Position

Phase: 20 (ui/ux redesign) — REOPENED
Plan: P05 ready (0 of 1 for reopened scope)

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
| Phase 20 | 4/5 | in progress | P05 |

## Accumulated Context

### Roadmap Evolution

- Phase 6 added: UX Polish — grading filters, student course discovery, nav fixes, progress bar color
- Phase 12.1 inserted after Phase 12: UI fix - error states typography touch targets (URGENT)
- v3.0 Phases 14–19 created 2026-05-03: 31 requirements mapped across 6 phases
- Phase 20 added: Thay đổi UI/UX: Landing page hiện đại theo phong cách AI EdTech SaaS
- Phase 20 completed P04 (2026-05-18): exam pages glassmorphism — covers all student/admin screens
- Phase 20 reopened (2026-05-25): P05 added — redesign toàn hệ thống theo model `/danh-muc` (white-first, image-first, minimal)
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
| 20 | UI/UX Redesign | TBD | 🔄 In progress (4/5 plans — P01–P04 complete, P05 active) |
| Phase 21 | 4/4 | complete | - |

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work: (see previous STATE.md content — all Phase 17–20 decisions preserved)

- [Phase 17-in-lesson-chat]: No UPDATE/DELETE RLS policies on lesson_chat_messages — soft-delete exclusively via SECURITY DEFINER RPC delete_chat_message
- [Phase 17-in-lesson-chat]: REPLICA IDENTITY FULL on lesson_chat_messages — required for Supabase Realtime UPDATE/DELETE to deliver full old row for client state reconciliation
- [Phase 17-04]: enabled: isTeacherOrAdmin gates chat unread poll — students never trigger get_teacher_unread_chat_count RPC
- [Phase 20 context]: Phase 20 CONTEXT: out of scope = landing page. UI-only overhaul. bm-glass-card, glassmorphism, indigo #4F46E5.
- [Phase 20 P04]: Exam system pages (MockExamsPage, MockExamAttemptPage, ExamSessionsPage, ExamSessionDetailPage) added to Phase 20 scope — these were built in Phase 18 after original P01–P03 were planned.
- [Phase 21 P01]: lesson_id nullable (not separate table) for standalone materials — simpler schema, single RLS boundary with IS NULL predicate
- [Phase 21 P01]: standalone/ storage prefix separates lesson-linked vs standalone objects
- [Phase 21 P02]: Fetch all grades once at mount, filter client-side — avoids N+1 queries on grade change
- [Phase 21 P02]: Route /tai-lieu added without ProtectedRoute per D-01 (public access)
- [Phase 21 P04]: Nav item 'Tài liệu' added to AdminLayout without adminOnly — teachers see it per D-05, D-10

### Pending Todos

None.

### Blockers/Concerns

- Node 18.20.8 in use: pin `@supabase/supabase-js` to 2.78.0 or upgrade Node to 20 LTS

## Session Continuity

Last session: 2026-05-25T00:50:00Z
Stopped at: Phase 20 P05 created and shell backgrounds switched to white
Resume file: `.planning/phases/20-thay-i-ui-ux-landing-page-hi-n-i-theo-phong-c-ch-ai-edtech-saas/20-P05-PLAN.md`
