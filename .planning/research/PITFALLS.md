# Pitfalls Research

**Domain:** LMS with Supabase backend (Auth + DB + Storage) on React/Vite SPA — v3.0 Feature Additions
**Researched:** 2026-05-03 (updated from original v1.0 research)
**Confidence:** HIGH — findings based on direct codebase inspection + Supabase documented behaviours

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

## v3.0 Feature Addition Pitfalls

> These pitfalls are specific to adding chat, mock exams, pricing tiers, study materials, and admin UX to the **existing** BuMath LMS. They arise from interactions with the existing schema, RLS policies, and client architecture. New-project pitfalls above still apply; these are the additional ones that emerge when *extending* a live system.

---

### CRITICAL: Lesson Access is Currently Client-Side Only — Pricing Tiers Will Expose This

**What goes wrong:**
Migration `20260427_13_catalogue_rls.sql` explicitly states: *"The 'lock' is enrollment (teacher assigns students), not RLS."* The current policies `approved_user_read_all_chapters` and `approved_user_read_all_lessons` allow ANY approved user to SELECT all lessons and chapters from the DB — regardless of enrollment. The frontend enforces the lock by hiding the UI for non-enrolled students.

When pricing tiers are added, the instinct is to add a new pricing check to existing RLS policies. But if the new policy is written incorrectly (too restrictive), it will lock out **all existing enrolled students who have no package record** — causing immediate service disruption.

**Why it happens:**
The existing system uses a "preview with UI lock" pattern that works for manual enrollment (admin controls everything). Adding payment-gated tiers introduces a second access dimension that the DB layer doesn't currently model. Developers new to the codebase assume RLS enforces access; it doesn't — the frontend does.

**How to avoid:**

1. **Do not modify existing lesson/chapter SELECT policies until the package data model is complete and all existing enrollments are migrated.**

2. **Add a new `purchased_packages` or `enrollments.package_tier` column** to represent tier access, then write a new RLS policy only after all existing enrollment rows have a backfill value:
   ```sql
   -- Step 1: add column with a safe default
   ALTER TABLE enrollments ADD COLUMN package_tier TEXT NOT NULL DEFAULT 'legacy';
   -- Step 2: backfill all existing enrolled students as 'legacy' (full access)
   UPDATE enrollments SET package_tier = 'legacy';
   -- Step 3: THEN add the tier check to lesson RLS, treating 'legacy' as full access
   ```

3. **Keep the existing permissive policies intact and add a new gating policy on a new `lesson_access_tier` column** on the lessons table (e.g., `free`, `basic`, `premium`), so lessons default to unlocked if no tier is set.

4. Test with three user scenarios before deploying:
   - Existing enrolled student (no package record): must still see all lessons
   - New student with a package: must see only tier-appropriate lessons
   - Unenrolled approved student: must still see preview metadata (titles, not content)

**Warning signs:**
- Any migration that `DROP POLICY`s `approved_user_read_all_lessons` or `approved_user_read_all_chapters` without a replacement policy that includes a `legacy` enrollment path
- RLS policies that JOIN `purchased_packages` without handling the NULL case (student with no package record → NULL JOIN → policy returns false → locked out)

**Phase to address:**
Pricing + Access Control phase — write the migration against a test DB with seeded enrolled students first.

---

### CRITICAL: Supabase Realtime Channel Leak — React StrictMode Double-Mount

**What goes wrong:**
In-lesson chat uses `supabase.channel('lesson-chat:${lessonId}').on('postgres_changes', ...).subscribe()`. In React 18 StrictMode, components mount → unmount → remount during development. If the cleanup in `useEffect` doesn't call `supabase.removeChannel(channel)`, you get two active subscriptions for the same channel. In production, navigating between lessons without removing channels accumulates orphaned subscriptions — eventually hitting Supabase's connection limit (200 concurrent connections on free tier, 500 on Pro).

