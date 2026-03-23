# Project Research Summary

**Project:** BuMath LMS
**Domain:** Async K-12 Math LMS — Vietnamese middle school (grades 7–9) + specialized exam prep (ôn thi chuyên Toán)
**Researched:** 2026-03-23
**Confidence:** HIGH

## Executive Summary

BuMath is being evolved from a marketing landing page into a full async LMS by adding a Supabase backend to the existing React/Vite SPA. The recommended approach is a three-role system (student / teacher / admin) backed by Supabase Auth, PostgreSQL with Row Level Security, and Supabase Storage for student photo submissions. The core learning loop is: admin creates courses and lessons (YouTube embeds + assignment PDFs), students watch and submit handwritten work as photos, teachers grade with a score and text comment, students receive email notification. This handwritten-submission-plus-personal-feedback model is the product's primary differentiator against generic LMS tools like Google Classroom.

The existing stack (React 18, TypeScript, Vite, shadcn/ui, TanStack Query v5, React Hook Form, React Router v6) slots cleanly with the Supabase JS client. No framework change is needed. The primary engineering additions are: Supabase singleton client, AuthContext with role decoding from JWT claims, ProtectedRoute wrapper, a layered `queries/` + `hooks/` pattern for data access, and a private Supabase Storage bucket for submissions. The deployment must migrate from GitHub Pages to Vercel before any authenticated routes ship — GitHub Pages cannot serve SPA deep links.

The biggest risks are all Supabase-specific and well-understood: RLS policy infinite recursion on the profiles table, storing roles in user-writable metadata, the GitHub Pages routing gap, and Supabase free-tier project pausing in production. All of these are preventable if addressed in the right phase. Security must be built in from the start (RLS, private storage bucket, service role key never in frontend) — retrofitting these is high-cost and has caused public data exposure incidents in similar Supabase-backed products.

---

## Key Findings

### Recommended Stack

The existing tech stack requires no replacement. Three packages are added: `@supabase/supabase-js@2.78.0` (pinned because 2.79.0+ dropped Node 18 — the project currently runs Node 18.20.8), `react-dropzone` for the photo upload UI, and `supabase` CLI as a dev dependency for schema migrations and TypeScript type generation. The auth-ui-react package is optional and useful only for rapid prototyping; custom shadcn/ui forms are preferred for full Vietnamese language control.

**Core technologies:**
- `@supabase/supabase-js@2.78.0`: Primary backend client (auth, database, storage) — pinned to avoid Node 18 breakage; upgrade Node to 20 LTS before upgrading this package
- Supabase Auth: Email/password auth with session persistence — standard SPA pattern via React Context + `onAuthStateChange`; do NOT use `@supabase/ssr` (SSR-only) or `@supabase/auth-helpers` (deprecated)
- Supabase PostgreSQL + RLS: All application data; roles enforced via custom access token hook injecting `user_role` into JWT claims
- Supabase Storage (private bucket): Student assignment photo uploads; RLS on `storage.objects` enforces per-user folder isolation
- TanStack Query v5: Wraps Supabase calls; always use `.throwOnError()` so TanStack error state activates correctly
- Vercel: Deployment target replacing GitHub Pages; required for SPA route fallback

### Expected Features

Research identified three tiers. The MVP must ship all table stakes; differentiators add competitive value without blocking launch.

**Must have (table stakes — v1 launch):**
- Student email/password registration with admin approval gate (pending → approved)
- Persistent login session + logout
- Role-based access: student / teacher / admin
- Admin: create/edit courses (grade 7, 8, 9, chuyên) and lessons (YouTube embed + description + assignment PDF)
- Student: enrolled course listing, lesson view with YouTube embed, lesson completion marking, course progress bar
- Student: photo upload for assignment submission; assignment status display (chưa nộp / đã nộp / đã chấm)
- Teacher: grading queue of ungraded submissions; enter score + text comment
- Student: view own grade and teacher comment
- Email notification to student when grade is published (Supabase Edge Function)
- Mobile-first responsive layout (375px viewport; 48px minimum tap targets; camera-direct upload flow)
- Full Vietnamese UI

**Should have (competitive differentiators — v1.x after validation):**
- Teacher comment templates / saved replies — speeds up repetitive math feedback
- Ordered lesson sequence lock — prevents skipping prerequisite concepts
- Assignment deadline + late submission flag — critical for ôn thi chuyên cohort
- Submission history (multiple attempts) — lets students resubmit after feedback
- Student dashboard "what to do next" CTA — reduces navigation friction for young users

**Defer (v2+):**
- Inline image annotation on submissions (Fabric.js/Konva — high complexity; validate whether text comments suffice first)
- Course enrollment by class cohort (useful at >50 students)
- Gamification / streak tracking (only after retention data shows drop-off)
- Parent portal (add only after core product is stable)
- Advanced analytics dashboard

