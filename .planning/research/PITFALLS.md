# Pitfalls Research

**Domain:** LMS with Supabase backend (Auth + DB + Storage) on React/Vite SPA
**Researched:** 2026-03-23
**Confidence:** HIGH (Supabase auth/RLS/storage pitfalls are well-documented with official sources and community post-mortems)

---

## Critical Pitfalls

### Pitfall 1: RLS Infinite Recursion on Profiles/Roles Table

**What goes wrong:**
A policy on the `profiles` table that checks a `role` or `is_admin` column inside itself causes PostgreSQL to recurse infinitely. The query never resolves. This crashes the request with a 500 "infinite recursion detected in policy" error. It is one of the most commonly reported Supabase issues and is nearly universal when developers first implement a role-based permission system.

**Why it happens:**
The developer writes a SELECT policy on `profiles` that checks the current user's role — but that check is itself a SELECT on `profiles`. PostgreSQL evaluates the policy every time it accesses the table, including during the policy evaluation itself.

Example trigger:
```sql
-- BROKEN: self-referential policy
CREATE POLICY "admins can see all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**How to avoid:**
Use a `SECURITY DEFINER` function that bypasses RLS when called, then reference that function in policies instead of the raw table.

```sql
-- Safe: security definer function breaks the recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- Policy now calls the function, not the table directly
CREATE POLICY "admins can see all profiles"
ON profiles FOR SELECT
USING (is_admin());
```

Alternatively, store the admin role in `app_metadata` via a server-side function, then read it from `auth.jwt() -> 'app_metadata' ->> 'role'` — no table lookup needed inside the policy.

**Warning signs:**
- 500 errors when any authenticated user hits a Supabase query
- Error message: "infinite recursion detected in policy for relation profiles"
- Works fine in the Supabase Dashboard SQL editor (which runs as superuser) but fails from the JS client

**Phase to address:**
Auth & Roles phase — when defining the `profiles` table and first writing admin/role policies.

---

### Pitfall 2: user_metadata is User-Writable — Never Use It for RLS

**What goes wrong:**
An RLS policy based on `auth.jwt() -> 'user_metadata' ->> 'role'` (or `raw_user_meta_data`) can be bypassed by any authenticated user. Any user can call `supabase.auth.updateUser({ data: { role: 'admin' } })` from the browser and gain admin-level access immediately — no server involved.

**Why it happens:**
`user_metadata` is documented as the field the user can update themselves. It is designed for things like display name and preferences. Developers confuse it with `app_metadata`, which only server-side code can write.

**How to avoid:**
- Never use `user_metadata` / `raw_user_meta_data` in RLS policies.
- Store roles in a dedicated `profiles` table and enforce writes to the `role` column via RLS (only admins can update `role`).
- For JWT-native role claims: use a custom access token hook (Supabase Auth Hooks) that reads the `profiles.role` column and injects a claim into `app_metadata`. Then read the role from `auth.jwt() -> 'app_metadata' ->> 'role'` — this is safe because only your server-side hook can write `app_metadata`.

**Warning signs:**
- RLS policy contains `raw_user_meta_data` or `user_metadata`
- No server-side function controls role assignment

**Phase to address:**
Auth & Roles phase — when first designing the role/permission model.

---

### Pitfall 3: GitHub Pages + BrowserRouter = Broken Deep Links in Production

**What goes wrong:**
The existing project is deployed to GitHub Pages with `base: '/bumath/'` in `vite.config.ts`. After adding authenticated routes (`/dashboard`, `/courses/:id`, etc.), any direct navigation to those URLs returns a 404. Sharing a link to a lesson page causes a blank 404 page. Page refresh on any non-root route breaks.

**Why it happens:**
GitHub Pages serves static files. When a user navigates to `/bumath/courses/123`, GitHub Pages looks for a file at that path and returns 404. React Router never gets to handle the route because the browser request never reaches `index.html`. This is a fundamental limitation of static hosting with `BrowserRouter`.

**How to avoid:**
Migrate to Vercel or Netlify before adding authenticated routes. Both support SPA fallback rewrites out of the box.

- Vercel: add `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Netlify: add `_redirects` file: `/* /index.html 200`

Also update `vite.config.ts` to remove the conditional `base: '/bumath/'` — on Vercel/Netlify the app lives at the root domain, not a subpath.

