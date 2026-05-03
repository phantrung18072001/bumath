# Project Research Summary

**Project:** BuMath v3.0 Platform Expansion
**Domain:** Async K-12 Math LMS — Vietnamese THCS (grades 7–9) + specialized exam prep
**Researched:** 2026-05-03
**Confidence:** HIGH

---

## Executive Summary

BuMath v3.0 is an incremental expansion of a live, production LMS — not a greenfield build. The
platform already ships auth (3-role: student/teacher/admin), courses, lessons, video playback,
handwritten submission upload, teacher grading, progress tracking, bell notifications, and a course
catalogue. All v1/v2 infrastructure is validated and in production. This milestone adds 7 distinct
feature areas: in-lesson chat, mock exam system, study materials library, pricing tiers + access
control, school navigator, admin full-page forms, and YouTube privacy strategy.

The recommended approach is minimal new dependencies (only `katex` + `react-katex` for LaTeX
rendering in mock exams), maximum reuse of existing Supabase capabilities (Realtime already
bundled, RLS for access control, Storage for PDFs), and a strict phase order dictated by one
non-negotiable constraint: **Pricing + Access Control must ship first**. The existing codebase
access-gates lessons client-side only (not via RLS). Adding pricing tiers without first fixing the
data model will either expose all content to unenrolled users or — worse — lock out every student
enrolled before the pricing system was introduced.

The primary risks in this milestone are all data-layer concerns: (1) the pricing migration must
grandfather existing enrollments before touching any RLS policy, (2) in-lesson chat Realtime
subscriptions must be cleaned up on unmount to avoid connection limit exhaustion on Supabase's free
tier, (3) mock exam answers must be stored in a separate RLS-restricted table (never co-located with
the questions students can SELECT), and (4) exam timing enforcement must live server-side
(`started_at` stored in DB), not in React `useState`. None of these risks are exotic — all have
documented prevention patterns in the research.

---

## Key Findings

### Recommended Stack

The base stack (React 18.3, Vite 5.4, TypeScript 5.8, Supabase 2.78.0, shadcn/ui, TanStack Query
5.83, React Hook Form 7.61, Zod 3.25, React Router 6.30) is unchanged and validated. **v3.0 adds
exactly one new library group:**

**Core technologies (unchanged):**
- **React 18.3 + Vite 5.4 + TypeScript 5.8:** SPA foundation — no changes
- **Supabase 2.78.0:** Auth + PostgreSQL + RLS + Storage + Realtime — all v3.0 features use capabilities already bundled; hold at 2.78.0 until Node upgrades to 20 LTS
- **TanStack Query 5.83:** Server state via `src/lib/api/{feature}.ts` pattern (codebase uses inline `useQuery`/`useMutation` in page files, not a separate hooks directory)
- **React Router 6.30:** Vietnamese URL pattern (`/dang-nhap`, `/khoa-hoc`, `/quan-tri`)
- **shadcn/ui + Radix UI + Tailwind:** Radix Tabs already installed; chat and materials tabs reuse it directly

**New addition for v3.0:**
- **`katex@0.16.45` + `react-katex@3.1.0`:** LaTeX math rendering — required for mock exam questions; KaTeX preferred over MathJax (synchronous render = no layout shift during timed exam, ~200KB vs ~900KB+ bundle, 95% LaTeX coverage is sufficient for grade 7–9 math)

**Explicitly NOT adding:** `react-pdf` (~4MB bundle; native browser handles PDFs on mobile better), `socket.io`/Firebase (Supabase Realtime is bundled), timer libraries (`useState` + `useEffect` is 10 lines), payment gateways (manual enrollment via admin, out of scope for this milestone).

---

### Expected Features

**v3.0 features (all 7 confirmed in scope):**

