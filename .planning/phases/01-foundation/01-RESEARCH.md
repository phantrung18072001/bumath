# Phase 1: Foundation - Research

**Researched:** 2026-03-24
**Domain:** Vercel SPA deployment + Supabase client bootstrap for React/Vite
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Deploy app to Vercel (replacing GitHub Pages) to support SPA routing | Vercel SPA rewrite config documented; GitHub Actions deploy.yml must be updated or replaced |
| INFRA-02 | Supabase project configured with Vite env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) | Vite VITE_ prefix convention confirmed; .env.local pattern documented; Vercel env dashboard is the production store |
| INFRA-03 | Supabase client singleton created at `src/lib/supabase.ts` | createClient singleton pattern confirmed from official Supabase React quickstart |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Package manager**: Yarn 4.11.0 — use `yarn`, never `npm install`
- **All new code must be TypeScript** — strict mode is disabled, but type imports still required
- **shadcn/ui components**: do not modify manually; use the shadcn CLI to add/update
- **Path alias**: `@/` maps to `src/`
- **Testing**: Vitest + React Testing Library; globals enabled; setup file `src/test/setup.ts`
- **Dev server port**: 8080
- **Font**: "Be Vietnam Pro" (Vietnamese language)

---

## Summary

Phase 1 has two independent concerns: (1) migrating the deployment target from GitHub Pages to Vercel so SPA deep-link routing works, and (2) wiring in the Supabase JavaScript client as a singleton module that all future phases can import from `src/lib/supabase.ts`.

The GitHub Pages deployment is currently live at `/bumath/` via a conditional base path in `vite.config.ts`. After migration to Vercel the base path becomes `/` unconditionally, and a `vercel.json` rewrite config handles client-side routing fallback. The existing `deploy.yml` GitHub Actions workflow must be replaced with a Vercel-native deployment (GitHub integration or Vercel CLI). The GitHub Pages environment and workflow should be removed to avoid confusion.

The Supabase client installation is pinned at version 2.78.0 because the project currently runs Node 18.20.8 and `@supabase/supabase-js` 2.79+ dropped Node 18 support. The client singleton at `src/lib/supabase.ts` is two lines of code — the phase does not include auth context or any database work, only the client file and environment variable plumbing.

**Primary recommendation:** Deploy to Vercel via GitHub integration (automatic on push to `main`), add `vercel.json` with the SPA rewrite, set the two Supabase env vars in the Vercel project dashboard, remove the GitHub Actions deploy workflow, update `vite.config.ts` to remove the GITHUB_ACTIONS conditional, and create `src/lib/supabase.ts` with the singleton.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | **2.78.0** (pinned) | Supabase client — auth, DB, storage | Official SDK; v2.79+ dropped Node 18. Verified on npm registry 2026-03-24. |
| Vercel | free tier | SPA hosting with built-in edge routing fallback | Zero config for Vite; handles SPA rewrites; free tier covers this project size |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase CLI (dev dep) | latest | Type generation, local dev, migrations | Add in Phase 2 when schema work begins; not strictly required for Phase 1 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel | Netlify | Both support SPA rewrites equally; Vercel has better Vite/React ecosystem fit and the project is already on GitHub |
| Vercel GitHub integration | Vercel CLI deploy | CLI requires local `vercel` binary not present on this machine; GitHub integration is zero-config |

**Installation:**
```bash
yarn add @supabase/supabase-js@2.78.0
```

**Version verification:** `npm view @supabase/supabase-js@2.78.0 version` — confirmed 2.78.0 exists on registry (verified 2026-03-24).

---

## Architecture Patterns

### Files Created or Modified in This Phase

```
(project root)
├── vercel.json                 # SPA rewrite: /* → /index.html
├── .env.local                  # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (never commit)
├── .gitignore                  # Ensure .env.local is excluded
├── vite.config.ts              # Remove GITHUB_ACTIONS conditional base path
├── .github/workflows/
│   └── deploy.yml              # REMOVE or disable (GitHub Pages no longer used)
└── src/
    └── lib/
        └── supabase.ts         # Supabase client singleton (NEW)
```

### Pattern 1: Vercel SPA Rewrite

**What:** A `vercel.json` at repo root instructs Vercel's edge network to serve `index.html` for any path that doesn't match a static file. This is equivalent to Nginx `try_files`.