**Warning signs:**
- 404 on page refresh for any route other than `/`
- Sharing lesson links returns GitHub's 404 page
- The `GITHUB_ACTIONS` env check in `vite.config.ts` that sets `base: '/bumath/'` — this entire block is obsolete after migration

**Phase to address:**
Deployment migration phase — must happen before any auth/routing work is merged to production.

---

### Pitfall 4: Email Confirmation Redirect Points to Localhost in Production

**What goes wrong:**
A user registers, receives a confirmation email, clicks the link — and lands on `http://localhost:3000` (the development URL). The session token in the URL fragment is consumed by a page that doesn't exist. The user cannot complete registration. This is a silent failure from the user's perspective.

**Why it happens:**
Supabase's "Site URL" defaults to `http://localhost:3000` in new projects. The email confirmation link is built using this Site URL. Developers test locally (it works), deploy to production, but forget to update the Site URL in the Supabase Dashboard under Authentication > URL Configuration.

**How to avoid:**
1. Set "Site URL" to the production domain (e.g., `https://bumath.vercel.app`) immediately after creating the Supabase project.
2. Add localhost to "Redirect URLs" allowlist for local development.
3. Handle the hash fragment in the React app: Supabase sends the session as `#access_token=...&type=signup` in the URL. Add a `/auth/callback` route that calls `supabase.auth.getSession()` to exchange the token.
4. For email clients that prefetch links (Microsoft Defender Safe Links), use OTP-style token confirmation rather than magic links by redirecting to a custom confirmation page that extracts `token_hash` and calls `supabase.auth.verifyOtp()`.

**Warning signs:**
- Email confirmation links contain `localhost` when inspecting the email in production
- Users report "link expired or invalid" after clicking confirmation email
- Registration works in local dev but fails for production users

**Phase to address:**
Auth phase — configure Site URL before any email-based auth flow is tested.

---

### Pitfall 5: Supabase Free Tier Pauses After 7 Days of Inactivity

**What goes wrong:**
If the project launches on Supabase's free tier and sees low initial traffic, Supabase automatically pauses the project after 7 days of inactivity. All API requests return errors. Students trying to log in or view lessons get broken pages. Unpausing can take several minutes and is manual.

**Why it happens:**
Supabase pauses free-tier projects to reclaim infrastructure. Any project with no API requests for 7 days is paused automatically.

**How to avoid:**
- Upgrade to the Pro plan ($25/month) before going to production with real students.
- If staying on free during development: set up a scheduled GitHub Actions job to ping a Supabase health endpoint every 3 days.
- Monitor the Supabase Dashboard for "Project paused" warnings.

**Warning signs:**
- Students report "can't log in" suddenly
- All Supabase API calls return 503 or connection refused
- Dashboard shows project in "Paused" state

**Phase to address:**
Deployment phase — decide and document the plan (upgrade or heartbeat) before inviting real students.

---

### Pitfall 6: RLS Enabled But No Policies = Table Locked Out (Silent Failure)

**What goes wrong:**
A developer enables RLS on a table but has not yet written any policies. All queries from the JS client return empty results (not errors). Authenticated users see no data. INSERT operations silently fail. This looks like a bug in the frontend query code and takes significant debugging time to trace back to RLS.

**Why it happens:**
Supabase's RLS default deny behavior is correct from a security standpoint, but it fails silently — the response is an empty array, not a permission error. Most developers expect an error when access is denied.

**How to avoid:**
- After enabling RLS on any table, immediately write at least a read policy before testing from the client.
- Use the Supabase policy tester (RLS → "Test via SQL") to verify policies as the correct role.
- Enable policy violation logging during development: check Supabase Dashboard → Logs → Postgres for "permission denied" entries.
- Write a standard set of policies for every table at the time of table creation, not as an afterthought.

**Warning signs:**
- Query returns empty array but no error, while Dashboard SQL editor returns data
- `count(*)` from the dashboard returns rows but the JS client returns 0 rows