**Must have — table stakes for this milestone:**
- **Pricing + Access Control** — packages (1.5M–4M VND), admin assigns student to package, auto-enrollment trigger populates `enrollments`, pricing page visible to public
- **In-Lesson Chat** — student ↔ teacher text messaging scoped per lesson, flat (non-threaded), tabbed into LessonContent UI
- **Mock Exam System** — timed submission window (upload photo answers), countdown display, admin creates exam sessions with PDF problem sheet, teacher grades same as lesson submissions
- **Study Materials Library** — PDF repository by category × grade (midterm, entrance, HSG, chuyên PTNK/CNN/CSP/KHTN); admin uploads, enrolled students browse and download
- **School Navigator** — landing-page widget (static data, no DB); select target school → route to matching course
- **Admin Full-Page Forms** — migrate Add/Edit Chapter + Add/Edit Lesson from modal dialogs to dedicated page routes with breadcrumbs
- **YouTube Privacy** — switch to `youtube-nocookie.com` embed domain + URL parameter updates only (no code changes beyond `youtube.ts` utility)

**Should have / differentiators (available within milestone scope):**
- Unread message badge on Chat tab ("Chat (2)") — low complexity, high UX value for student engagement
- Past exam archive with scores per student — reuses existing grading query pattern
- "Mới nhất" badge on study materials — `created_at` sort, trivial

**Defer to v3.1+:**
- Auto-graded MCQ in exams — not feasible for handwritten math; explicitly deferred in PROJECT.md
- Leaderboard after exam closes — good motivation signal; defer until exam data accumulates
- In-browser PDF preview (react-pdf) — mobile native handling is better; add only if inline preview is requested
- Real-time push chat (WebSocket) — polling every 30s is sufficient for async teacher-student context; Realtime adds mobile reconnect complexity

**Never build (confirmed anti-features):**
- Payment gateway (VNPay/Stripe) — manual enrollment is the business model for this stage
- Video proctoring / lockdown browser — privacy concerns, wrong audience
- Student-uploaded study materials — confusion with submission flow; library is curated content only
- Group/class discussion board — moderation burden on small team; one-to-one teacher reply is the model

---

### Architecture Approach

v3.0 extends the existing React SPA (public/student/teacher-admin route groups) through Supabase
(Auth + PostgreSQL RLS + Storage + Realtime). The actual codebase pattern uses
`src/lib/api/{feature}.ts` for typed query functions with TanStack Query inlined in page components.
Seven new DB tables are needed; the most architecturally significant change is the **LessonContent
refactor from flat layout to tabbed layout** (Bài giảng / Chấm bài / Chat / Tài liệu), which is the
prerequisite for both in-lesson chat and study materials integration. Pricing uses an
auto-enrollment trigger approach — when a student is assigned a package, a trigger inserts the
matching `enrollments` rows automatically — keeping all existing RLS policies that already reference
`enrollments` intact without modification.

**Major components and new responsibilities:**

| Component | v3.0 Change |
|-----------|-------------|
| `LessonContent.tsx` | Refactored to Radix Tabs (4 tabs); existing content redistributed |
| `LessonChat.tsx` | New — Supabase Realtime subscription, lazy-open on tab activation |
| `ExamListPage.tsx` + `ExamTakingPage.tsx` | New — timed submission with server-side `started_at` |
| `StudyMaterialsPage.tsx` | New — category × grade filter, signed URL downloads |
| `SchoolNavigator.tsx` | New — static constants map, landing page section |
| `AddChapterPage.tsx` + `AddLessonPage.tsx` | New — page-route replacements for modal dialogs |
| `PricingPage.tsx` + Admin package UI | New — package display + admin assignment form |
| `App.tsx` | Extended — 8–10 new routes added |

**New DB tables:** `lesson_messages`, `exam_sessions`, `exam_submissions`, `study_materials`,
`packages`, `package_courses`, `user_packages`

**Key patterns to enforce:**
1. Supabase Realtime channels: always `return () => supabase.removeChannel(channel)` in `useEffect`; deduplicate by message `id`; lazy-open (only when Chat tab activates, not on lesson page mount)
2. Pricing migration order: add `packages` → backfill existing enrollments as `legacy` → THEN update RLS (never combine backfill + RLS change in one migration)
3. Exam answers: separate `exam_question_answers` table with student-blocking RLS; grade via `SECURITY DEFINER` DB function
4. Exam timing: `started_at` persisted to DB on exam start; submission handler validates `now() - started_at < duration`