**When to use:** Any SPA using `BrowserRouter` deployed on Vercel.

```json
// vercel.json
// Source: https://vercel.com/docs/frameworks/vite#using-a-framework
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Pattern 2: Vite Base Path — Remove GITHUB_ACTIONS Conditional

**What:** The current `vite.config.ts` sets `base: '/bumath/'` when the `GITHUB_ACTIONS` env var is set. On Vercel the app lives at the root, so base must be `/` unconditionally.

```typescript
// vite.config.ts — AFTER migration (simplified)
// Source: CLAUDE.md architecture section + codebase/STACK.md
export default defineConfig(({ mode }) => ({
  base: "/",          // Remove GITHUB_ACTIONS conditional entirely
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
```

### Pattern 3: Supabase Client Singleton

**What:** One `createClient()` call exported as a named constant. All other modules import this one instance. Multiple `createClient()` calls cause auth state desync bugs.

```typescript
// src/lib/supabase.ts
// Source: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
```

Note: The `Database` generic type (`createClient<Database>(...)`) is added in Phase 2 after running `supabase gen types typescript`. In Phase 1 the untyped call is correct — do not block on type generation.

### Pattern 4: Environment Variables

```
# .env.local (not committed — add to .gitignore if not present)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Vite exposes only `VITE_`-prefixed env vars to the browser bundle. Any var without the prefix is invisible to `import.meta.env` at runtime.

In production (Vercel): set these two vars in the Vercel project dashboard under Settings → Environment Variables. They are injected at build time, not served as a separate file.

### Anti-Patterns to Avoid

- **Never name the key `VITE_SUPABASE_SERVICE_ROLE_KEY`:** The service role key bypasses all RLS. It has no place in a Vite frontend build. The anon key is the only Supabase key that belongs in the frontend bundle.
- **Never call `createClient()` more than once:** Each call registers its own auth state listener. Importing from `src/lib/supabase.ts` singleton is mandatory across all future phases.
- **Do not leave `base: '/bumath/'` in vite.config.ts after Vercel migration:** Assets will load from the wrong path on Vercel, causing blank page or broken CSS.
- **Do not commit `.env.local`:** Ensure it is in `.gitignore`. The anon key is not a secret (it is embedded in the JS bundle visible to anyone) but committing env files sets a bad precedent for Phase 2+ when additional keys are added.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SPA routing fallback on Vercel | Custom 404.html redirect hack (GitHub Pages pattern) | `vercel.json` rewrites | The `404.html` hack loses query params and causes a flash; Vercel rewrites are transparent |
| Supabase client factory | Custom fetch wrapper around Supabase REST API | `@supabase/supabase-js` createClient | The SDK handles auth token injection, refresh, realtime, storage — rebuilding any part is unnecessary |
| Environment variable loading | `dotenv` or custom `.env` parser | Vite's built-in `import.meta.env` | Vite handles VITE_-prefixed vars natively in both dev and production build |

---

## Runtime State Inventory

Step 2.5: SKIPPED — This is not a rename/refactor/migration phase. No stored data, live service config, OS-registered state, secrets, or build artifacts need to be audited for a string rename.

The one partial exception is the GitHub Pages deployment itself: the existing live site at `https://phantrung18072001.github.io/bumath/` will continue to exist after Vercel migration until the GitHub Pages environment is disabled. This is not a data migration — it is a hosting cutover. The planner should include a step to disable the GitHub Pages environment in the repo settings after Vercel is confirmed working.

---

## Common Pitfalls

### Pitfall 1: Vite Base Path Left as `/bumath/` After Migration

**What goes wrong:** Assets (JS, CSS, fonts) request `/bumath/assets/...` instead of `/assets/...`. Vercel serves the app from the root domain, so these requests 404 silently. The app loads a blank white page.

**Why it happens:** The `GITHUB_ACTIONS` environment variable is only set in GitHub Actions CI — it evaluates to falsy on Vercel's build runners. So Vite uses `base: '/'` correctly. But if someone hard-codes `base: '/bumath/'` without the conditional, it breaks.

**How to avoid:** Remove the conditional entirely. Set `base: "/"` or omit `base` (default is `/`).

**Warning signs:** Blank page on Vercel; browser Network tab shows 404s for `/bumath/assets/index-xxx.js`.

### Pitfall 2: Env Vars Not Set in Vercel Dashboard

**What goes wrong:** The Supabase client initializes with `undefined` for both `supabaseUrl` and `supabaseAnonKey`. `createClient(undefined, undefined)` throws an error at import time, breaking the entire app.

**Why it happens:** Developers set vars in `.env.local` for local dev, test locally, push to Vercel, and forget to configure them in the Vercel project settings.

**How to avoid:** After connecting the GitHub repo to Vercel, immediately set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project Settings → Environment Variables → Production (and optionally Preview).

**Warning signs:** Vercel build succeeds but deployed app throws `Error: supabaseUrl is required` on load.

### Pitfall 3: GitHub Actions Deploy Workflow Still Active After Migration

**What goes wrong:** The `deploy.yml` workflow still runs on push to `main` and tries to deploy to GitHub Pages. This doesn't break the Vercel deployment but causes confusing CI failures if GitHub Pages is disabled, or creates a stale parallel deployment.

**Why it happens:** Developers connect Vercel but forget to remove the old workflow.

**How to avoid:** Delete `.github/workflows/deploy.yml` (or rename it with `.disabled` extension) as part of the migration task.

**Warning signs:** GitHub Actions runs show a `deploy.yml` job on every push; GitHub Pages environment is still listed in repo settings.

### Pitfall 4: Missing `.env.local` Entry in `.gitignore`

**What goes wrong:** `.env.local` with real Supabase keys gets committed to the public repo.

**Why it happens:** The default Vite `.gitignore` template includes `.env.local` but some Lovable-scaffolded projects may have a custom gitignore.

**How to avoid:** Verify `.env.local` is in `.gitignore` before creating the file.

**Warning signs:** `git status` shows `.env.local` as an untracked file that could be staged.

### Pitfall 5: Supabase Free Tier Pause

**What goes wrong:** Supabase pauses projects with no API activity for 7 days. During Phase 1 (no auth or DB calls yet), the project will likely go idle.

**Why it happens:** Free tier resource reclamation policy.

**How to avoid:** Accept this as a dev-phase inconvenience. Document in STATE.md: plan to upgrade to Pro or add a heartbeat before inviting real students (end of Phase 2 or Phase 3). This is already noted in STATE.md blockers.

---

## Code Examples

Verified patterns from official sources:

### Supabase Client Singleton (Phase 1 target)

```typescript
// src/lib/supabase.ts
// Source: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
```

### vercel.json (SPA routing fallback)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### vite.config.ts (after removing GITHUB_ACTIONS conditional)

```typescript
// Keep everything identical; only change: remove the ternary on `base`
// Before: base: process.env.GITHUB_ACTIONS ? "/bumath/" : "/",
// After:  (omit base entirely, defaults to "/")
```

### .env.local (template — never commit)

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Smoke test for supabase.ts import

```typescript
// src/lib/supabase.test.ts
// Source: Vitest pattern from existing src/test/example.test.ts
import { supabase } from '@/lib/supabase'

describe('supabase client', () => {
  it('exports the supabase client object', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
    expect(typeof supabase.auth.getSession).toBe('function')
  })
})
```

Note: This test runs in jsdom without real Supabase credentials. The client constructor does not make network calls — it just validates the URL format. The test verifies the module exports without error and the client shape is correct.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build toolchain | Yes | 18.20.8 | — |
| Yarn | Package manager | Yes | 4.11.0 | — |
| Vercel CLI | Programmatic deploy | No | — | Use GitHub repo integration via vercel.com dashboard (zero-config, preferred) |
| npm registry | Package install | Yes (via yarn) | — | — |
| @supabase/supabase-js@2.78.0 | Supabase client | Available on registry | 2.78.0 (verified) | — |

**Missing dependencies with no fallback:** None — all blocking dependencies are available.

**Missing dependencies with fallback:**
- Vercel CLI: not installed. Use the Vercel GitHub integration (connect repo at vercel.com) instead. No CLI required for the deployment path recommended in this research.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `yarn test src/lib/supabase.test.ts` |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-03 | `supabase` export from `src/lib/supabase.ts` is defined and has expected shape | unit | `yarn test src/lib/supabase.test.ts` | No — Wave 0 |
| INFRA-01 | SPA deep-link routing works (navigating to `/` returns 200, non-root path also serves index.html) | smoke (manual) | Not automatable in unit tests; verify by deploying and visiting deep URL in browser | N/A — manual |
| INFRA-02 | Vite env vars loaded correctly at build time | unit | `yarn test src/lib/supabase.test.ts` (import succeeds = vars loaded) | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `yarn test src/lib/supabase.test.ts`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/supabase.test.ts` — covers INFRA-02 and INFRA-03 (import success + client shape)
- [ ] No new fixtures needed; existing `src/test/setup.ts` covers jsdom setup

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GitHub Pages static hosting for SPA | Vercel with SPA rewrites | This migration | Deep links now work without the `404.html` redirect hack |
| `base: '/bumath/'` in vite.config | `base: '/'` (root) | This migration | Assets resolve correctly on the root domain |
| No backend client | Supabase JS singleton in `src/lib/supabase.ts` | This phase | All future phases can import `supabase` from one location |
| `@supabase/auth-helpers` (deprecated 2024) | Custom AuthContext (Phase 2) | 2024 deprecation | Avoid installing auth-helpers entirely |
| `@supabase/ssr` | N/A — SPA, not SSR | — | Do not install; it is for Next.js/SvelteKit SSR only |

---

## Open Questions

1. **Should the Supabase project be created before or during Phase 1?**
   - What we know: Phase 1 only needs the Supabase URL and anon key to be placed in env vars. No tables or auth config are required yet.
   - What's unclear: Whether a Supabase project already exists for this app, or needs to be created.
   - Recommendation: The planner should include a task "Create Supabase project and note the URL and anon key." This is a manual step (Supabase dashboard) with no code changes.

2. **Disable or delete GitHub Pages environment?**
   - What we know: After Vercel migration, GitHub Pages is redundant. The `deploy.yml` workflow should be removed.
   - What's unclear: Whether the existing GitHub Pages URL is linked anywhere (marketing material, README, Supabase Site URL setting).
   - Recommendation: Remove `deploy.yml`, disable GitHub Pages in repo settings. The old URL will 404 but there are no known external links to preserve.

3. **Vercel project name / production URL**
   - What we know: Vercel auto-generates a URL like `bumath.vercel.app` or `bumath-xyz.vercel.app`.
   - What's unclear: Whether a custom domain is needed before Phase 2 (the Supabase Auth Site URL must match the production origin for email confirmation links to work).
   - Recommendation: Document the final Vercel production URL at the end of Phase 1 and add it to STATE.md. Set it as the Supabase Site URL immediately (even though auth is Phase 2 — getting this right early avoids the "email links point to localhost" pitfall).

---

## Sources

### Primary (HIGH confidence)

- [Supabase React quickstart — official docs](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs) — createClient pattern, VITE_ env var naming, singleton pattern
- [Vercel SPA / Vite framework docs](https://vercel.com/docs/frameworks/vite) — vercel.json rewrite config for client-side routing
- npm registry — `@supabase/supabase-js@2.78.0` existence verified with `npm view @supabase/supabase-js@2.78.0 version` (returned `2.78.0`, 2026-03-24)
- `vite.config.ts` in repo — confirmed current `GITHUB_ACTIONS` conditional base path (read directly, 2026-03-24)
- `.planning/research/STACK.md` — pre-existing stack research with Node 18 / supabase-js version compatibility analysis (HIGH confidence, sourced from npm)
- `.planning/research/PITFALLS.md` — pre-existing pitfalls research (HIGH confidence, sourced from official Supabase docs and GitHub discussions)

### Secondary (MEDIUM confidence)

- `.planning/codebase/STACK.md` — direct codebase analysis confirming Yarn 4.11.0, Vite 5.4.19, Node 18.20.8, existing `src/lib/` directory (MEDIUM — automated analysis, verified against actual files)

### Tertiary (LOW confidence)

None — all findings for this phase are verifiable against the repository directly or official docs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — version confirmed on npm registry; all existing packages verified from repo files
- Architecture: HIGH — patterns sourced from official Supabase and Vercel docs; vite.config.ts read directly
- Pitfalls: HIGH — sourced from pre-existing .planning/research/PITFALLS.md which cites official docs and GitHub discussions

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable libraries; Vercel and Supabase APIs rarely break in 30-day window)