**Anti-features (do not build in v1):**
- Live video chat / WebRTC sessions
- Auto-graded MCQ quizzes (undermines the handwritten-work differentiator)
- Payment / course purchase flow
- Social discussion features (moderation burden on small team)

### Architecture Approach

The architecture is a React SPA with a clean three-layer frontend: route protection (`AuthContext` + `ProtectedRoute`), server state management (TanStack Query wrapping Supabase), and a singleton Supabase client. Data access is split into `src/queries/` (pure Supabase async functions, testable without React) and `src/hooks/` (TanStack Query wrappers). This separation keeps query logic unit-testable and avoids the N+1 and stale cache bugs common in monolithic component-level queries.

**Major components:**
1. `src/lib/supabase.ts` — singleton client; one instance for the entire app; never instantiate in components
2. `src/contexts/AuthContext.tsx` — session, decoded role from JWT, account status; wraps entire app
3. `src/components/ProtectedRoute.tsx` — blocks unauthenticated/wrong-role/pending-approval access; uses React Router v6 `<Outlet>` pattern
4. `src/queries/` — pure Supabase query functions per domain (courses, lessons, submissions, profiles)
5. `src/hooks/` — TanStack Query wrappers calling `queries/`; one hook file per domain
6. `src/lib/storage.ts` — upload and signed URL helpers for the `submissions` private bucket
7. Custom Access Token Auth Hook (Supabase Dashboard) — injects `user_role` into every JWT so RLS policies never require a table join to check roles

**Database:** 6 tables: `profiles`, `courses`, `lessons`, `assignments`, `enrollments`, `lesson_progress`, `submissions`. All have RLS enabled. Progress percentage is computed on-the-fly via JOIN (not stored) — acceptable at MVP scale, upgrade path is a materialized view.

**Route structure:** Public (`/`, `/login`, `/register`, `/pending-approval`) + Student routes (protected, requires approved status) + Teacher routes + Admin routes.

### Critical Pitfalls

1. **RLS infinite recursion on `profiles`** — Writing a SELECT policy that checks `role` via a subquery on `profiles` itself causes infinite recursion (PostgreSQL error 500). Prevention: use a `SECURITY DEFINER` function that bypasses RLS, or read `user_role` from JWT claims (`auth.jwt()->>'user_role'`). Address in: Auth + DB schema phase.

2. **user_metadata is user-writable — never use for roles** — Any user can call `supabase.auth.updateUser({ data: { role: 'admin' } })` and gain admin access if RLS policies read from `user_metadata`. Prevention: store role in `public.profiles.role` (admin-only RLS on update) and inject into JWT via custom access token hook. Address in: Auth phase before any RLS policies are written.

3. **GitHub Pages + BrowserRouter = 404 on all deep links** — GitHub Pages returns 404 for any URL that isn't the root index.html. Any direct navigation to `/courses/123` breaks. Prevention: migrate to Vercel with SPA rewrite (`vercel.json`) before merging any LMS routes. Remove the `base: '/bumath/'` Vite config after migration. Address in: Deployment phase, before auth work ships.

4. **Email confirmation redirect to localhost in production** — Supabase Site URL defaults to `localhost`. Confirmation emails sent to real users point to a non-existent URL. Prevention: set Site URL to the production domain in Supabase Dashboard immediately after project creation; add localhost to Redirect URLs allowlist for dev. Address in: Auth phase setup.

5. **Supabase free tier pauses after 7 days of inactivity** — Production outage with no automated recovery. Prevention: upgrade to Pro ($25/month) before inviting real students, or set up a scheduled heartbeat ping. Address in: Deployment phase.

6. **RLS enabled with no policies = silent empty results** — Supabase returns empty arrays (not errors) when RLS blocks access with no policies. Prevention: write at least a read policy immediately after enabling RLS on any table. Use the Supabase policy tester during development. Address in: DB schema phase.

---

## Implications for Roadmap

Based on the feature dependency tree and pitfall-to-phase mapping from research, a 5-phase structure is recommended. Each phase must be fully releasable before the next begins.

### Phase 1: Foundation + Deployment Migration
**Rationale:** GitHub Pages cannot serve SPA deep links — this blocks every subsequent phase. Migrating to Vercel and wiring up the Supabase client establishes the infrastructure all other work depends on. Node version must also be assessed here (Node 18 vs. upgrade to 20 for Supabase SDK flexibility).
**Delivers:** Vercel deployment with SPA routing, `src/lib/supabase.ts` singleton, `.env.local` setup, Supabase CLI configured, TypeScript types generated from DB schema.
**Addresses:** GitHub Pages pitfall (Pitfall 3), email redirect localhost pitfall (Pitfall 4 — set Site URL here), Node/SDK version pin.
**Does not need research phase:** Vercel SPA deployment and Supabase client setup are standard, well-documented patterns.

