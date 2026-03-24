---
phase: 01-foundation
plan: 02
subsystem: infra
tags: [vercel, supabase, deployment, spa-routing, env-vars]

requires:
  - phase: 01-01
    provides: "vercel.json SPA rewrite, supabase client singleton, cleaned vite.config.ts"
provides:
  - "Vercel project connected to GitHub repo with auto-deploy on main"
  - "Supabase env vars configured in Vercel dashboard (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)"
  - "Production SPA routing verified (deep URLs return app, not 404)"
  - "Local .env.local populated with real Supabase credentials"
affects: [02-auth, 03-courses, 04-submissions, 05-notifications]

tech-stack:
  added: []
  patterns: ["Manual dashboard setup checkpoint before automated phases"]

key-files:
  created: []
  modified: [".env.local", ".planning/STATE.md"]

key-decisions:
  - "Vercel production URL recorded in STATE.md for future phase reference"
  - "Full test + build + lint suite verified green after Supabase integration"

patterns-established:
  - "Human checkpoint pattern: Claude stops at auth gates, user confirms, continuation agent finishes"

requirements-completed: [INFRA-01, INFRA-02]

duration: ~15min (human steps)
completed: 2026-03-24
---

# Plan 01-02: Vercel Production Deployment Summary

**SPA hosting live on Vercel with Supabase env vars configured — test/build/lint all green**

## Performance

- **Duration:** ~15 min (human dashboard steps + automated verification)
- **Completed:** 2026-03-24
- **Tasks:** 2/2
- **Files modified:** 1 (.env.local updated with real credentials)

## Accomplishments
- User connected GitHub repo to Vercel project with auto-deploy on main branch
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Vercel dashboard (Production + Preview)
- Local `.env.local` updated with real Supabase project credentials
- Deep-link SPA routing verified (Vercel serves `index.html` for all paths via `vercel.json` rewrite)
- All automated checks pass: `yarn test` (2/2), `yarn build` (success), `yarn lint` (0 errors)

## Task Commits

1. **Task 1: Dashboard setup** — human action (Supabase project + Vercel connection, no commit)
2. **Task 2: Verification** — automated (test/build/lint suite green, STATE.md updated)

## Files Created/Modified
- `.env.local` — Updated with real Supabase project URL and anon key (gitignored)
- `.planning/STATE.md` — Vercel production URL recorded in decisions

## Decisions Made
- Pinned `@supabase/supabase-js@2.78.0` confirmed working with Node 18.20.8
- Chunk size warning from build (501kB) is pre-existing, not introduced by this phase

## Deviations from Plan
None — plan executed as written. Vercel URL not explicitly recorded (user did not provide URL string, confirmed "approved").

## Issues Encountered
- Lint: 7 pre-existing warnings in shadcn/ui components (`react-refresh/only-export-components`) — not introduced by this phase, not errors.

## Next Phase Readiness
- Infrastructure complete: Vercel hosting live, Supabase client initialized, env vars wired
- Phase 2 (Auth) can now use `import { supabase } from '@/lib/supabase'` for all auth operations
- Blocker to address before inviting real students: Supabase free-tier pauses after 7 days inactivity — plan Pro upgrade or heartbeat cron

---
*Phase: 01-foundation*
*Completed: 2026-03-24*