---

### Critical Pitfalls

1. **Pricing migration locks out existing enrolled students** — Current lesson access is client-side only (confirmed from `20260427_13_catalogue_rls.sql`). Adding package-based RLS without first backfilling all existing `enrollments` rows with a `legacy` package creates a NULL JOIN that blocks every existing student. **Prevention:** Migration order is mandatory: (1) add `packages` table + `legacy` row, (2) add `package_id` to `enrollments` nullable, (3) backfill ALL existing rows, (4) add NOT NULL constraint, (5) only THEN update RLS policies. Never combine steps 1 and 5 in the same migration.

2. **Supabase Realtime channel leak in React StrictMode** — React 18 StrictMode double-mounts cause duplicate Realtime subscriptions. Each orphaned channel counts against the 200-connection free-tier limit (500 on Pro). Navigating between lessons without cleanup accumulates orphaned subscriptions. **Prevention:** Every `supabase.channel().subscribe()` must have a cleanup return (`supabase.removeChannel(channel)`). Deduplicate incoming messages by UUID. Open chat channel only when Chat tab is active, not on lesson page mount.

3. **Exam answers visible in browser Network tab** — A naive `SELECT * FROM exam_questions` exposes `correct_answer` to any student with DevTools open. **Prevention:** Store answers in a separate `exam_question_answers` table with a student-blocking SELECT policy (no SELECT policy = default deny). Grade via a `SECURITY DEFINER` function that compares answers server-side and returns only `{ score, correct_count, total }`.

4. **Client-side exam timer is trivially bypassed** — JavaScript timers can be paused in DevTools, reset by closing the tab, or ignored by simply not submitting. **Prevention:** Record `started_at` in DB on exam start. Submission handler validates `(now() - started_at) < exam.duration_minutes * interval '1 minute'`. React countdown timer is display-only, deriving remaining time from the DB's `started_at` timestamp.

5. **React Router v6 literal routes shadow param routes** — Adding `/admin/courses/new` BELOW `/admin/courses/:courseSlug` causes "new" to match as a course slug, rendering ChaptersPage for a nonexistent course. **Prevention:** Literal routes must appear BEFORE param routes at the same depth level in `App.tsx`.

6. **RLS enabled but no policies = silent empty results** — Every new table must have policies written in the same migration that enables RLS. Empty array responses look like frontend bugs; they're actually default-deny RLS silently blocking all access.

7. **Study materials in wrong bucket** — Using the existing `assignments` bucket for study material PDFs bypasses access control intent and shares storage allocation. **Prevention:** Create a separate private `study-materials` bucket; generate 1-hour signed URLs on each page load (do not cache in component state).

---

## Implications for Roadmap

Based on the dependency graph, risk analysis, and feature complexity, the recommended phase structure for v3.0 is 6 phases:

---

### Phase 1: Pricing + Access Control Foundation

**Rationale:** The CRITICAL blocker for the entire milestone. Current lesson access is client-side only. Any content gating (chat, materials, exams) builds on the package model. Existing enrolled students must be grandfathered before any RLS changes. This is the dependency anchor — all other phases can proceed in parallel once it lands.

**Delivers:**
- `packages`, `package_courses`, `user_packages` tables with seed data (6 defined packages)
- Auto-enrollment trigger: assigning a package automatically populates `enrollments` rows
- Backfill migration: all existing enrollments receive the `legacy` package (full access preserved)
- Admin UI: assign student to package, view student's active package on user management page
- Public pricing page (`/bang-gia`) with Vietnamese price formatting (1.500.000 đ)

**Addresses:** Feature 4 (Pricing + Access Control) from FEATURES.md
**Avoids:** Pricing migration backfill pitfall; RLS N+1 from package JOIN (add indexes on `user_packages(user_id, package_id)`); never combine backfill + RLS policy drop in the same migration