Additionally, `onInsert` events may fire twice for a single message (Supabase Realtime can deliver duplicate events under reconnection). Without deduplication, chat messages appear doubled.

**Why it happens:**
The existing `supabase.ts` creates the client without `realtime` options. Channels are channel-level objects — they're not automatically cleaned up when the React component unmounts. The current codebase has no Realtime usage, so there is no established pattern for cleanup.

**How to avoid:**

```tsx
// CORRECT pattern for in-lesson chat subscription
useEffect(() => {
  const channel = supabase
    .channel(`lesson-chat:${lessonId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'lesson_messages',
      filter: `lesson_id=eq.${lessonId}`,
    }, (payload) => {
      setMessages(prev => {
        // Deduplicate by message ID
        if (prev.some(m => m.id === payload.new.id)) return prev
        return [...prev, payload.new as Message]
      })
    })
    .subscribe()

  // CRITICAL: cleanup on unmount
  return () => {
    supabase.removeChannel(channel)
  }
}, [lessonId])
```

Do NOT do: `supabase.channel(...).subscribe()` inside `useEffect` without a cleanup return. Do NOT reuse the channel across renders by storing it in state — store it in a ref instead.

**Deduplication rule:** Every message in the chat table must have a stable UUID `id`. The React state must deduplicate incoming Realtime events against the existing local state by `id`.

**Warning signs:**
- Browser console shows multiple "SUBSCRIBED" log lines for the same channel name
- Chat messages appear duplicated
- Supabase Dashboard → Realtime → Connections shows rising connection count with no corresponding user growth
- `supabase.getChannels()` returns channels with the same name

**Phase to address:**
In-Lesson Chat phase — establish the cleanup pattern before writing any other Realtime code.

---

### CRITICAL: Exam Answers Exposed in Network Responses — No Server-Side Answer Separation

**What goes wrong:**
If the mock exam API query fetches questions and answers together (e.g., `SELECT * FROM exam_questions`), the correct answers are visible in the browser Network tab. A student opens DevTools → Network → previews the JSON response → sees all answers before attempting any questions.

**Why it happens:**
In a client-rendered SPA with Supabase, every query goes directly from browser to Supabase DB. There is no server middleware to strip sensitive fields. RLS only controls which rows you can see, not which columns within those rows.

**How to avoid:**

**Schema design approach (recommended for this stack):**

```sql
-- Store answers in a SEPARATE table with restrictive RLS
CREATE TABLE exam_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES exam_questions(id),
  correct_option_index INTEGER NOT NULL, -- 0-3 for multiple choice
  explanation TEXT
);

-- Students can NEVER read this table directly
ALTER TABLE exam_question_answers ENABLE ROW LEVEL SECURITY;
-- No SELECT policy for students — access denied by default
CREATE POLICY "only_admin_reads_answers"
  ON exam_question_answers FOR SELECT
  USING (get_my_role() IN ('admin', 'teacher'));
```

**Grading via Edge Function or DB Function:**
When a student submits answers, call a Supabase Edge Function or PostgreSQL function (SECURITY DEFINER) that:
1. Receives `{ exam_id, answers: [{question_id, selected_option}] }`
2. Compares against `exam_question_answers` server-side (table is not accessible to the student)
3. Returns `{ score, correct_count, total }` — never the answers themselves

**Warning signs:**
- Exam schema has `correct_answer` column on the same `exam_questions` table that students can SELECT
- No Edge Function or DB function for grading — grading logic lives entirely in React

**Phase to address:**
Mock Exam phase — design schema with answer separation before writing any exam UI.

---

### CRITICAL: Client-Side Exam Timer Is Trivially Manipulated

**What goes wrong:**
If exam time tracking uses `useState` + `setInterval` in the browser, a student can: (a) pause JavaScript execution in DevTools, (b) change system clock, (c) close and reopen the tab to reset the countdown, or (d) simply delay submission indefinitely. The timer shows "0:00" but the student keeps writing.

**Why it happens:**
Client-side timers are appropriate for UI display but cannot be trusted for access enforcement. The natural implementation copies the countdown-timer pattern from UI libraries.

**How to avoid:**

```sql
-- Store exam START time server-side, not client-side
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exam_id UUID NOT NULL REFERENCES exams(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ, -- NULL until submitted
  answers JSONB, -- submitted answers
  score NUMERIC(5,2),
  UNIQUE (user_id, exam_id) -- prevent re-attempts
);
```

**Enforcement at submission:** The submission handler (Edge Function or DB function) must check:
```sql
-- Reject submission if time has expired
IF (now() - attempt.started_at) > (exam.duration_minutes * INTERVAL '1 minute') THEN
  RAISE EXCEPTION 'Exam time has expired';