**Phase to address:**
Database setup phase — establish a convention: RLS on + policies written = done, never half-done.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip RLS, rely on server-side checks | Faster initial dev | Any client with the anon key can read/write all rows. 170+ Lovable-built apps were exposed in 2025 this way. | Never |
| Use `user_metadata` for roles | Simple, no extra table | Bypassed by any authenticated user via `updateUser()` | Never |
| One Supabase client instance per component | No setup complexity | Multiple auth event listeners, memory leaks, auth state desync | Never — use a singleton module |
| Store service role key in Vite env var (VITE_SUPABASE_SERVICE_KEY) | Easy access anywhere | Key is exposed in bundle, bypasses all RLS | Never — service key only in server-side code |
| Disable email confirmation during development | Faster testing | Forget to re-enable; production users can register with unverified emails | OK in dev, must re-enable for production |
| Store file paths in localStorage instead of DB | Fast prototype | Not tied to user sessions, data lost on device switch | Never for LMS (lesson progress must be server-side) |
| Skip client-side image compression before upload | Less code | 10MB+ phone camera photos clog the 1GB free storage allocation quickly, and uploads fail on slow mobile connections | Never for student submissions |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth + React | Calling `supabase.auth.getUser()` on every render to get the current user | Subscribe to `onAuthStateChange` once in a context provider; expose the session object via context |
| Supabase Auth + React StrictMode | Not unsubscribing from `onAuthStateChange`, causing double subscriptions in development | Always return the unsubscribe function from `useEffect`: `return () => subscription.unsubscribe()` |
| Supabase Auth + TanStack Query | Treating auth state as a server query (polling) | Auth state comes from `onAuthStateChange`, not from a `useQuery`. Invalidate all queries when auth state changes |
| Supabase Storage + private bucket | Forgetting RLS policies on `storage.objects` | Private bucket requires explicit INSERT policy for uploads and SELECT policy for downloads; defaults to deny |
| Supabase Storage + upsert (overwrite) | Only adding INSERT policy | Upsert requires INSERT + SELECT + UPDATE policies on `storage.objects` |
| YouTube embed + CSP headers | No frame-src directive | Add `frame-src https://www.youtube.com https://www.youtube-nocookie.com` to CSP; use `youtube-nocookie.com` embed URL for privacy |
| Vite + Supabase env vars | Using `SUPABASE_URL` without `VITE_` prefix | Vite only exposes `VITE_`-prefixed vars to the browser bundle; use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| React Router v6 + Supabase session | Redirecting to `/login` inside route components before session is loaded | Render a loading state while the initial session is being resolved; avoid redirect before `loading === false` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| RLS policy does a table scan on every row query | Slow queries on submission list for grading dashboard | Add index on every column used in RLS WHERE clauses (`user_id`, `course_id`); Supabase docs list this as the top performance killer | ~500+ rows in submissions table |
| Calling `auth.getUser()` (network call) instead of `auth.getSession()` (local) to check auth state | Slow page loads; every protected component makes an extra network round-trip | Use `getSession()` for UI decisions; only use `getUser()` when server-side token validation is required | Every page load |
| N+1: loading course list then fetching lesson count per course with separate queries | Course list loads slowly as course count grows | Use a single query with count aggregation or a Postgres view | ~20+ courses |
| Large uncompressed images stored in Supabase Storage | 1GB free storage exhausted quickly; slow image load on mobile | Compress images client-side to ≤1MB before upload using `browser-image-compression` | First ~100 student submissions without compression |
| No pagination on submissions list | Grading dashboard freezes as submissions accumulate | Add `range()` pagination from day one; don't assume the list will stay small | ~200+ total submissions |
| Supabase Realtime subscription on every component | Multiple duplicate subscriptions, memory pressure | Centralize Realtime subscriptions in a context or at the page level; unsubscribe on unmount | Multiple students viewing same page simultaneously |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `VITE_SUPABASE_SERVICE_ROLE_KEY` in frontend bundle | Anyone can extract the key from the JS bundle and bypass all RLS; full unrestricted DB access | Service role key is only ever used in server-side code (Edge Functions, backend API). Never prefix it with `VITE_` |
| RLS disabled on `submissions` table | Any student can read or delete other students' submitted work | Enable RLS on every table; policy: students can only SELECT/INSERT their own rows; graders can SELECT all |
| RLS disabled on `lesson_progress` table | Students can mark any lesson as complete, or reset other students' progress | Student can only write rows where `user_id = auth.uid()` |
| Admin approval stored only in `user_metadata` | Student sets `approved: true` themselves | Store approval status in a `profiles` table column; only admin role can update the `status` column (enforced by RLS) |
| Public storage bucket for student submissions | Any unauthenticated user can access student homework photos by guessing the storage URL | Use a private bucket for `submissions`; generate signed URLs with short expiry for the grading dashboard |
| No file type validation on upload | Students upload `.exe`, `.php`, or massive video files as "homework" | Validate MIME type client-side and enforce allowed types (`image/jpeg`, `image/png`, `image/webp`, `image/heic`) in the bucket policy |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state while session resolves on initial load | Flash of unauthenticated UI (login button appears, then disappears) for logged-in users | Show a skeleton/spinner until `supabase.auth.getSession()` resolves on first render |
| Photo upload with no progress indicator | Student taps "submit" on mobile, nothing appears to happen, they tap again → double submission | Show upload progress bar; disable submit button during upload; deduplicate by checking for existing submission before insert |
| No image compression before upload | Students on mobile with 10–12MP cameras upload 8–15MB images; upload fails on slow 4G; if it succeeds, grader sees huge images that are slow to load | Compress client-side using `browser-image-compression` targeting ≤1MB / max 1920px before calling Supabase Storage upload |
| HEIC photos from iPhone not displayable in browser | `<img src="...">` renders broken image for `.heic` files; Safari is the only browser that supports HEIC | Convert HEIC to JPEG client-side or on upload using a library like `heic2any`; store as JPEG |
| Session expiry during long grading session | Teacher writes a detailed comment, submits grade — gets "not authenticated" error | Show session expiry warning before token expires; `onAuthStateChange` fires `TOKEN_REFRESHED` — wire this to a toast; Supabase auto-refreshes by default but only when the tab is active |
| No "already submitted" state visible before upload | Student uploads a second time thinking the first submission was lost | Check for existing submission on lesson load; show "Submitted [date]" with option to resubmit rather than a blank upload form |
| Email confirmation required but UI says "check your email" with no guidance | Vietnamese high school students may not know to check spam or understand what "confirm email" means | Write clear Vietnamese confirmation message; link to email provider help pages; add resend confirmation button |