**Research flag:** ✅ Standard patterns — well-documented Supabase RLS approach

---

### Phase 2: Content Architecture — LessonContent Tabs + Admin Full-Page Forms

**Rationale:** LessonContent tabbed refactor is a structural prerequisite for in-lesson chat (Tab 3) and study materials tab (Tab 4). Admin full-page forms are a pure routing refactor with no DB changes — natural to co-locate with the LessonContent restructure since both are architectural plumbing that unblocks downstream features.

**Delivers:**
- `LessonContent.tsx` refactored: 4-tab layout using existing Radix Tabs (Bài giảng / Chấm bài / Chat placeholder / Tài liệu placeholder)
- `AddChapterPage.tsx`, `EditChapterPage.tsx`, `AddLessonPage.tsx`, `EditLessonPage.tsx` — dedicated page routes with breadcrumbs
- `App.tsx` updated: new admin routes added with literal routes before param routes
- `ChaptersPage`, `LessonsPage` — "Add" buttons changed from dialog-open to `navigate()`

**Uses:** Radix Tabs (already installed), React Router v6, existing Zod schemas extracted from modal dialogs
**Avoids:** React Router v6 literal/param route ordering pitfall; existing modal Zod logic extracted to shared hooks before modal components are removed

**Research flag:** ✅ Standard patterns — React Router v6 and Radix Tabs are well-documented

---

### Phase 3: Study Materials Library + School Navigator

**Rationale:** Both are content-discovery features with no Realtime concerns. Study Materials slot into the Tab 4 placeholder from Phase 2. School Navigator is a zero-DB landing-page widget — lowest complexity in the milestone. Shipping both together makes sense since they serve the same audience (prospective and enrolled students discovering content).

**Delivers:**
- `study_materials` table + `study-materials` private Storage bucket with its own RLS
- Admin upload form (`/quan-tri/tai-lieu`) + material management table
- Student browse page (`/tai-lieu`) with category × grade filter tabs, file size display, signed URL download links
- Lesson "Tài liệu" tab (Tab 4) showing materials filtered by lesson's course grade
- `SchoolNavigator.tsx` — static `SCHOOL_COURSE_MAP` constants, landing page section, 2-column card grid on mobile

**Uses:** Existing Supabase Storage patterns (same as submissions), shadcn/ui tabs and cards, react-router navigate
**Avoids:** Separate bucket from `assignments` (mandatory); 1-hour signed URL expiry regenerated on page load (not cached); category taxonomy finalized at schema creation time; RLS checks enrollment/package before signed URL generation

**Research flag:** ✅ Standard patterns — Storage + signed URLs already established in codebase

---

### Phase 4: In-Lesson Chat

**Rationale:** Requires the tabbed LessonContent from Phase 2 (Tab 3 slot). This is the highest-risk new pattern in the milestone — it introduces Supabase Realtime subscriptions for the first time in the codebase. Isolating it in its own phase allows the cleanup pattern, lazy-open behavior, and deduplication to be established cleanly before any other Realtime code is written.

**Delivers:**
- `lesson_messages` table with `REPLICA IDENTITY FULL` (required for Realtime events)
- `LessonChat.tsx`: message list, input box, send button, auto-scroll to bottom, empty state, timestamp display
- Realtime subscription: lazy-open on Chat tab activation, `removeChannel` cleanup on unmount, message deduplication by UUID
- Unread badge on Chat tab ("Chat (2)") via unread count query
- Teacher view: see all messages per lesson; reply from lesson page
- Bell notification reuse: student notified when teacher replies

**Uses:** `supabase.channel()` Realtime API (bundled in 2.78.0), existing bell notification system, existing enrollment queries for RLS scope
**Avoids:** CRITICAL channel leak (cleanup on every unmount without exception); lazy channel opening (Chat tab must be active); deduplication by message ID; visibility-based pause for background tabs

