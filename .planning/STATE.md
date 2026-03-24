---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase complete — ready for verification
stopped_at: Completed 02-auth-access-control-03-PLAN.md
last_updated: "2026-03-24T06:18:12.290Z"
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 5
  completed_plans: 4
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-24)

**Core value:** Học sinh có thể tự học theo tiến độ và nhận phản hồi cụ thể từ giảng viên trên từng bài làm
**Current focus:** Phase 02 — Auth & Access Control

## Current Position

Phase: 02 (Auth & Access Control) — EXECUTING
Plan: 3 of 3

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-foundation P01 | 2 | 3 tasks | 7 files |
| Phase 02-auth-access-control P01 | 4min | 3 tasks | 9 files |
| Phase 02-auth-access-control P02 | 15 | 3 tasks | 4 files |
| Phase 02-auth-access-control P03 | 4min | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Supabase as backend (Auth + DB + Storage + RLS, no server to maintain)
- YouTube embed only for video MVP (no direct upload in v1)
- Admin approval gate before students access any content
- Vercel deployment required before auth work (GitHub Pages breaks SPA deep links)
- [Phase 01-foundation]: Pin @supabase/supabase-js to 2.78.0 — v2.79+ dropped Node 18 support (project runs Node 18.20.8)
- [Phase 01-foundation]: Vercel SPA routing via vercel.json rewrites (not redirects) — rewrites preserve URL visible to user
- [Phase 01-foundation]: Delete deploy.yml permanently — GitHub Pages superseded by Vercel, no value in archiving
- [Phase 02-auth-access-control]: React Context (not TanStack Query) for auth state — session is event-driven via onAuthStateChange
- [Phase 02-auth-access-control]: setTimeout(0) for profile fetch in onAuthStateChange to avoid Supabase callback deadlock
- [Phase 02-auth-access-control]: ProtectedRoute redirects pending/rejected users to /pending; /pending page must not itself use ProtectedRoute (infinite redirect loop)
- [Phase 02-auth-access-control]: Used controlled state for Login (2 fields) and RHF+Zod for Register (6 fields)
- [Phase 02-auth-access-control]: Pending page uses inline auth checks (no ProtectedRoute) to prevent infinite redirect loop
- [Phase 02-auth-access-control]: userEvent.setup() required for Radix Tabs interaction in jsdom — fireEvent.click does not trigger pointer events
- [Phase 02-auth-access-control]: vi.mock hoisting requires all mock functions defined inside factory; named exports (__order, __updateEq) used for per-test data override

### Pending Todos

None yet.

### Blockers/Concerns

- Node 18.20.8 in use: pin `@supabase/supabase-js` to 2.78.0 or upgrade Node to 20 LTS before Phase 2
- Supabase free-tier pauses after 7 days inactivity — decide on Pro upgrade or heartbeat before inviting real students (address end of Phase 1 or Phase 2)
- Phase 4: research client-side image compression library (`browser-image-compression` vs alternatives) and HEIC handling before implementation
- Phase 5: research email delivery provider for Supabase Edge Function (Resend vs SendGrid vs built-in SMTP) before implementation

## Session Continuity

Last session: 2026-03-24T06:18:12.287Z
Stopped at: Completed 02-auth-access-control-03-PLAN.md
Resume file: None