END IF;
```

**Client-side timer role:** The React countdown is ONLY for display. It reads `started_at` from the DB record and computes remaining time from `now()`. When it hits 0, auto-submit fires. The server enforces the hard cutoff.

**Warning signs:**
- No `started_at` column in the exam attempts table
- Submission endpoint does not validate `started_at + duration < now()`
- Timer state comes from `useState(examDurationSeconds)` with no connection to a server-stored start time

**Phase to address:**
Mock Exam phase — define the attempt model before building any exam UI.

---

### CRITICAL: Pricing Migration — Existing Enrolled Students Must Have Explicit Access

**What goes wrong:**
v3.0 adds pricing packages (1.5tr–4tr). When a new `package_tier` requirement is added to lesson access control, every student enrolled before the pricing system existed has no package record. They are effectively locked out of content they paid for (with time, not money — they were manually enrolled). This is a catastrophic regression for existing students.

**Why it happens:**
Adding an access control dimension to an existing system always creates orphans — records that predate the new dimension. The new policy defaults to "no access" (deny by default in RLS), so existing users without a matching package record get nothing.

**How to avoid:**

**The "grandfather" migration pattern:**

```sql
-- When adding pricing, create a 'legacy_full_access' package
INSERT INTO packages (id, name, tier, grants_access_to)
VALUES ('00000000-0000-0000-0000-000000000001', 'Legacy Enrollment', 'legacy', ARRAY['all']);