**Research flag:** ⚠️ Needs careful implementation — Realtime cleanup patterns are new to this codebase; test with React StrictMode enabled; verify connection count in Supabase Dashboard after deployment

---

### Phase 5: Mock Exam System

**Rationale:** The most architecturally complex feature in the milestone — server-side timing, answer separation, DB function grading. Completely self-contained (no cross-dependencies with chat or materials). KaTeX dependency lands here. Placing it after Phase 4 means the team has resolved Realtime complexity before tackling exam complexity.

**Delivers:**
- `yarn add katex react-katex` (the only new dependency in the entire v3.0 milestone)
- `exam_sessions` table; `exam_submissions` table; `exam_question_answers` in a separate student-restricted table
- DB function (SECURITY DEFINER) for server-side answer grading
- Student flow: exam list (`/thi-thu`) → exam page (problem PDF + countdown + photo upload) → confirmation → past results
- Admin flow: create exam session (title, grade, start/end date, problem PDF), grading queue extension
- Countdown in React: derives remaining time from DB `started_at`, auto-submits at 0
- Server-side enforcement: submission handler rejects if `now() - started_at > duration`

**Uses:** KaTeX (`<InlineMath>` / `<BlockMath>`), existing `compressImage` + upload patterns from submissions, existing grading page UI pattern
**Avoids:** CRITICAL exam answer separation (separate restricted table, never co-locate with question SELECT); CRITICAL server-side timer enforcement; UNIQUE constraint on `(exam_session_id, user_id)` prevents re-attempts

**Research flag:** ⚠️ Needs design decision — DB function vs Edge Function for grading; resolve before schema is finalized; verify answer-table RLS with student role before any exam goes live

---

### Phase 6: YouTube Privacy + Polish

**Rationale:** Trivial implementation (URL parameter and utility function change only). Ships last as a natural close for the milestone, confirming `vercel.json` CSP headers are correct for the new embed domain.

**Delivers:**
- `youtube.ts` utility: `youtube.com/embed/ID` → `youtube-nocookie.com/embed/ID?rel=0&modestbranding=1`
- `vercel.json` CSP: `frame-src` updated to include `https://www.youtube-nocookie.com`
- Documented threat model: unlisted + nocookie + domain embed restriction is the accepted ceiling (no proxy server)

**Avoids:** Building a video proxy server (YouTube ToS violation + overkill for casual URL-sharing threat model); spending engineering time beyond the URL parameter change

**Research flag:** ✅ Skip deeper research — trivial URL parameter change, no architectural implications

---

### Phase Ordering Rationale

- **Pricing first:** Only feature that can cause a catastrophic regression (locking out existing students) if introduced after other features are gated; the backfill migration must run on production DB before any RLS modification
- **Architecture second:** LessonContent tabs unblock two downstream features; Admin Forms are pure refactor with no DB risk; clean together
- **Materials before Chat:** Materials has no Realtime complexity and validates the new tab structure under normal conditions before Chat introduces the highest-risk new pattern
- **Mock Exams before YouTube:** Exams are complex but self-contained; YouTube is trivial; natural final delivery order
- **YouTube Privacy last:** Zero risk, zero dependencies, natural milestone close

### Research Flags

Phases needing careful implementation attention during planning:
- **Phase 1 (Pricing):** Backfill migration order is rigid — test with seeded enrolled students in a dev branch before executing against production DB; never skip the backfill step
- **Phase 4 (Chat):** Realtime subscription management is new to codebase; establish cleanup pattern + test with React StrictMode before building full chat UI; monitor connection count in Supabase Dashboard post-deploy
- **Phase 5 (Mock Exams):** DB function vs Edge Function grading architecture needs decision before schema is finalized; verify answer table RLS by attempting student-role SELECT in SQL editor before any exam goes live