---

## "Looks Done But Isn't" Checklist

- [ ] **Auth flow:** Email confirmation is enabled in Supabase Dashboard and the Site URL points to the production domain, not localhost.
- [ ] **Auth flow:** The `/auth/callback` (or equivalent) route exists in React Router and calls `supabase.auth.getSession()` to exchange the token from the URL hash.
- [ ] **Admin approval:** New student accounts start with `status = 'pending'`; RLS on `courses` and `lessons` blocks access until `status = 'approved'`. Test by logging in as a newly registered (unapproved) student.
- [ ] **RLS:** Every table in `public` schema has RLS enabled. Run `SELECT tablename FROM pg_tables WHERE schemaname = 'public'` and cross-check against the list of tables with RLS enabled.
- [ ] **Storage:** The `submissions` bucket is private. Attempt to fetch a submission URL without auth headers — should return 403.
- [ ] **File type:** Attempt to upload a non-image file to the submissions bucket from the browser — should be rejected before or at upload.
- [ ] **Image size:** Upload a real 12MP iPhone photo — verify the client-side compression fires and the final upload is under 1MB.
- [ ] **HEIC:** Upload a `.heic` photo from an iPhone — verify it is converted and displays correctly for the grader.
- [ ] **Progress tracking:** Mark a lesson complete; log out; log in again — verify the completed state persists (stored in DB, not local state).
- [ ] **Deep links:** Navigate directly to `/dashboard` or `/courses/1/lessons/2` in the browser — should not 404 (requires Vercel/Netlify redirect config, not GitHub Pages).
- [ ] **Grading notification:** Grade a submission — verify the student's submission status updates from "đã nộp" to "đã chấm" with the score visible.
- [ ] **Free tier pause:** If on free tier, verify a heartbeat mechanism is in place or a Pro upgrade is scheduled.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS infinite recursion shipped to production | MEDIUM | Immediately create the `SECURITY DEFINER` function; deploy via a Supabase migration; no data is lost, downtime is minutes |
| user_metadata used for admin role, compromised | HIGH | Audit `auth.users` table for `user_metadata` role tampering; revoke compromised sessions; migrate role storage to `profiles` table + drop old RLS policies; write new policies |
| Service role key leaked in bundle | HIGH | Regenerate the service role key immediately in Supabase Dashboard (Settings → API); update all server-side usages; the old key is immediately invalid |
| GitHub Pages → routes 404 in production | MEDIUM | Migrate to Vercel/Netlify (30–60 minutes); add SPA rewrite config; update DNS — no DB changes needed |
| Free tier paused, students locked out | LOW | Resume project via Supabase Dashboard (takes 1–5 minutes); add Pro plan or heartbeat to prevent recurrence |
| Private bucket accidentally set to public | MEDIUM | Change bucket to private immediately in Dashboard; audit Storage logs for unauthorized access; existing public URLs stop working immediately |
| Student submissions full of 10MB uncompressed images | MEDIUM | Add client-side compression (new code); existing files remain large but can be cleaned up via a migration script using Supabase Storage API |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RLS infinite recursion | Auth + DB schema phase | Run all queries as an authenticated (non-admin) user; confirm no 500 errors |
| user_metadata for roles | Auth + DB schema phase | Attempt `supabase.auth.updateUser({ data: { role: 'admin' } })` from browser; confirm admin access not granted |
| GitHub Pages + BrowserRouter 404 | Deployment migration phase (before any LMS routes) | Navigate directly to a deep route URL; verify index.html is served |
| Email confirmation redirect to localhost | Auth phase | Register a test account in production; inspect the confirmation email link |
| Free tier pause | Deployment phase | Document the heartbeat or Pro upgrade decision in PROJECT.md |
| RLS enabled, no policies | DB schema phase (every table) | Query each table as the `anon` role; verify empty without error; query as authenticated user; verify correct rows returned |
| Exposed service role key | Any phase using Supabase | Grep the Vite bundle output for the service role key string |
| No image compression | Student submission phase | Upload a raw camera photo; verify upload completes under 5 seconds on a throttled connection |
| HEIC incompatibility | Student submission phase | Upload a `.heic` file; verify it renders in the grading view |
| Unprotected student submission files | Storage + Auth phase | Fetch a storage URL without auth headers; expect 403 |
| CSP blocking YouTube embed | Video lesson phase | Load a lesson page with a YouTube embed; check browser console for CSP violations |