-- Back-fill all existing enrollments
ALTER TABLE enrollments ADD COLUMN package_id UUID REFERENCES packages(id);
UPDATE enrollments SET package_id = '00000000-0000-0000-0000-000000000001';
ALTER TABLE enrollments ALTER COLUMN package_id SET NOT NULL;
```

**RLS policy must explicitly handle legacy:**
```sql
-- Legacy package = full access to all lessons
USING (
  is_approved_user() AND (
    -- Legacy enrollment (existing students): full access
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN packages p ON p.id = e.package_id
      WHERE e.user_id = auth.uid()
        AND e.course_id = lessons.course_id
        AND p.tier = 'legacy'
    )
    OR
    -- New package enrollment: check tier against lesson tier
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN packages p ON p.id = e.package_id
      WHERE e.user_id = auth.uid()
        AND e.course_id = lessons.course_id
        AND lesson_is_accessible_for_package_tier(lessons.id, p.tier)
    )
  )
)
```

**Deployment order:**
1. Add `packages` table and `legacy` package row
2. Add `package_id` column to `enrollments` with NULL allowed
3. Back-fill all existing `enrollments.package_id` to legacy package
4. Add NOT NULL constraint
5. NOW add the new RLS policies
6. Never do 1 and 5 in the same migration

**Warning signs:**
- A single migration that simultaneously adds pricing tables AND drops existing permissive policies
- No `legacy` or `grandfather` package record before going live
- Backfill is skipped because "existing students will get new packages anyway"

**Phase to address:**
Pricing + Access Control phase — the backfill migration must be step 1, before any RLS changes.

---

### RLS N+1 Performance — Package Tier JOINs on Every Row

**What goes wrong:**
Adding a pricing tier check to lesson RLS like:
```sql
EXISTS (
  SELECT 1 FROM enrollments e JOIN packages p ON p.id = e.package_id
  WHERE e.user_id = auth.uid() AND e.course_id = chapters.course_id AND ...
)
```
This correlated subquery runs **once per row** returned by any `SELECT * FROM lessons`. If a course has 50 lessons, Postgres evaluates this 50 times. As courses grow, this causes significant latency.

**Why it happens:**
RLS policies with correlated subqueries are evaluated per-row. Developers don't think of RLS as "code that runs for every row" — they think of it as a one-time gate. But Postgres runs the policy WHERE clause for each candidate row.

**How to avoid:**

**Indexing:** Every column used in RLS subqueries must be indexed:
```sql
CREATE INDEX idx_enrollments_user_course ON enrollments (user_id, course_id);
CREATE INDEX idx_enrollments_package_id ON enrollments (package_id);
CREATE INDEX idx_lesson_access_tier ON lessons (access_tier);
```

**Function-based caching:** Wrap the package tier lookup in a `SECURITY DEFINER` + `STABLE` function so Postgres can cache the result within a single query:
```sql
CREATE OR REPLACE FUNCTION get_my_package_tier_for_course(p_course_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT p.tier FROM enrollments e
  JOIN packages p ON p.id = e.package_id
  WHERE e.user_id = auth.uid() AND e.course_id = p_course_id
  LIMIT 1
$$;
```

**Warning signs:**
- Slow lesson list load (> 500ms) after adding package tier RLS
- `EXPLAIN (ANALYZE)` shows sequential scans on `enrollments` inside the policy
- No indexes on `enrollments (user_id, course_id)`

**Phase to address:**
Pricing + Access Control phase — add indexes in the same migration as the RLS policy.

---

### Admin Route Conflicts — Param Overlap with New Form Pages

**What goes wrong:**
The existing route `/admin/courses/:courseSlug` matches any slug, including intended new paths like `/admin/courses/new` and `/admin/courses/:courseSlug/chapters/new`. React Router v6 evaluates routes from top to bottom; if the param route appears first, `new` is captured as the `courseSlug` param and the "New Course" component never renders.

Additionally, adding `/admin/courses/:courseSlug/chapters/:chapterSlug/lessons/new` — a deep nested route — requires restructuring the existing route hierarchy without breaking the existing `ChaptersPage` and `LessonsPage` which currently live at the same URL depth.

**Why it happens:**
Param routes (`:courseSlug`) are catch-all for that path segment. Literal routes (`new`) at the same depth must appear BEFORE the param route in the router definition. When developers add new routes to a long route list, they often append to the bottom — below the existing param routes.

**How to avoid:**

In React Router v6, order literal routes BEFORE param routes at the same depth:

```tsx
// CORRECT ordering
<Route path="/admin/courses" element={<CoursesPage />} />
<Route path="/admin/courses/new" element={<NewCoursePage />} />  {/* before :courseSlug */}
<Route path="/admin/courses/:courseSlug" element={<ChaptersPage />} />
<Route path="/admin/courses/:courseSlug/chapters/new" element={<NewChapterPage />} />  {/* before :chapterSlug */}
<Route path="/admin/courses/:courseSlug/chapters/:chapterSlug" element={<LessonsPage />} />
```

Alternatively, use a naming convention that avoids collision: prefix param routes with a unique identifier (e.g., `_` for UUIDs) or use action paths with query strings instead of path segments (`/admin/courses?action=new`).

**Warning signs:**
- Navigating to `/admin/courses/new` shows the ChaptersPage for a course named "new"
- 404 or blank page when navigating to the new form
- Existing course detail page stops working after adding new routes

**Phase to address:**
Admin UX phase — audit the full route tree before adding any new admin paths.

---

### Supabase Realtime Connection Limit — Lesson Chat on Free Tier

**What goes wrong:**
Supabase free tier supports **200 concurrent Realtime connections**. If each student with an open lesson tab holds one Realtime channel (for in-lesson chat), 200 concurrent students saturate the connection pool. New connections are rejected silently — the chat simply stops working for new joiners with no error visible to the student.

**Why it happens:**
Each `supabase.channel(...).subscribe()` call opens a WebSocket connection. Browser tabs in the background maintain the connection. Students watching a long video lecture keep the channel open for 30–60 minutes.

**How to avoid:**

**Lazy channel opening:** Only open the Realtime channel when the user clicks the "Chat" tab, not when the lesson page loads:
```tsx
// Only subscribe when chat tab is active
const [chatTabActive, setChatTabActive] = useState(false)

useEffect(() => {
  if (!chatTabActive) return
  const channel = supabase.channel(...)
  // ...cleanup
  return () => supabase.removeChannel(channel)
}, [chatTabActive, lessonId])
```

**Visibility-based pause:** When the browser tab is hidden (`document.visibilityState === 'hidden'`), close the channel. Reopen when visible. This prevents idle background tabs from holding connections.

**On Supabase free tier:** Monitor the Realtime → Connections panel. If approaching the limit, upgrade to Pro (500 connections) or implement channel sharing (one channel per lesson, not per user — use `broadcast` mode for high-traffic lessons).

**Warning signs:**
- Students report "chat not loading" during peak class hours
- Supabase Dashboard → Realtime shows connection count near the limit
- No visibility change handler in the chat component

**Phase to address:**
In-Lesson Chat phase — implement lazy channel opening as the default pattern.

---

### Study Materials — Signed URL Expiry vs. UX Tradeoff

**What goes wrong:**
Study material PDFs stored in Supabase Storage (private bucket) require signed URLs for access. If the expiry is too short (e.g., 60 seconds), a student who opens the PDF in a new tab and then tries to reload it gets a 403. If the expiry is too long (e.g., 24 hours), a student can share the signed URL with non-enrolled friends before it expires.

Additionally, if PDFs are stored in the existing **public** `assignments` bucket (used for lesson assignment PDFs), they are accessible to anyone with the URL — no enrollment check. Study materials have higher value and should not share a bucket with assignment attachments.

**Why it happens:**
Signed URL duration is set once at generation time. Short expiry is secure but breaks UX. Developers reach for the existing bucket rather than creating a new private one.

**How to avoid:**

1. **Use a separate private `study-materials` bucket** — do not mix with the existing `assignments` bucket.
2. **Set signed URL expiry to 1 hour** for download links. Regenerate on each page load rather than caching the URL in state.
3. **RLS on storage.objects** must check enrollment + package tier before allowing the signed URL generation:
   ```sql
   CREATE POLICY "enrolled_students_can_read_study_materials"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'study-materials'
     AND is_approved_user()
     AND EXISTS (
       SELECT 1 FROM study_material_access sma
       WHERE sma.file_path = name
         AND sma.user_id = auth.uid()
     )
   );
   ```
4. For PDF inline viewing (not just download), use the Supabase JS `createSignedUrl()` method with a 3600s expiry, then render in an `<iframe>` or `<embed>`.

**Warning signs:**
- Study material PDFs stored in a public bucket or the same bucket as assignment attachments
- Signed URL generated once on component mount and cached in state for the lifetime of the component
- No access control on the storage bucket beyond "authenticated user"

**Phase to address:**
Study Materials phase — create the new bucket and RLS before uploading any PDF files.

---

### YouTube Unlisted Videos — What It Does and Does Not Protect

**What goes wrong:**
Marking a YouTube video as "unlisted" prevents it from appearing in search results and the creator's channel, but the video is **publicly playable** by anyone who has the URL. If a student copies the YouTube video ID from the embed URL (`youtube.com/embed/VIDEO_ID`) and shares it, anyone can watch the full video. Domain-based embed restrictions also don't prevent direct `youtube.com/watch?v=VIDEO_ID` playback.

**Why it happens:**
Developers conflate "unlisted" with "private." YouTube's privacy model has three levels: Public, Unlisted, and Private. Unlisted is not the same as private — it just hides the video from indexing. The URL is the only protection.

**What YouTube domain restriction DOES protect:**
Setting allowed domains in YouTube's embed settings prevents `<iframe>` embedding on OTHER websites. It does NOT prevent:
- Direct playback on youtube.com/watch
- Playback via the YouTube mobile app
- Third-party players that bypass embed restrictions
- Screen recording

**The real threat model for BuMath:**
The primary risk is not sophisticated bypass — it's students casually sharing the YouTube URL with friends. The business model (manual enrollment, Vietnamese THCS market) means protecting against casual sharing, not determined pirates.

**Recommended approach:**
1. Keep videos unlisted (not public)
2. Enable domain embed restriction (`bumath.vercel.app` only)
3. Use `youtube-nocookie.com` embed URLs for privacy
4. Accept that determined students can share URLs — the content is homework help, not high-value IP
5. Do NOT store the YouTube URL in a way that requires additional DB access per load; the current approach of storing `video_url` in the `lessons` table is fine

**What to NOT do:**
- Do not build a proxy server to hide YouTube video IDs — this violates YouTube ToS and is overkill for this use case
- Do not store video IDs separately from URLs thinking that prevents exposure — the embed URL contains the ID

**Warning signs:**
- Team spending significant engineering time on "video protection" beyond unlisted + domain restriction
- Considering self-hosted video player to "hide" YouTube IDs

**Phase to address:**
YouTube Privacy phase — document the threat model and accepted risk before starting implementation.

---

### Supabase Realtime — Missing `lesson_messages` Table RLS

**What goes wrong:**
When creating the `lesson_messages` table for in-lesson chat, a developer enables Realtime on the table and sets up the `postgres_changes` subscription. If RLS is enabled but there is no INSERT policy for students (or the policy is too permissive), two failure modes occur:
- **Too restrictive:** Students can receive messages via Realtime (SELECT succeeds) but cannot send messages (INSERT silently fails — no error is thrown to the client, the message just disappears)
- **Too permissive:** Students can INSERT messages into any lesson's chat, not just their enrolled lesson — allowing spam across all lessons

**How to avoid:**

```sql
-- lesson_messages RLS
ALTER TABLE lesson_messages ENABLE ROW LEVEL SECURITY;