Phases with standard patterns (safe to proceed without deep research):
- **Phase 2 (Admin Forms + Tabs):** React Router v6 + Radix Tabs are well-documented; existing codebase patterns apply directly
- **Phase 3 (Materials + Navigator):** Supabase Storage + signed URLs already used in submissions flow; same patterns; School Navigator is static data
- **Phase 6 (YouTube):** URL parameter change only, no architecture involved

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified via direct `node_modules` inspection, `package.json`, `npm info` commands; only `katex`/`react-katex` are new |
| Features | HIGH | Based on PROJECT.md milestone definition + actual codebase inspection; v3.0 feature list is confirmed and bounded |
| Architecture | HIGH | Verified from actual codebase (`src/lib/api/`, `src/components/student/`, migration files); not theoretical patterns |
| Pitfalls | HIGH | Based on direct codebase inspection of existing RLS policies + Supabase documented behaviors; pricing migration risk confirmed from actual migration file `20260427_13_catalogue_rls.sql` |

**Overall confidence: HIGH**

High confidence across all areas reflects that this research was done against the actual live
codebase and verified library versions — not hypothetical patterns. The risks are well-understood
and all have documented prevention strategies.

### Gaps to Address

- **Package → Course content mapping:** The specific courses included in each package tier need to be seeded by admin before the assignment UI is useful. This is a data decision (not a code decision) — needs confirmation from the product owner before Phase 1 ships.
- **Exam grading: DB function vs Edge Function:** Research recommends a `SECURITY DEFINER` PostgreSQL function for server-side answer validation. If scoring logic grows complex (partial credit, weighted questions), migration to an Edge Function may be warranted. Document the choice explicitly at Phase 5 planning.
- **Supabase plan tier before Phase 4:** With chat going live in Phase 4, the free-tier 200-connection limit and 7-day inactivity pause become production risks. Evaluate upgrade to Supabase Pro ($25/month) before Phase 4 ships to production.
- **Admin LaTeX authoring:** Admin must enter raw LaTeX strings for exam questions in v3.0 (no WYSIWYG editor). Admin training on basic LaTeX syntax (fractions `\frac{}{}`, square roots `\sqrt{}`, polynomials) should be included in deployment planning for Phase 5.

---

## Sources

### Primary (HIGH confidence — official docs + codebase inspection)
- Actual codebase: `src/lib/api/`, `src/components/student/`, `supabase/migrations/` — direct inspection underpinning all architecture analysis
- `supabase/migrations/20260427_13_catalogue_rls.sql` — confirmed client-side-only lesson access gate
- [Supabase Row Level Security — Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Custom Claims & RBAC — Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase Managing User Data — Official Docs](https://supabase.com/docs/guides/auth/managing-user-data)
- [Storage Access Control — Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control)
- [RLS Performance Best Practices — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- KaTeX official docs (katex.org) — synchronous render model, bundle size, LaTeX coverage
- `npm info react-katex`, `npm info katex`, `cat node_modules/@supabase/supabase-js/package.json` — version verification

### Secondary (MEDIUM confidence — community sources, multiple agree)
- [How to Use Supabase with TanStack Query](https://makerkit.dev/blog/saas/supabase-react-query) — query/hook separation pattern
- [React Supabase Auth Template with Protected Routes](https://dev.to/mmvergara/react-supabase-auth-template-with-protected-routes-41ib) — ProtectedRoute pattern
- [7 Best K-12 LMS 2025 — Teachfloor](https://www.teachfloor.com/blog/k-12-lms) — feature landscape
- [Moodle Assignment Grading UX — MoodleDocs](https://docs.moodle.org/dev/Assignment_Grading_UX) — grading queue patterns
- [E-learning in Vietnam market — NALS Solutions](https://nals.vn/en/blog/2023/01/03/e-learning-in-vietnam-a-potential-market-for-investors/) — market context

### Tertiary (LOW confidence — inference or single source)
- Vietnamese THCS mobile device usage patterns — inferred from general Vietnam digital access statistics; test on real devices
- YouTube domain restriction effectiveness — based on YouTube documentation; actual bypass resistance requires production monitoring

---

*Research completed: 2026-05-03*
*Ready for roadmap: yes*