### Phase 2: Auth + Roles + Admin Approval
**Rationale:** Every other feature depends on knowing who the user is and what role they have. The admin approval gate must exist before course content is accessible. RLS policies must be written correctly the first time — retrofitting security is costly.
**Delivers:** Registration, login, logout, persistent session, `AuthContext` with JWT role decoding, `ProtectedRoute` wrapper, `profiles` table with custom access token hook, admin user management UI (approve/suspend accounts), `/pending-approval` screen.
**Addresses:** user_metadata role pitfall (Pitfall 2), RLS infinite recursion (Pitfall 1), RLS enabled + no policies pitfall (Pitfall 6).
**Avoids:** Do not use `@supabase/auth-helpers` (deprecated) or `@supabase/ssr` (SSR-only). Do not store role in `user_metadata`. Do not expose service role key via `VITE_` prefix.
**Does not need research phase:** Auth hook pattern, profiles table schema, and ProtectedRoute pattern are all documented in STACK.md and ARCHITECTURE.md with HIGH confidence.

### Phase 3: Course + Lesson Management (Admin + Teacher)
**Rationale:** Admin must be able to create courses, lessons, and assignments before students can access any content. This phase builds the content management side of the platform.
**Delivers:** `courses`, `lessons`, `assignments` DB tables with RLS; admin CRUD UI for courses and lessons (YouTube ID, sort order, assignment file upload to `course-assets` bucket); admin enrollment management (manually enroll students in courses); teacher lesson management.
**Addresses:** Feature: "Admin: create/edit courses and lessons"; "Admin: attach assignment to lesson."
**Uses:** Supabase Storage `course-assets` bucket (admin-only upload RLS); TanStack Query mutations with cache invalidation.
**Does not need research phase:** All patterns documented in ARCHITECTURE.md.

### Phase 4: Student Learning Experience + Submission Flow
**Rationale:** Once content exists, the core student experience can be built. Photo submission is the product's primary differentiator and requires careful mobile UX work (camera trigger, compression, HEIC handling). Progress tracking depends on lesson completion which depends on lessons existing.
**Delivers:** Student course listing (enrolled only), lesson view with YouTube embed, lesson completion marking, course progress bar (computed from `lesson_progress`), photo upload submission with client-side compression (target ≤1MB), assignment status display (chưa nộp / đã nộp / đã chấm), `enrollments` + `lesson_progress` + `submissions` DB tables with RLS.
**Addresses:** Mobile UX constraints (48px tap targets, camera-direct upload, HEIC conversion, image compression — see PITFALLS.md UX section); storage private bucket RLS; file type validation.
**Avoids:** No image compression (Pitfall — exhausts storage and fails on slow mobile), HEIC incompatibility (broken images in grading view), public storage bucket for submissions.
**Needs research phase:** Client-side image compression library selection (`browser-image-compression` vs `react-image-file-resizer`) and HEIC-to-JPEG conversion (`heic2any`) — worth a quick research pass to confirm bundle size and React 18 compatibility before implementation.

### Phase 5: Grading + Notification Loop
**Rationale:** The grading workflow closes the feedback loop that is the product's core value. Email notification makes the async loop functional — without it, students don't know to check for grades. This phase validates the entire product promise.
**Delivers:** Teacher grading queue (ungraded submissions list with signed URL photo view), score + text comment entry, `graded_at` / `graded_by` / `status='graded'` fields, student grade view, email notification via Supabase Edge Function triggered on `graded_at` update.
**Addresses:** Feature: "Teacher grading queue"; "Student: view grade + comment"; "Email notification on grading."
**Avoids:** Supabase Realtime for notifications (unnecessary complexity for async product — email on grade publish is sufficient); double submissions (check for existing submission before insert).
**Needs research phase:** Supabase Edge Function email delivery (Resend vs. SendGrid vs. Supabase built-in SMTP) — options and limits vary and warrant a quick research pass before implementation.

### Phase Ordering Rationale

- Deployment migration is Phase 1 because GitHub Pages silently breaks every auth redirect and deep link. Building auth on broken hosting wastes effort.
- Auth is Phase 2 because it is a prerequisite for every other feature per the dependency tree in FEATURES.md (auth → course management → student experience → grading).
- Content management (Phase 3) precedes student experience (Phase 4) because the assignment and enrollment FK constraints require course/lesson rows to exist before student queries can return data.
- Grading (Phase 5) is last because it requires submissions from Phase 4; the teacher grading queue is meaningless without student submissions.
- The free-tier pause risk (PITFALLS.md Pitfall 5) should be addressed at the end of Phase 1 or Phase 2 — decide on Pro upgrade or heartbeat before inviting real students.

