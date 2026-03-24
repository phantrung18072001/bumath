---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [vercel, supabase, supabase-js, vite, deployment, spa-routing, environment-variables]

# Dependency graph
requires: []
provides:
  - vercel.json SPA rewrite config enabling deep-link routing on Vercel
  - src/lib/supabase.ts singleton client importable by all future phases
  - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env var plumbing via import.meta.env
  - Cleaned vite.config.ts with no GitHub Pages conditionals
affects:
  - 02-auth (imports supabase from @/lib/supabase)
  - 03-course-management (imports supabase from @/lib/supabase)
  - 04-learning-experience (imports supabase from @/lib/supabase)
  - 05-grading (imports supabase from @/lib/supabase)

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js@2.78.0 (pinned for Node 18 compatibility)"
  patterns:
    - "Supabase singleton: createClient called once in src/lib/supabase.ts, exported as named const `supabase`"
    - "Never call createClient() outside src/lib/supabase.ts"
    - "Test env vars for Supabase provided via vitest.config.ts env block"

key-files:
  created:
    - vercel.json
    - src/lib/supabase.ts
    - src/lib/supabase.test.ts
    - .env.local (gitignored placeholder — user must fill in real values)
  modified:
    - vite.config.ts (removed GITHUB_ACTIONS base conditional)
    - vitest.config.ts (added VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env block)
    - package.json (@supabase/supabase-js added to dependencies)

key-decisions:
  - "Pin @supabase/supabase-js to 2.78.0 — v2.79+ dropped Node 18 support (project runs Node 18.20.8)"
  - "Delete deploy.yml not archive it — GitHub Pages workflow permanently superseded by Vercel"
  - "Vercel SPA rewrite via vercel.json rewrites (not redirects) — rewrites are transparent, preserve URL"

patterns-established:
  - "supabase singleton: import { supabase } from '@/lib/supabase' — one file, one instance"
  - "Test env vars in vitest.config.ts env block — no .env.local required for tests"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 1 Plan 01: Vercel Migration + Supabase Client Bootstrap Summary

**Vercel SPA routing via vercel.json rewrites, @supabase/supabase-js@2.78.0 singleton at src/lib/supabase.ts with env var plumbing, GitHub Pages workflow removed**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T02:01:03Z
- **Completed:** 2026-03-24T02:03:50Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Vercel SPA rewrite configured so all deep URLs (e.g. `/dashboard`, `/courses/123`) correctly serve `index.html`
- Supabase JS client singleton created at `src/lib/supabase.ts` — single import point for all future phases
- GitHub Pages deployment workflow deleted; `vite.config.ts` cleaned of GITHUB_ACTIONS conditional
- Test environment wired with fake Supabase credentials in `vitest.config.ts` — tests run without `.env.local`
- Smoke test passes: `supabase.from` and `supabase.auth.getSession` confirmed defined

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase client test stub** - `9c0e626` (test)
2. **Task 2: Migrate from GitHub Pages to Vercel** - `da75e61` (feat)
3. **Task 3: Install Supabase client and create singleton module** - `6179151` (feat)

**Plan metadata:** (docs commit hash — see below)

## Files Created/Modified

- `vercel.json` — SPA rewrite rule: all non-static URLs serve `/index.html`
- `src/lib/supabase.ts` — Supabase client singleton using `createClient` with auth config
- `src/lib/supabase.test.ts` — Smoke test verifying `supabase.from` and `supabase.auth.getSession` are functions
- `.env.local` — Placeholder env vars for local development (gitignored; user must populate)
- `vite.config.ts` — Removed `base: process.env.GITHUB_ACTIONS ? "/bumath/" : "/"` line
- `vitest.config.ts` — Added `env` block with test-safe Supabase URL and anon key
- `package.json` — Added `@supabase/supabase-js: 2.78.0` dependency
- `.github/workflows/deploy.yml` — Deleted (GitHub Pages workflow no longer needed)

## Decisions Made

- **Pin supabase-js to 2.78.0:** v2.79+ dropped Node 18 support. Project runs Node 18.20.8. Pinning avoids runtime breakage until Node upgrade.
- **Delete deploy.yml (not archive):** GitHub Pages is permanently replaced by Vercel. No value in keeping the file.
- **Vercel `rewrites` (not `redirects`):** Rewrites preserve the URL visible to the user; redirects would change it. Correct choice for SPA routing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ran `yarn install` twice to sync lockfile after commits**
- **Found during:** Task 2 and Task 3 verification
- **Issue:** After the Task 1 commit rewrote `yarn.lock` (adding supabase-js transitive deps partially), subsequent `yarn build` and `yarn test` commands failed with "package not present in lockfile"
- **Fix:** Ran `yarn install` before each verification step to re-link packages
- **Files modified:** `yarn.lock`, `.yarn/install-state.gz`
- **Verification:** `yarn build` and `yarn test` both succeeded after each install
- **Committed in:** Included in yarn.lock rewrites in task commits

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** `yarn install` sync was required due to Yarn 4 PnP behavior in worktree environment. No scope creep. All plan objectives met.

## Issues Encountered

- Yarn 4 lockfile sync: After each `yarn add` or cross-session cwd change, the lockfile needed a re-link. Resolved by running `yarn install` before verification commands.
- `package-lock.json` exists in the repo (historical npm artifact, already tracked in git) — not related to this plan, left unchanged.

## User Setup Required

**External service requires manual configuration before app will work in production.**

To complete the Supabase connection:

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the **Project URL** and **anon public** key
4. Edit `.env.local` at the project root:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
5. Verify: `yarn dev` starts without console errors about missing env vars

## Next Phase Readiness

- Supabase client importable from `@/lib/supabase` in all future phases
- Vercel deployment ready — connect repo to Vercel, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in Vercel dashboard
- Phase 02 (auth) can begin immediately — imports `supabase` from `@/lib/supabase`
- Supabase free-tier pause concern (7 days inactivity) remains — address before inviting real students

---
*Phase: 01-foundation*
*Completed: 2026-03-24*

## Self-Check: PASSED

- vercel.json: FOUND
- src/lib/supabase.ts: FOUND
- src/lib/supabase.test.ts: FOUND
- .env.local: FOUND
- .planning/phases/01-foundation/01-01-SUMMARY.md: FOUND
- Commit 9c0e626 (Task 1): FOUND
- Commit da75e61 (Task 2): FOUND
- Commit 6179151 (Task 3): FOUND