---

## Sources

- [Supabase RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [Row Level Security — Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Auth Quickstart for React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [User Sessions — Supabase Docs](https://supabase.com/docs/guides/auth/sessions)
- [Redirect URLs — Supabase Docs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Storage File Limits](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Understanding API Keys — Supabase Docs](https://supabase.com/docs/guides/api/api-keys)
- [Infinite recursion in profiles RLS policy — GitHub Discussion #1138](https://github.com/supabase/supabase/discussions/1138)
- [Infinite recursion in profiles RLS policy — GitHub Discussion #32579](https://github.com/orgs/supabase/discussions/32579)
- [RLS References user_metadata — Supabase Splinter Linter](https://supabase.github.io/splinter/0015_rls_references_user_metadata/)
- [RLS policy based on user metadata — Discussion #13091](https://github.com/orgs/supabase/discussions/13091)
- [Free tier inactivity pausing — supabase-pause-prevention](https://github.com/travisvn/supabase-pause-prevention)
- [Fixing RLS Misconfigurations — ProsperaSoft](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/)
- [Fix Supabase CORS Errors — corsproxy.io guide](https://corsproxy.io/blog/fix-supabase-cors-errors/)
- [GitHub Pages does not support SPA routing — community discussion #64096](https://github.com/orgs/community/discussions/64096)
- [How to Use Supabase with TanStack Query (React Query v5) — Makerkit](https://makerkit.dev/blog/saas/supabase-react-query)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [GoTrueClient Memory Leak — auth-js issue #856](https://github.com/supabase/auth-js/issues/856)
- [onAuthStateChange unsubscribe pattern — Discussion #5282](https://github.com/orgs/supabase/discussions/5282)
- [CSP for YouTube iframe embeds — csplite.com](https://csplite.com/csp/test40/)
- [react-image-file-resizer — GitHub](https://github.com/onurzorluer/react-image-file-resizer)

---

*Pitfalls research for: LMS (Supabase Auth + DB + Storage) on React/Vite SPA*
*Researched: 2026-03-23*