-- Students can read messages for lessons in their enrolled courses
CREATE POLICY "enrolled_students_read_chat"
  ON lesson_messages FOR SELECT
  USING (
    is_approved_user() AND
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN enrollments e ON e.course_id = ch.course_id
      WHERE l.id = lesson_messages.lesson_id
        AND e.user_id = auth.uid()
    )
  );

-- Students can INSERT messages only for enrolled lessons
CREATE POLICY "enrolled_students_send_chat"
  ON lesson_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    is_approved_user() AND
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN enrollments e ON e.course_id = ch.course_id
      WHERE l.id = lesson_id AND e.user_id = auth.uid()
    )
  );

-- Teachers/admin can read all messages
CREATE POLICY "teacher_admin_read_all_chat"
  ON lesson_messages FOR SELECT
  USING (get_my_role() IN ('admin', 'teacher'));
```

**Also required:** Enable the `lesson_messages` table in Supabase Realtime configuration (Dashboard → Database → Replication → Tables). Tables must be explicitly added to the publication for `postgres_changes` to fire.

**Warning signs:**
- Messages sent from chat UI don't appear — no error, just no delivery
- Realtime subscription `onInsert` never fires
- Table not in the `supabase_realtime` publication

**Phase to address:**
In-Lesson Chat phase — write RLS before building chat UI. Test INSERT policy explicitly.

---

## v3.0 Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Pricing + Access Control | Existing enrolled students locked out when new tier policies drop permissive existing policies | Run backfill migration BEFORE changing any RLS policy; keep `legacy` tier |
| Pricing + Access Control | N+1 query on every lesson row due to package tier JOIN in RLS | Index `enrollments(user_id, course_id)` and `enrollments(package_id)` before deploying new policies |
| In-Lesson Chat | Realtime channel leak from missing cleanup in `useEffect` | Always return `() => supabase.removeChannel(channel)` from effect |
| In-Lesson Chat | Duplicate messages from Realtime reconnect | Deduplicate incoming events against local state by message `id` |
| In-Lesson Chat | Connection limit exhaustion on free tier (200 max) | Lazy-open channel only when Chat tab is active; close on tab hide |
| In-Lesson Chat | Missing Realtime publication for `lesson_messages` table | Manually add table to replication in Dashboard; test before deploying UI |
| Mock Exams | Answer exposure via Network tab | Separate answers into `exam_question_answers` table with admin-only SELECT policy |
| Mock Exams | Client-side timer bypassed | Store `started_at` server-side in `exam_attempts`; enforce cutoff at submission in DB function |
| Mock Exams | Double-submission via rapid clicks | `UNIQUE (user_id, exam_id)` constraint on `exam_attempts` table |
| Study Materials | PDFs in existing public assignments bucket — no enrollment check | Create separate private `study-materials` bucket with enrollment-gated RLS |
| Study Materials | Signed URLs expire mid-session | Generate signed URLs at page load with 1h expiry; regenerate on revisit |
| Admin UX (new form routes) | `/admin/courses/new` captured by `:courseSlug` param route | Order literal routes before param routes in React Router v6 definition |
| YouTube Privacy | Unlisted treated as "private" — video URLs shareable | Document threat model; unlisted + domain restriction is the accepted level of protection |
| YouTube Privacy | Expensive engineering to "hide" video IDs from browser | Accept that SPA clients always have access to embed URLs; focus on enrollment UX instead |

---

## v3.0 Migration Strategy for Existing Data

| Change | Risk | Migration Steps |
|--------|------|-----------------|
| Adding `package_tier` to `enrollments` | Existing students locked out | 1. Add column `DEFAULT 'legacy'`. 2. `UPDATE enrollments SET package_tier = 'legacy'`. 3. Add NOT NULL constraint. 4. Only THEN update RLS. |
| Adding `lesson_access_tier` to `lessons` | All lessons become locked if policy checks this column | Default new column to `'free'` (accessible to all enrolled students); only explicitly tag premium lessons after the system is live |
| Adding `exam_attempts` unique constraint | Students who started an exam during rollout may get duplicate rows | Run `DELETE FROM exam_attempts WHERE id NOT IN (SELECT MIN(id) FROM exam_attempts GROUP BY user_id, exam_id)` before adding the constraint |
| Enabling Realtime on `lesson_messages` | First time Realtime is used — no existing subscription patterns | Ship chat with Realtime publish-only mode first; add subscription second — validates the connection/cleanup pattern before broader rollout |

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
- [Supabase Realtime — Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase Realtime — Quotas and Limits](https://supabase.com/docs/guides/realtime/quotas)
- [Supabase Realtime channel cleanup — supabase-js removeChannel](https://supabase.com/docs/reference/javascript/removeChannel)
- [Supabase Storage — createSignedUrl](https://supabase.com/docs/reference/javascript/storagefilefromfilepath-createsignedurl)
- [YouTube embed privacy — youtube-nocookie.com](https://support.google.com/youtube/answer/171780)
- [YouTube video privacy settings — YouTube Help](https://support.google.com/youtube/answer/157177)
- [React Router v6 — Route matching order](https://reactrouter.com/en/main/route/route#index)
- [Supabase Realtime — Enable for specific tables (replication setup)](https://supabase.com/docs/guides/realtime/postgres-changes#replication-setup)

---

*Pitfalls research for: LMS (Supabase Auth + DB + Storage) on React/Vite SPA*
*v1.0 research: 2026-03-23 | v3.0 additions: 2026-05-03*