### Research Flags

Phases likely needing a `/gsd:research-phase` call during planning:
- **Phase 4 (Submission Flow):** Client-side image compression library (`browser-image-compression` vs alternatives) and HEIC conversion — confirm bundle size, React 18 compatibility, and Supabase Storage MIME type enforcement options.
- **Phase 5 (Grading + Notification):** Supabase Edge Function email delivery options — Resend, SendGrid, or Supabase's built-in SMTP; understand free-tier limits and setup complexity before committing to an approach.

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 1 (Deployment):** Vercel SPA setup and Supabase project initialization are standard and covered in official docs.
- **Phase 2 (Auth + Roles):** The custom access token hook, profiles table, and ProtectedRoute pattern are documented in STACK.md and ARCHITECTURE.md with HIGH confidence from official Supabase sources.
- **Phase 3 (Content Management):** Admin CRUD with Supabase + TanStack Query follows established patterns fully documented in research.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core Supabase SDK, auth, storage patterns sourced from official Supabase docs. Node 18 pin confirmed from npm changelog. Integration patterns (TanStack Query + Supabase) from makerkit.dev — MEDIUM confidence, verified against TanStack Query v5 docs. |
| Features | HIGH (table stakes) / MEDIUM (Vietnam-specific UX) | LMS table stakes sourced from Canvas, Google Classroom, Moodle documentation. Vietnam market specifics (mobile device distribution, 4G/3G split) from single industry report — directionally correct but not verified against primary data. |
| Architecture | HIGH | DB schema, RLS patterns, auth hook, storage RLS all sourced from official Supabase documentation. Frontend patterns (AuthContext, ProtectedRoute, queries/hooks separation) from MEDIUM-confidence community sources, verified consistent with official Supabase SPA guidance. |
| Pitfalls | HIGH | RLS recursion and user_metadata security issues confirmed from official Supabase sources and active GitHub issue threads. GitHub Pages limitation is universal and well-documented. Free-tier pause documented by Supabase and community. |

**Overall confidence:** HIGH

### Gaps to Address

- **Node version decision:** The project runs Node 18.20.8. Either pin `@supabase/supabase-js` to 2.78.0 (immediate workaround) or upgrade to Node 20 LTS before starting Phase 2. The research recommends Node 20 upgrade as the cleaner path — confirm this is acceptable given the CI/CD setup.
- **Email notification provider:** Supabase Edge Functions support multiple email providers (Resend, SendGrid, Supabase SMTP). The MVP requires email on grade publish. The choice of provider was not researched in depth — needs a Phase 5 research pass.
- **Image compression library:** `browser-image-compression` is referenced in PITFALLS.md as the recommended approach but was not benchmarked against `react-image-file-resizer`. HEIC conversion via `heic2any` needs bundle-size verification before Phase 4.
- **Vietnam mobile reality (unverified):** The 70% smartphone access statistic is from a single industry report (NALS Solutions, 2023). The design decisions (mobile-first, 48px targets, 3-tap depth) remain correct regardless of the exact percentage, but the specific figure should not be used in product metrics without primary data.

---

## Sources

### Primary (HIGH confidence)
- [Supabase Row Level Security — Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Custom Claims & RBAC — Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase Managing User Data — Official Docs](https://supabase.com/docs/guides/auth/managing-user-data)
- [Storage Access Control — Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control)
- [RLS Performance Best Practices — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [@supabase/supabase-js on npm](https://www.npmjs.com/package/@supabase/supabase-js) — Node 18 drop confirmed in 2.79.0
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Infinite recursion in profiles RLS policy — GitHub Discussions](https://github.com/supabase/supabase/discussions/1138)

### Secondary (MEDIUM confidence)
- [How to Use Supabase with TanStack Query (React Query v5) — Makerkit](https://makerkit.dev/blog/saas/supabase-react-query) — throwOnError pattern, queryKey conventions
- [React Supabase Auth Template with Protected Routes — dev.to](https://dev.to/mmvergara/react-supabase-auth-template-with-protected-routes-41ib)
- [7 Best K-12 LMS 2025 — Teachfloor](https://www.teachfloor.com/blog/k-12-lms) — feature landscape
- [Canvas vs Google Classroom 2025 — Teachfloor](https://www.teachfloor.com/blog/canvas-vs-google-classroom) — competitor feature comparison
- [Mobile-First Learning — EduTech Global](https://edutech.global/mobile-first-learning-next-generation/)

### Tertiary (LOW confidence)
- [E-learning in Vietnam market — NALS Solutions](https://nals.vn/en/blog/2023/01/03/e-learning-in-vietnam-a-potential-market-for-investors/) — Vietnam mobile usage statistics; 2023 data, single source

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*
